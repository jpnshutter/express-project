import User from '../models/User.js';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const getAllUser = async (req, res) => {
    const users = await User.find();
    res.json(users);
};
export const qrcode = async (req, res) => {
    try {
        // Extract the token from the Authorization header
        const token = req.header('Authorization')?.split(' ')[1];
        // Check if the token exists
        if (!token) {
            res.status(404).json({ message: 'Token not found' });
            return;
        }
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.email) {
            res.status(400).json({ message: 'Invalid token: email missing' });
            return;
        }
        console.log('Email is: ', decoded.email);
        // Generate the QR code
        const qrCodeDataUrl = await QRCode.toDataURL(decoded.email);
        // Send the QR code as a JSON response
        res.json({ qrCode: qrCodeDataUrl });
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
export const uploadpic = async (req, res) => { };
export const addUser = async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
};
export const updateUser = async (req, res) => {
    const { email, name } = req.body;
    const updatedUser = await User.updateOne({ email: email }, { $set: { name: name || null } });
    res.status(200).json(updatedUser);
    return;
};
export const deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
};
