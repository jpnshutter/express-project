import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
// Define the User schema
const UserSchema = new Schema({
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
UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export default model('User', UserSchema);
