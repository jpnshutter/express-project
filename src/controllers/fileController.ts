import multer from 'multer';
import mongoose from 'mongoose';
import { Db } from 'mongodb';
import { GridFSBucket } from 'mongodb';
const conn = mongoose.createConnection(process.env.MONGO_URI as string);
import { Request, Response, NextFunction } from 'express';
let gridfsBucket: GridFSBucket;

conn.once('open', () => {
  const db: Db  = conn.db!;
  gridfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
  console.log('✅ GridFS initialized');
});
conn.on('error', (err) => {
  console.error('❌ GridFS connection error:', err);
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req:Request, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
          return cb(new Error('Invalid file type. Allowed: JPEG, PNG, MP4, PDF'));
      }
      cb(null, true);
  }
});

const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!gridfsBucket) {
      throw new Error('bucketfs not initial ');
    }
    if (!Array.isArray(req.files) || req.files.length === 0) {
      res.status(404).json({ msg: 'not found file' });
      return;
    }
    const file = req.files[0]; ;
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    const uploadStream = gridfsBucket.openUploadStream(uniqueFilename, {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,       
        uploadDate: new Date(),
        size: file.size,
      },
    });
    uploadStream.write(file.buffer);
    uploadStream.end();
    uploadStream.on('finish', (uploadFile: any) => {
      res.status(200).json(
        {
          contentType: file.mimetype,
          uniqueFilename:uniqueFilename,
          metadata: {
            originalName: file.originalname,
            uploadDate: new Date(),
            size: file.size,
          },
        }
      );
    });
  } catch (error) {
    res.json({ error: (error as Error).message });
  }
};


const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!gridfsBucket) throw new Error('GridFS not initialized');

    const filename = req.params.filename;
    const files = await gridfsBucket.find({ filename }).toArray();

    if (!files.length) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    const file = files[0];
    const chunkSize = 255 * 1024;
    const startByte = 3 * chunkSize;
    const endByte = Math.min((8 + 1) * chunkSize - 1, file.length - 1);

    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `inline; filename="${file.metadata?.originalName}"`,
      'Content-Length': file.length.toString(),
    });
    console.log("size : ",file.length.toString());
    const downloadStream = gridfsBucket.openDownloadStreamByName(filename);

    downloadStream.on('end', () => {
      console.log('Download stream ended');
    });

    downloadStream.pipe(res)
      .on('error', (err) => {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Download failed', error: err.message });
        }
        downloadStream.destroy();
      }).on('finish', () => {
        console.log('Download complete');
        // res.end();
      });


  } catch (error) {
    console.error('Download chunk error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to download file chunk', error: (error as Error).message });
    }
  }
};



const deleteFile = async (req: Request, res: Response) => {
  try {
    if (!gridfsBucket) throw new Error('GridFS not initialized');
    const filename = req.params.filename;
    const files = await gridfsBucket.find({ filename }).toArray();
    if (!files.length)
       res.status(404).json({ message: 'File not found' });
    await gridfsBucket.delete(files[0]._id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res
      .status(500)
      .json({ message: 'File deletion failed', error: (error as Error).message });
  }
};

const listFiles = async (req: Request, res: Response) => {
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
      uploadedBy: file.metadata?.uploadedBy,
    }));

    res.status(200).json({data:fileList,len:fileList.length});
  } catch (error ) {
    console.error('List files error:', error);
    res
      .status(500)
      .json({ message: 'Failed to retrieve files', error: (error as Error).message });
  }
};
export  { uploadFile, downloadFile, deleteFile, listFiles, upload };
