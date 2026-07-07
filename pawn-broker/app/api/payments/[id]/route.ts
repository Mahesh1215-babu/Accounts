import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Payment from '@/lib/models/payment';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const payment = await Payment.findById(params.id).populate({ path: 'loan', populate: { path: 'customer' } });
    if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(payment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const updated = await Payment.findByIdAndUpdate(params.id, data, { new: true })
      .populate({ path: 'loan', populate: { path: 'customer' } });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const deleted = await Payment.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete payment' }, { status: 500 });
  }
}
