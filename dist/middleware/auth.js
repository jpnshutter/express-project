import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import auths from '../models/Role.js';
import nodemailer from "nodemailer";
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
        const { email, password,iat } = req.body;
        console.log('test : ', email, password);
        if ((!email || !password || typeof email != "string" || typeof password != "string")) {
            // console.log("type :",typeof email,email["$ne"]);
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
        const payload = {
            email: email,
            role: user.role,
        };
    
        if(iat){
            payload.iat = iat;
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn:3600
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
        res.redirect(301, "/");
        // res.status(401).json({ message: 'unauthorize' });
        return;
    }
    try {
        if (!process.env.SECRET_KEY) {
            throw new Error('SECRET_KEY environment variable is not defined');
        }
        const decoded = jwt.verify(token,process.env.SECRET_KEY);
        console.log(decoded);
        const authall = await auths.findOne({ name: decoded.role });
        const path = req.originalUrl.split('?')[0].split('/').slice(1);
        const canNext = authall?.permissions.some((p) => p == path[0]);
        if (canNext) {
            return next();
        }
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        catch (error) {
            res.status(403).json({ error: error.message });
            return;
        }
};


export const resetpassword = async (req,res)=>{
    try {
        // const token =req.header('Authorization')?.split(' ')[1];
        // if(!token){
        //     return res.status(501).json({})
        // }
        const {email} = req.body;
        if(!email){
            res.status(400).json({})
        }
        if(!process.env){
            throw new error("env isn't found")
        }
        const header = nodemailer.createTransport({
            host:process.env.SMTP_HOST,
            port:process.env.SMTP_PORT,
            secure:true,
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        })
        // const decode =jwt.verify(token,process.env.SECRET_KEY);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: "Click the link below to reset your password:",
            html: `<a href="${process.env.URL_RESETPASSWORD}/auth/resetpassword/${token}">Reset your password</a>`
        }
        
        await header.sendMail(mailOptions)
        res.status(200).json("ok")
    } catch (error) {
        res.status(500).json("non")
    }
    
}

export const resetpasswordwithtoken = (req,res)=>{
    const token = req.params.token
    if(!token){
        res.status(501).json({})
    }
    res.status(200).json({token})
}