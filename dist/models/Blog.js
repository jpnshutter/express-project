import mongoose, { Schema, model } from 'mongoose';
const BlogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
export default model('Blog', BlogSchema);
