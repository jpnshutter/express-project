import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {  authorize } from './middleware/auth';
import Logip from './models/Log';
import fileRoutes from './routes/fileRoute';
import userRoutes from './routes/userRoutes';
import blogRoutes from './routes/blogRoutes';
import authRoutes from './routes/authRoute';

const app: Express = express();
const port: number | string = process.env.PORT || 5002;
const mongoURI: string | undefined = process.env.MONGO_URI;

// 🔹 Connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    if (!mongoURI) throw new Error('MONGO_URI is not defined');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};
connectDB();

// 🔹 Middleware
app.use(express.json());

// Log IP requests
app.use(async (req: Request, res: Response, next: NextFunction) => {
  console.log(`Request made to: ${req.ip}`);
  const ip: string | undefined = req.ip;

  try {
    const existLog = await Logip.findOne({ ip });
    if (!existLog) {
      const newLog = new Logip({ ip, time: [new Date()] });
      await newLog.save();
    } else {
      await Logip.findOneAndUpdate({ ip }, { $push: { time: new Date() } });
    }
  } catch (err) {
    console.error('Error logging IP:', err);
  }

  next();
});

// 🔹 Rate Limiting (Uncomment and adjust as needed)
// const customLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 3, // Allow only 3 requests per minute
//   handler: (req: Request, res: Response) => {
//     res.status(429).json({
//       error: 'Too many requests, slow down!',
//       retryAfter: Math.ceil(req.rateLimit.resetTime - Date.now()) + 'ms',
//     });
//   },
// });
// app.use(customLimiter);

// 🔹 Routes
app.use('/file', fileRoutes);
app.use('/users', authorize, userRoutes);
app.use('/blogs', authorize, blogRoutes);
app.use('/auth', authRoutes);

// 🔹 Health Check
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 MongoDB connection successful!');
});

// 🔹 Error Handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(520).send(err.message);
});

// 🔹 Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
