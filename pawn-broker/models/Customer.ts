import { Schema, model, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
}, { timestamps: true });

export default model<ICustomer>('Customer', CustomerSchema);
