import express from 'express';
import path from 'path';
const router = express.Router();
import { Allblog, BlogById, AddBlog, UpdateBlog, AddTagByfind, AddTagByupdate, DeleteTag, DeleteBlog, } from '../controllers/blogController.js';
router.get('/', Allblog);
router.get('/:id', BlogById);
router.post('/', (req, res, next) => {
    console.log('testadd2');
    next();
}, AddBlog);
router.put('/:i', UpdateBlog);
router.put('/:i/tag', (req, res, next) => {
    console.log('test2');
    next();
}, AddTagByfind);
router.put('/:id/tag2', AddTagByupdate);
router.delete('/:i/tag', DeleteTag);
router.delete('/:id', DeleteBlog);
router.get('/image', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'image', 'view.jpg')); // ส่งไฟล์ภาพ
});
export default router;
