import { Request, Response, NextFunction } from 'express';

import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import auths from '../models/Role';
dotenv.config();

// Middleware สำหรับตรวจสอบ JWT
// export const auth = (req: Request, res: Response, next: NextFunction) => {
//   // เอา Token จาก Header Authorization
//   const token = req.header('Authorization');
//   const payload = {
//     // ข้อมูลที่ต้องการเก็บใน JWT
//     email: 'jpn.shutter@gmail.com',
//     password: '12345678',
//   };
//   // console.log(jwt.sign(payload,process.env.SECRET_KEY,{expiresIn:'1h'}));
//   const decoed = jwt.verify(
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Impwbi5zaHV0dGVyQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiMTIzNDU2NzgiLCJpYXQiOjE3Mzk1OTI4MjMsImV4cCI6MTczOTU5NjQyM30.3SN2rks-mVWcEV-xvc6Uwr870-GmidGSasUaMWCIaRY',
//     process.env.SECRET_KEY
//   );
//   console.log('jorpor : ', decoed);
//   if (!token) {
//     return res.status(401).send('Access Denied. No token provided.');
//   }

//   try {
//     // ลบคำว่า "Bearer " ออกจาก token
//     const bearerToken = token.split(' ')[1];

//     console.log('test : ', bearerToken);
//     // ตรวจสอบ token ด้วย secret key
//     jwt.verify(bearerToken, process.env.SECRET_KEY, (err, decoded) => {
//       if (err) {
//         return res.status(400).send(err);
//       }
//       // ถ้า token ถูกต้อง ให้ต่อการทำงานไปยัง route ถัดไป
//       req.user = decoded;
//       next();
//     });
//   } catch (error: any) {
//     return res.status(400).send('Invalid token.');
//   }
// };

interface decode extends JwtPayload {
  email:string, 
  role: string
}

export const register = async (req: Request, res:Response) => {
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
    const token = jwt.sign({ email, role: "user" }, process.env.SECRET_KEY , {
      expiresIn: '1h',
    });
    if (!user) {
      const newUser = new User({
        name: name || null,
        email: email,
        age: age || null,
        password: hashedPassword,
        role:"user",
        token,
      });
      await newUser.save();
       res.status(201).json(newUser);
      return ;
    }
    res.status(403).json({ msg: 'duplicate user' });
    return;
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
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
      return ;
    }
    const ism =await user.matchPassword(password);
    console.log("pass : ",ism);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ auth: isMatch });
      return ;
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
    return ;
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
  }
};



export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const decoded = jwt.decode(token) as decode;
    const authall = await auths.findOne({ name: decoded.role  });
    const path = req.originalUrl.split('?')[0].split('/').slice(1);
    const canNext = authall?.permissions.some((p: String) => p == path[0]);
    if (canNext) {
      next();
    } else {
      res.status(301).json({ error: 'non authorize' });
      return;
    }
  } catch (error: any) {
    res.status(403).json({ error: error.message });
    return;
  }
};
