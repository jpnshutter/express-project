import express from 'express';
import { register, login } from '../middleware/auth.js';
const router = express.Router();
// Register route
router.post('/register', register);
// Login route
router.get('/login', login);
// Reset password route (placeholder)
router.get('/resetpassword', (req, res) => {
    res.status(501).send('Reset password functionality not implemented yet');
});
export default router;
