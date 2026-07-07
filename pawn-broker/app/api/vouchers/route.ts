import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Voucher from '@/lib/models/voucher';

export async function GET() {
  try {
    await connectToDatabase();
    const vouchers = await Voucher.find().sort({ date: 1, voucherNo: 1 });
    return NextResponse.json(vouchers);
  } catch (error: any) {
    console.error('GET /api/vouchers error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch vouchers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const voucher = new Voucher(data);
    await voucher.save();
    return NextResponse.json(voucher, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/vouchers error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create voucher' }, { status: 500 });
  }
}
