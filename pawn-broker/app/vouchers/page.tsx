"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Voucher {
  _id: string;
  voucherNo: number;
  date: string;
  account: string;
  debit: number;
  credit: number;
}

export default function DayBookPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filtered, setFiltered] = useState<Voucher[]>([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    voucherNo: "",
    date: new Date().toISOString().split('T')[0],
    account: "",
    debit: "0",
    credit: "0",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/vouchers');
      const data = await res.json();
      
      // Sort chronologically by date, then voucher number
      const sorted = (data || []).sort((a: Voucher, b: Voucher) => {
        const dDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dDiff !== 0) return dDiff;
        return a.voucherNo - b.voucherNo;
      });

      setVouchers(sorted);
      setFiltered(sorted);
      
      // Auto-increment voucher number based on existing count
      if (sorted.length > 0) {
        const maxNo = Math.max(...sorted.map((v: Voucher) => v.voucherNo || 0));
        setForm(prev => ({ ...prev, voucherNo: (maxNo + 1).toString() }));
      } else {
        setForm(prev => ({ ...prev, voucherNo: "1001" }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const result = vouchers.filter(v => 
      v.account.toLowerCase().includes(term) ||
      v.voucherNo.toString().includes(term)
    );
    setFiltered(result);
  }, [search, vouchers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucherNo: Number(form.voucherNo),
          date: form.date,
          account: form.account,
          debit: Number(form.debit),
          credit: Number(form.credit),
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Failed to create voucher. Check for duplicate voucher numbers.");
        return;
      }
      setForm({
        voucherNo: "",
        date: new Date().toISOString().split('T')[0],
        account: "",
        debit: "0",
        credit: "0",
      });
      await fetchVouchers();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher entry?")) return;
    try {
      await fetch(`/api/vouchers/${id}`, { method: 'DELETE' });
      await fetchVouchers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts Day Book & Ledger</h1>
          <p className="page-subtitle">Real-time chronologically sorted journal entries of all system transactions</p>
        </div>
      </div>

      {/* Accounting Explanation Panel */}
      <div className="form-card" style={{ borderLeft: '4px solid var(--accent)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 600 }}>Double-Entry Architecture & Ledger Rules</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
          This system automatically generates dual-entry transaction vouchers to maintain balance sheet integrity:
        </p>
        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Loan Disbursal:</strong> Debits <em>Principal Outstanding</em> (Asset increased) and Credits <em>Cash Ledger</em> / <em>Bank Account</em> (Asset decreased).
          </li>
          <li>
            <strong>Payment Servicing:</strong> Debits <em>Cash Ledger</em> / <em>Bank Account</em> (Asset increased). Automatically splits and credits <em>Principal Outstanding</em> (Asset decreased) and <em>Operational Income</em> (Revenue from accrued monthly interest).
          </li>
          <li>
            <strong>Manual Adjustments:</strong> Administrative users can post direct journal adjustments (capital injection, drawings, reserve transfers) below.
          </li>
        </ul>
      </div>

      <div className="form-card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontWeight: 600 }}>Post Manual Ledger Adjustment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Voucher Number</label>
              <input name="voucherNo" type="number" placeholder="1001" value={form.voucherNo} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Voucher Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Target Account Ledger</label>
              <select name="account" value={form.account} onChange={handleChange} required className="form-select">
                <option value="">-- Choose Account --</option>
                <option value="Cash Ledger">Cash Ledger</option>
                <option value="Bank Account">Bank Account</option>
                <option value="Interest Receivable">Interest Receivable</option>
                <option value="Principal Outstanding">Principal Outstanding</option>
                <option value="Bad Debts Reserve">Bad Debts Reserve</option>
                <option value="Operational Income">Operational Income</option>
                <option value="Drawings Account">Drawings Account</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Debit Amount (₹)</label>
              <input name="debit" type="number" value={form.debit} onChange={handleChange} required className="form-input" min="0" />
            </div>

            <div className="form-group">
              <label className="form-label">Credit Amount (₹)</label>
              <input name="credit" type="number" value={form.credit} onChange={handleChange} required className="form-input" min="0" />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Posting Voucher..." : "Post Adjustment"}
            </button>
          </div>
        </form>
      </div>

      <div className="search-wrapper">
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
        <input 
          type="text" 
          placeholder="Search by account ledger or voucher number..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="form-input search-input" 
        />
      </div>

      {/* Simple Day Book Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Voucher No.</th>
                <th>Account</th>
                <th>Debit (₹)</th>
                <th>Credit (₹)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <span className="badge badge-info">Fetching accounts day book...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No journal voucher entries found in the Day Book.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v._id}>
                    <td>{new Date(v.date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{v.voucherNo}</td>
                    <td style={{ fontWeight: 500 }}>{v.account}</td>
                    <td style={{ color: v.debit > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                      {v.debit > 0 ? `₹${v.debit.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ color: v.credit > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {v.credit > 0 ? `₹${v.credit.toLocaleString()}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link href={`/vouchers/${v._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(v._id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
