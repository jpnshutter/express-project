import User from '../models/User';
import QRCode from 'qrcode';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
dotenv.config();

interface decode extends JwtPayload {
  email:string, 
  role: string
}

export const getAllUser = async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
};

export const qrcode = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the token from the Authorization header
    const token: string | undefined = req.header('Authorization')?.split(' ')[1];

    // Check if the token exists
    if (!token) {
      res.status(404).json({ message: 'Token not found' });
      return;
    }

    const decoded = jwt.decode(token) as decode ;

    if (!decoded || !decoded.email) {
      res.status(400).json({ message: 'Invalid token: email missing' });
      return;
    }

    console.log('Email is: ', decoded.email);

    // Generate the QR code
    const qrCodeDataUrl = await QRCode.toDataURL(decoded.email);

    // Send the QR code as a JSON response
    res.json({ qrCode: qrCodeDataUrl });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const uploadpic = async (req: Request, res: Response) => {};

export const addUser = async (req: Request, res: Response) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.json(newUser);
};

export const updateUser = async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const updatedUser = await User.updateOne(
    { email: email },
    { $set: { name: name || null } }
  );
  res.status(200).json(updatedUser);
  return;
};

export const deleteUser = async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};
