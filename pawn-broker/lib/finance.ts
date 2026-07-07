import { ILoan } from './models/loan';
import { IPayment } from './models/payment';

export interface LoanFinancials {
  amount: number;
  interestAccrued: number;
  principalPaid: number;
  interestPaid: number;
  balancePrincipal: number;
  totalPayable: number;
}

/**
 * Calculates the current financials and state of a loan chronologically.
 * Interest accrues on the outstanding principal balance.
 * Payments are allocated to unpaid accrued interest first, then to principal.
 */
export function calculateLoanFinancials(
  loan: any,
  payments: any[],
  upToDate: Date = new Date()
): LoanFinancials {
  const amount = loan.amount;
  const interestRate = loan.interestRate; // monthly percentage
  const startDate = new Date(loan.loanDate);

  // Sort payments chronologically by payment date
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let currentPrincipal = amount;
  let totalInterestAccrued = 0;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  let lastAccrualDate = startDate;

  for (const payment of sortedPayments) {
    const paymentDate = new Date(payment.date);
    
    // Calculate days between last accrual and this payment
    const diffTime = paymentDate.getTime() - lastAccrualDate.getTime();
    const diffDays = Math.max(0, diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      // Interest accrued on current outstanding principal during this period
      const accrued = currentPrincipal * (interestRate / 100) * (diffDays / 30);
      totalInterestAccrued += accrued;
    }

    // Allocate payment: first pay interest, then reduce principal
    const unpaidInterestAtPaymentTime = totalInterestAccrued - totalInterestPaid;
    
    // Dynamically calculate what portion of the payment went to interest/principal
    const actualAmount = payment.amount;
    const interestPortion = Math.min(actualAmount, unpaidInterestAtPaymentTime);
    const principalPortion = Math.max(0, actualAmount - interestPortion);

    totalInterestPaid += interestPortion;
    totalPrincipalPaid += principalPortion;
    currentPrincipal = Math.max(0, currentPrincipal - principalPortion);
    
    // Update the last accrual date to the payment date
    lastAccrualDate = paymentDate;
  }

  // Accrue interest from the last transaction up to the target date (today)
  const finalDiffTime = upToDate.getTime() - lastAccrualDate.getTime();
  const finalDiffDays = Math.max(0, finalDiffTime / (1000 * 60 * 60 * 24));

  if (finalDiffDays > 0) {
    const accrued = currentPrincipal * (interestRate / 100) * (finalDiffDays / 30);
    totalInterestAccrued += accrued;
  }

  const unpaidInterest = totalInterestAccrued - totalInterestPaid;
  const balancePrincipal = currentPrincipal;
  const totalPayable = balancePrincipal + unpaidInterest;

  return {
    amount,
    interestAccrued: Math.round(totalInterestAccrued * 100) / 100,
    principalPaid: Math.round(totalPrincipalPaid * 100) / 100,
    interestPaid: Math.round(totalInterestPaid * 100) / 100,
    balancePrincipal: Math.round(balancePrincipal * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
  };
}
