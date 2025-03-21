import Blog from '../models/Blog.js';
export const Allblog = async (req, res) => {
    try {
        const Blogs = await Blog.find();
        res.status(201).json(Blogs);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const BlogById = async (req, res) => {
    try {
        const Blogs = await Blog.find({ _id: req.params.id });
        res.json(Blogs);
    }
    catch (err) {
        res.status(400).json({ msg: err.message });
    }
};
export const AddBlog = async (req, res) => {
    try {
        const newBlog = new Blog(req.body);
        await newBlog.save();
        res.json(newBlog);
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ message: error.message });
    }
};
export const UpdateBlog = async (req, res) => {
    try {
        const updateBlog = await Blog.findByIdAndUpdate(req.params.i, req.body, {
            new: true,
        }); // new:true คืนค่าเอกสารหลังอัพเดต
        res.status(200).json(updateBlog);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const AddTagByfind = async (req, res) => {
    console.log('testtttttttt');
    const token = req.headers;
    console.log(token);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(req.params.i, { $addToSet: { tags: req.body.tag } }, { new: true }); // new:true คืนค่าเอกสารหลังอัพเดต
        res.status(200).json(updateBlog);
    }
    catch (error) {
        res.status(403).json({ message: 'test' });
    }
};
export const AddTagByupdate = async (req, res) => {
    try {
        const updateBlog = await Blog.updateOne({ _id: req.params.id }, { $addToSet: { tags: req.body.tag } }, { new: true });
        res.status(200).json(updateBlog);
    }
    catch (error) {
        res.status(400).json(null);
    }
};
export const DeleteTag = async (req, res) => {
    try {
        const updateBlog = await Blog.findByIdAndUpdate(req.params.i, { $pop: { tags: 1 } }, { new: true }); // new:true คืนค่าเอกสารหลังอัพเดต
        res.status(200).json(updateBlog);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const DeleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const deleteBlog = await Blog.findByIdAndDelete(id);
        if (!deleteBlog) {
            res.status(404).json({ message: 'not fould' });
            return;
        }
        res.status(200).json({ message: 'success' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
