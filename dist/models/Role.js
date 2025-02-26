import { Schema, model } from 'mongoose';
const AuthSchema = new Schema({
    name: { type: String, required: true, default: 'jorpor' },
    permissions: [{ type: String, required: true }],
}, {
    timestamps: true,
});
export default model('Role', AuthSchema);
