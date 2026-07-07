import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Voucher from '@/lib/models/voucher';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const voucher = await Voucher.findById(params.id);
    if (!voucher) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(voucher);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch voucher' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const updated = await Voucher.findByIdAndUpdate(params.id, data, { new: true });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update voucher' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const deleted = await Voucher.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete voucher' }, { status: 500 });
  }
}
