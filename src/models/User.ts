import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define an interface for the User document
interface IUser extends Document {
  name: string;
  email: string;
  age: number;
  password: string;
  token: string | null;
  role: string;
  matchPassword(password: string): Promise<boolean>; // Type the matchPassword method
}

// Define the User schema
const UserSchema = new Schema<IUser>({
  name: { type: String },
  email: { type: String, unique: true },
  age: { type: Number },
  password: { type: String },
  token: { type: String, default: null },
  role: { type: String },
});


UserSchema.pre('save', async function (next) {
  // if (!this.isModified('password')) return next();
  // this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};


export default model<IUser>('User', UserSchema);
