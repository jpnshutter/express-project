import express, { Router, Request, Response } from 'express';
const router: Router = express.Router();
import { uploadFile, downloadFile, deleteFile, listFiles, upload } from '../controllers/fileController';


router.get("/",(req:Request,res:Response)=>{
  console.log("testss");
  res.status(200).json("okk")
})

router.post(
  '/upload',
  (req: Request, res: Response, next) => {
    console.log('test1 : ', req);
    next();
  },
  upload.array('myFile'),
  uploadFile
);
router.get('/download/:filename', downloadFile); // More explicit path
router.delete('/delete/:filename', deleteFile);
router.get('/list/all', listFiles);

export default router;
