import express, { Router, Request, Response } from 'express';
import { register, login } from '../middleware/auth';

const router: Router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.get('/login', login);

// Reset password route (placeholder)
router.get('/resetpassword', (req: Request, res: Response) => {
  res.status(501).send('Reset password functionality not implemented yet');
});

export default router;
