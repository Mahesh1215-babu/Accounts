"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  customers: number;
  loansCount: number;
  loansTotal: number;
  paymentsCount: number;
  paymentsTotal: number;
  vouchersCount: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({
    customers: 0,
    loansCount: 0,
    loansTotal: 0,
    paymentsCount: 0,
    paymentsTotal: 0,
    vouchersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [resCust, resLoans, resPayments, resVouchers] = await Promise.all([
          fetch('/api/customers').then(r => r.json()),
          fetch('/api/loans').then(r => r.json()),
          fetch('/api/payments').then(r => r.json()),
          fetch('/api/vouchers').then(r => r.json()),
        ]);

        const totalLoansAmount = resLoans.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
        const totalPaymentsAmount = resPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

        setStats({
          customers: resCust.length || 0,
          loansCount: resLoans.length || 0,
          loansTotal: totalLoansAmount,
          paymentsCount: resPayments.length || 0,
          paymentsTotal: totalPaymentsAmount,
          vouchersCount: resVouchers.length || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time pawn brokerage and ledger metrics</p>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Welcome back, Admin
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="badge badge-info">Loading stats...</div>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-title">Total Customers</div>
              <div className="stat-value">{stats.customers}</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Registered accounts</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">Total Loans Value</div>
              <div className="stat-value">₹{stats.loansTotal.toLocaleString()}</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem' }}>{stats.loansCount} Active contracts</p>
            </div>

            <div className="stat-card">
              <div className="stat-title">Payments Collected</div>
              <div className="stat-value">₹{stats.paymentsTotal.toLocaleString()}</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.5rem' }}>{stats.paymentsCount} Payment logs</p>
            </div>

            <div className="stat-card">
              <div className="stat-title">Vouchers Logged</div>
              <div className="stat-value">{stats.vouchersCount}</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Debit/Credit transactions</p>
            </div>
          </div>

          <div className="form-card" style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Quick Actions</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/customers" className="btn btn-primary">Add Customer</Link>
              <Link href="/loans" className="btn btn-secondary">New Loan Application</Link>
              <Link href="/payments" className="btn btn-secondary">Record Payment</Link>
              <Link href="/vouchers" className="btn btn-secondary">Create Voucher</Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div className="form-card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Interest Analysis</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Monitor monthly interest projections. Unpaid principal receives accrued monthly interest on loans as specified by custom interest rates. Ensure customers are contacted on maturity.
              </p>
            </div>
            <div className="form-card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>System Integrity</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                All transaction vouchers automatically balance against loans and payments accounts, maintaining double-entry standard verification across operations.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
