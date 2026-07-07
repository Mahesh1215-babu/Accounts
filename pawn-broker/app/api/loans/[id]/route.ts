import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Loan from '@/lib/models/loan';
import Payment from '@/lib/models/payment';
import { calculateLoanFinancials } from '@/lib/finance';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const loan = await Loan.findById(params.id).populate('customer');
    if (!loan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Find all payments linked to this loan
    const payments = await Payment.find({ loan: params.id });
    const financials = calculateLoanFinancials(loan, payments);

    // Return loan object enriched with computed financials
    const loanObj = loan.toObject();
    return NextResponse.json({
      ...loanObj,
      financials,
    });
  } catch (error: any) {
    console.error('GET /api/loans/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch loan' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const updated = await Loan.findByIdAndUpdate(params.id, data, { new: true }).populate('customer');
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('PUT /api/loans/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update loan' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const deleted = await Loan.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/loans/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete loan' }, { status: 500 });
  }
}
