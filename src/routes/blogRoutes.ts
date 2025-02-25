import express, { Router, Request, Response, NextFunction } from 'express';
import Blog from '../models/Blog';
import path from 'path';
const router: Router = express.Router();
import {
  Allblog,
  BlogById,
  AddBlog,
  UpdateBlog,
  AddTagByfind,
  AddTagByupdate,
  DeleteTag,
  DeleteBlog,
} from '../controllers/blogController';

router.get('/', Allblog);

router.get('/:id', BlogById);

router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    console.log('testadd2');
    next();
  },
  AddBlog
);

router.put('/:i', UpdateBlog);

router.put(
  '/:i/tag',
  (req: Request, res: Response, next: NextFunction) => {
    console.log('test2');
    next();
  },
  AddTagByfind
);

router.put('/:id/tag2', AddTagByupdate);

router.delete('/:i/tag', DeleteTag);

router.delete('/:id', DeleteBlog);

router.get('/image', (req: Request, res) => {
  res.sendFile(path.join(__dirname, '..', 'image', 'view.jpg')); // ส่งไฟล์ภาพ
});

export default router;
