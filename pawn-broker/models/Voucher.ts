import mongoose, { Schema, Document, model } from 'mongoose';

export interface IVoucher extends Document {
  voucherNo: number;
  date: Date;
  account: string; // e.g., 'Loan', 'Payment'
  debit: number;
  credit: number;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>({
  voucherNo: { type: Number, required: true, unique: true },
  date: { type: Date, default: Date.now },
  account: { type: String, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
}, { timestamps: true });

export default model<IVoucher>('Voucher', VoucherSchema);
