import { Request, Response, NextFunction } from 'express';
import Blog from '../models/Blog';

export const Allblog = async (req: Request, res: Response) => {
  try {
    const Blogs = await Blog.find();
    res.status(201).json(Blogs);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const BlogById = async (req: Request, res: Response) => {
  try {
    const Blogs = await Blog.find({ _id: req.params.id });
    res.json(Blogs);
  } catch (err: any) {
    res.status(400).json({ msg: err.message });
  }
};

export const AddBlog = async (req: Request, res: Response) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.json(newBlog);
  } catch (error: any) {
    console.log(error);
    res.status(401).json({ message: error.message });
  }
};

export const UpdateBlog = async (req: Request, res: Response) => {
  try {
    const updateBlog = await Blog.findByIdAndUpdate(req.params.i, req.body, {
      new: true,
    }); // new:true คืนค่าเอกสารหลังอัพเดต
    res.status(200).json(updateBlog);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const AddTagByfind = async (req: Request, res: Response) => {
  console.log('testtttttttt');
  const token = req.headers;
  console.log(token);
  try {
    const updateBlog = await Blog.findByIdAndUpdate(
      req.params.i,
      { $addToSet: { tags: req.body.tag } },
      { new: true }
    ); // new:true คืนค่าเอกสารหลังอัพเดต
    res.status(200).json(updateBlog);
  } catch (error: any) {
    res.status(403).json({ message: 'test' });
  }
};

export const AddTagByupdate = async (req: Request, res: Response) => {
  try {
    const updateBlog = await Blog.updateOne(
      { _id: req.params.id },
      { $addToSet: { tags: req.body.tag } },
      { new: true }
    );
    res.status(200).json(updateBlog);
  } catch (error: any) {
    res.status(400).json(null);
  }
};

export const DeleteTag = async (req: Request, res: Response) => {
  try {
    const updateBlog = await Blog.findByIdAndUpdate(
      req.params.i,
      { $pop: { tags: 1 } },
      { new: true }
    ); // new:true คืนค่าเอกสารหลังอัพเดต
    res.status(200).json(updateBlog);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const DeleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(id);
    const deleteBlog = await Blog.findByIdAndDelete(id);
    if (!deleteBlog) {
      res.status(404).json({ message: 'not fould' });
      return ;
    }
    res.status(200).json({ message: 'success' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
