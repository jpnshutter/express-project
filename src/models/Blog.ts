import mongoose, { Schema, model, Document } from 'mongoose';

interface Blog extends Document {
  title: string;
  content: string;
  author: mongoose.Schema.Types.ObjectId | null;
  tags: string[];
  published: boolean;
  createdAt: Date;
}

const BlogSchema = new Schema<Blog>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model<Blog>('Blog', BlogSchema);
