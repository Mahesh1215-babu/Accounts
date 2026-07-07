import mongoose, { Schema, Document, Model } from 'mongoose';
import { ILoan } from './loan';

export interface IPayment extends Document {
  loan: mongoose.Types.ObjectId | ILoan;
  amount: number;
  date: Date;
  interestPortion: number;
  principalPortion: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    loan: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    interestPortion: { type: Number, default: 0 },
    principalPortion: { type: Number, default: 0 },
  },
  {
    collection: 'payments',
    timestamps: true,
  }
);

export default (mongoose.models.Payment as Model<IPayment>) || mongoose.model<IPayment>('Payment', PaymentSchema);
