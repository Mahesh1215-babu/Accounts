import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICustomer } from './customer';

export interface ILoan extends Document {
  customer: mongoose.Types.ObjectId | ICustomer;
  loanDate: Date;
  amount: number;
  interestRate: number;
  pledgedItemName: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  estimatedValue: number;
  paymentMode: 'Cash' | 'Bank';
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    loanDate: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    pledgedItemName: { type: String, required: true },
    grossWeight: { type: Number, required: true },
    stoneWeight: { type: Number, required: true },
    estimatedValue: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Cash', 'Bank'], required: true },
  },
  {
    collection: 'loans',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

LoanSchema.virtual('netWeight').get(function (this: any) {
  return this.grossWeight - this.stoneWeight;
});

export default (mongoose.models.Loan as Model<ILoan>) || mongoose.model<ILoan>('Loan', LoanSchema);
