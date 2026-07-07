import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVoucher extends Document {
  voucherNo: number;
  date: Date;
  account: string;
  debit: number;
  credit: number;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    voucherNo: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    account: { type: String, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
  },
  {
    collection: 'vouchers',
    timestamps: true,
  }
);

export default (mongoose.models.Voucher as Model<IVoucher>) || mongoose.model<IVoucher>('Voucher', VoucherSchema);
