import mongoose, { Schema, Document, model } from 'mongoose';
import type { ICustomer } from './Customer';

export interface ILoan extends Document {
  customer: ICustomer['_id'];
  loanDate: Date;
  amount: number;
  interestRate: number; // per month percent
  pledgedItemName: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number; // virtual
  estimatedValue: number;
  paymentMode: 'Cash' | 'Bank';
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  loanDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  pledgedItemName: { type: String, required: true },
  grossWeight: { type: Number, required: true },
  stoneWeight: { type: Number, required: true },
  estimatedValue: { type: Number, required: true },
  paymentMode: { type: String, enum: ['Cash', 'Bank'], required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual for net weight = gross - stone
LoanSchema.virtual('netWeight').get(function () {
  return (this as any).grossWeight - (this as any).stoneWeight;
});

export default model<ILoan>('Loan', LoanSchema);
