import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import sharp from "sharp";

const conn = mongoose.createConnection(process.env.MONGO_URI);

let gridfsBucket;
conn.once('open', () => {
    const db = conn.db;
    gridfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
    console.log('✅ GridFS initialized');
});
conn.on('error', (err) => {
    console.error('❌ GridFS connection error:', err);
});

// Use memory storage to access file buffers
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Allowed: JPEG, PNG, MP4, PDF'));
        }
        cb(null, true);
    }
});

const uploadFile = async (req, res) => {
    try {
        if (!gridfsBucket) throw new Error('GridFS not initialized');
        if (!Array.isArray(req.files) || req.files.length === 0) {
            return res.status(404).json({ msg: 'No file found' });
        }

        const file = req.files[0];
        const tag = req.body.tags.split(",");
        const name = req.body.name ;
        const date = req.body.date ;
        console.log("tagggg : ",tag);
        const isImage = ['image/jpeg', 'image/png'].includes(file.mimetype);
        const uniqueFilename = `${Date.now()}-${file.originalname}`;

        let bufferToStore = file.buffer;
        let avifFilename = null;

        if (isImage) {
            avifFilename = `${Date.now()}-${file.originalname.split('.').slice(0, -1).join('.')}.avif`;
            bufferToStore = await sharp(file.buffer)
                .toFormat("avif", { quality: 50 }) // Convert to AVIF with compression
                .toBuffer();
        }

        // Upload the (converted) file to GridFS
        const uploadStream = gridfsBucket.openUploadStream(uniqueFilename, {
            contentType: isImage ? 'image/avif' : file.mimetype,
            metadata: {
                originalName: file.originalname,
                uploadDate: new Date(),
                size: bufferToStore.length,
                convertedToAvif: isImage,
                tag : tag ,
                name :name ?? null,
                date : date ?? null

            },
        });

        uploadStream.end(bufferToStore);

        uploadStream.on('finish', () => {
            res.status(200).json({
                contentType: isImage ? 'image/avif' : file.mimetype,
                uniqueFilename: isImage ? avifFilename : uniqueFilename,
                metadata: {
                    originalName: file.originalname,
                    uploadDate: new Date(),
                    size: bufferToStore.length,
                    convertedToAvif: isImage,
                    tag : tag ,
                    name :name ?? null,
                    date : date ?? null
                },
            });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
};

const downloadFile = async (req, res) => {
    try {
        if (!gridfsBucket) throw new Error('GridFS not initialized');
        const filename = req.params.filename;
        const files = await gridfsBucket.find({ filename }).toArray();

        if (!files.length) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = files[0];

        res.set({
            'Content-Type': file.contentType,
            'Content-Disposition': `inline; filename="${file.metadata?.originalName}"`,
            'Content-Length': file.length.toString(),
        });

        console.log("Size:", file.length.toString());

        const downloadStream = gridfsBucket.openDownloadStreamByName(filename);
        downloadStream.pipe(res).on('error', (err) => {
            console.error('Download error:', err);
            res.status(500).json({ message: 'Download failed', error: err.message });
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Failed to download file', error: error.message });
    }
};

const deleteFile = async (req, res) => {
    try {
        if (!gridfsBucket) throw new Error('GridFS not initialized');
        const filename = req.params.filename;
        const files = await gridfsBucket.find({ filename }).toArray();

        if (!files.length) return res.status(404).json({ message: 'File not found' });

        await gridfsBucket.delete(files[0]._id);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'File deletion failed', error: error.message });
    }
};

const listFiles = async (req, res) => {
    try {
        if (!gridfsBucket) throw new Error('GridFS not initialized');
        const files = await gridfsBucket.find().toArray();

        const fileList = files.map((file) => ({
            id: file._id,
            filename: file.filename,
            originalName: file.metadata?.originalName,
            size: file.length,
            uploadDate: file.uploadDate,
            contentType: file.contentType,
            convertedToAvif: file.metadata?.convertedToAvif || false,
            tag : file.metadata?.tag ,
            name :file.metadata?.name ,
            date : file.metadata?.date 
        }));

        return res.status(200).json({ data: fileList, len: fileList.length });
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ message: 'Failed to retrieve files', error: error.message });
    }
};

const test = (req,res)=>{
    const tag = req.body.tags.split(",");
    const name = req.body.name ;
    const date = req.body.date ;
    console.log("tag jaa",date);
    return res.status(200).json({tag,name,date})
}

const listFile = async (req,res)=>{
    if (!gridfsBucket) throw new Error('GridFS not initialized');
    const tags = req.body.tag
    if(!(Array.isArray(tags) && tags.length>=1)){
        return res.status(404).json({});
    }

    if(!(tags.every(tag => typeof tag === 'string' && tag.trim().length >0))){
        return res.status(400).json({error:"Tag must be not empty and string"})
    }
    const files = await gridfsBucket.find({"metadata.tag":{ $in: tags } }).project({ _id:0 ,filename: 1,"metadata.name":1,"metadata.date":1,"metadata.tag":1 }) .toArray();
    return res.status(200).json({files})
}

export { uploadFile, downloadFile, deleteFile, listFiles, upload,test,listFile };
