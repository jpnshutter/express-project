import express from 'express';
const router = express.Router();
import { uploadFile, downloadFile, deleteFile, listFiles, upload,test ,listFile} from '../controllers/fileController.js';
router.get("/", (req, res) => {
    console.log("testss");
    res.status(200).json("okk");
});
router.post('/upload', (req, res, next) => {
    console.log('test1 : ', req);
    next();
}, upload.array('myFile'), uploadFile);
router.get('/download/:filename', downloadFile); // More explicit path
router.delete('/delete/:filename', deleteFile);
router.get('/list/all', listFiles);

router.get('/list/tag', listFile);
router.get('/test',upload.array('myFile'), test);
export default router;
