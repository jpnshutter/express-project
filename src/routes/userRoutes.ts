import express, { Router } from 'express';
import User from '../models/User';
const router: Router = express.Router();
import {
  getAllUser,
  addUser,
  updateUser,
  deleteUser,
  qrcode,
} from '../controllers/userController';
router.get('/profile', getAllUser);

router.get('/qrcode', qrcode);

router;

router.get('/ip', async (req, res) => {
  res.json({
    'cookie ': req.cookies,
    ip: req.ip,
    header: req.headers,
    more: req.app.locals,
  });
});

router.post('/', addUser);

// 🔹 PUT: อัปเดต User ตาม ID
router.put('/', updateUser);

// 🔹 DELETE: ลบ User ตาม ID
router.delete('/:id', deleteUser);

export default router;
