import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import Payment from '@/lib/models/payment';
import Loan from '@/lib/models/loan';
import Voucher from '@/lib/models/voucher';
import { calculateLoanFinancials } from '@/lib/finance';

export async function GET() {
  try {
    await connectToDatabase();
    const payments = await Payment.find()
      .populate({ path: 'loan', populate: { path: 'customer' } })
      .sort({ date: -1 });
    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('GET /api/payments error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { loan: loanId, amount, date } = data;

    if (!loanId || !amount) {
      return NextResponse.json({ error: 'Loan ID and amount are required' }, { status: 400 });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Get existing payments for this loan to calculate balances up to this payment's date
    const existingPayments = await Payment.find({ loan: loanId });
    const targetDate = date ? new Date(date) : new Date();

    // Run financials simulation up to targetDate
    const financials = calculateLoanFinancials(loan, existingPayments, targetDate);

    // Allocate payment to unpaid interest first, then to principal
    const accruedInterestTotal = financials.interestAccrued;
    const interestPaidTotal = financials.interestPaid;
    const currentUnpaidInterest = Math.max(0, accruedInterestTotal - interestPaidTotal);

    const interestPortion = Math.min(amount, currentUnpaidInterest);
    const principalPortion = Math.max(0, amount - interestPortion);

    // Create payment entry
    const payment = new Payment({
      loan: loanId,
      amount,
      date: targetDate,
      interestPortion: Math.round(interestPortion * 100) / 100,
      principalPortion: Math.round(principalPortion * 100) / 100,
    });
    await payment.save();

    // BASIC ACCOUNTING: Automatically create double-entry journal vouchers
    try {
      // Generate next Voucher Number
      const lastVoucher = await Voucher.findOne().sort({ voucherNo: -1 });
      const voucherNo = lastVoucher ? lastVoucher.voucherNo + 1 : 1001;

      const paymentModeAccount = loan.paymentMode === 'Bank' ? 'Bank Account' : 'Cash Ledger';

      // Entry 1: Debit Cash/Bank Account for the full payment amount received
      await new Voucher({
        voucherNo,
        date: targetDate,
        account: paymentModeAccount,
        debit: amount,
        credit: 0,
      }).save();

      // Entry 2: Credit Principal Outstanding for the principal portion
      if (principalPortion > 0) {
        await new Voucher({
          voucherNo,
          date: targetDate,
          account: 'Principal Outstanding',
          debit: 0,
          credit: Math.round(principalPortion * 100) / 100,
        }).save();
      }

      // Entry 3: Credit Operational Income for the interest portion
      if (interestPortion > 0) {
        await new Voucher({
          voucherNo,
          date: targetDate,
          account: 'Operational Income',
          debit: 0,
          credit: Math.round(interestPortion * 100) / 100,
        }).save();
      }
    } catch (voucherErr) {
      console.error('Accounting entry generation failed for payment received', voucherErr);
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/payments error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment' }, { status: 500 });
  }
}
