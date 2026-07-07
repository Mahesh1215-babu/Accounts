import mongoose, { Schema, Document, model } from 'mongoose';
import type { ILoan } from './Loan';

export interface IPayment extends Document {
  loan: ILoan['_id'];
  amount: number;
  date: Date;
  interestPortion: number;
  principalPortion: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  loan: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  interestPortion: { type: Number, default: 0 },
  principalPortion: { type: Number, default: 0 },
}, { timestamps: true });

export default model<IPayment>('Payment', PaymentSchema);
