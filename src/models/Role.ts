import { Schema, model, Document } from 'mongoose';

interface IRole extends Document {
  name: String;
  permissions: String[];
}

const AuthSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, default: 'jorpor' },
    permissions: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  }
);

export default model<IRole>('Role', AuthSchema);
