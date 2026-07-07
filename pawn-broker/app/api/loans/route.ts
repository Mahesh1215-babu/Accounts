import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Loan from '@/lib/models/loan';
import Voucher from '@/lib/models/voucher';

export async function GET() {
  try {
    await connectToDatabase();
    const loans = await Loan.find().populate('customer').sort({ createdAt: -1 });
    return NextResponse.json(loans);
  } catch (error: any) {
    console.error('GET /api/loans error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch loans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const loan = new Loan(data);
    await loan.save();

    // BASIC ACCOUNTING: Automatically create Debit and Credit entries for the disbursed loan
    try {
      // Generate next Voucher Number (find max then increment)
      const lastVoucher = await Voucher.findOne().sort({ voucherNo: -1 });
      const voucherNo = lastVoucher ? lastVoucher.voucherNo + 1 : 1001;

      const paymentModeAccount = loan.paymentMode === 'Bank' ? 'Bank Account' : 'Cash Ledger';
      const loanDate = loan.loanDate || new Date();

      // Entry 1: Debit Principal Outstanding (Loan Asset increases)
      await new Voucher({
        voucherNo,
        date: loanDate,
        account: 'Principal Outstanding',
        debit: loan.amount,
        credit: 0,
      }).save();

      // Entry 2: Credit Cash/Bank (Cash Asset decreases - money went out)
      await new Voucher({
        voucherNo,
        date: loanDate,
        account: paymentModeAccount,
        debit: 0,
        credit: loan.amount,
      }).save();
    } catch (voucherErr) {
      console.error('Accounting entry generation failed for loan creation', voucherErr);
    }

    return NextResponse.json(loan, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/loans error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create loan' }, { status: 500 });
  }
}
