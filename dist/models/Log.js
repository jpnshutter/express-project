import { Schema, model } from 'mongoose';
const LogSchema = new Schema({
    ip: { type: String, required: true },
    time: [{ type: Date }],
}, { collection: 'logip' });
export default model('Logipjorpor', LogSchema);
