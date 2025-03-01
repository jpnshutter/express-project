import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import auths from '../models/Role.js';
dotenv.config();
export const register = async (req, res) => {
    try {
        const { email, password, name, age } = req.body;
        if (!email || !password) {
            res.status(401).json({ msg: "field isn't complete" });
            return;
        }
        const user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!process.env.SECRET_KEY) {
            throw new Error('SECRET_KEY environment variable is not defined');
        }
        const token = jwt.sign({ email, role: "user" }, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });
        if (!user) {
            const newUser = new User({
                name: name || null,
                email: email,
                age: age || null,
                password: hashedPassword,
                role: "user",
                token,
            });
            await newUser.save();
            res.status(201).json(newUser);
            return;
        }
        res.status(403).json({ msg: 'duplicate user' });
        return;
    }
    catch (error) {
        res.status(500).json({ msg: error.message });
        return;
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('test : ', email, password);
        if (!email || !password) {
            res.status(400).json('miss field');
            return;
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            res.status(404).json("don't have user");
            return;
        }
        const ism = await user.matchPassword(password);
        console.log("pass : ", ism);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ auth: isMatch });
            return;
        }
        if (!process.env.SECRET_KEY) {
            throw new Error('SECRET_KEY environment variable is not defined');
        }
        const token = jwt.sign({ email, role: user.role }, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });
        user.token = token;
        await user.save();
        res.status(200).json({ auth: token });
        return;
    }
    catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
export const authorize = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.redirect(301, "https://www.facebook.com");
        // res.status(401).json({ message: 'unauthorize' });
        return;
    }
    try {
        if (!process.env.SECRET_KEY) {
            throw new Error('SECRET_KEY environment variable is not defined');
        }
        if(!jwt.verify(token,process.env.SECRET_KEY)){
            return res.status(401).json("")
        }
        const decoded = jwt.decode(token);
        const authall = await auths.findOne({ name: decoded.role });
        const path = req.originalUrl.split('?')[0].split('/').slice(1);
        const canNext = authall?.permissions.some((p) => p == path[0]);
        if (canNext) {
            next();
        }
        else {
            res.status(301).json({ error: 'non authorize' });
            return;
        }
    }
    catch (error) {
        res.status(403).json({ error: error.message });
        return;
    }
};
