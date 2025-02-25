import { Schema, model, Document } from 'mongoose';

interface Log extends Document {
  ip: string;
  time: Date[];
}

const LogSchema = new Schema<Log>(
  {
    ip: { type: String, required: true },
    time: [{ type: Date }],
  },
  { collection: 'logip' }
);

export default model<Log>('Logipjorpor', LogSchema);
