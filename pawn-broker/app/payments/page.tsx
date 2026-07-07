"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Customer {
  _id: string;
  name: string;
}

interface LoanFinancials {
  amount: number;
  interestAccrued: number;
  principalPaid: number;
  interestPaid: number;
  balancePrincipal: number;
  totalPayable: number;
}

interface Loan {
  _id: string;
  amount: number;
  pledgedItemName: string;
  customer: Customer | null;
  financials?: LoanFinancials;
}

interface Payment {
  _id: string;
  loan: Loan | null;
  amount: number;
  date: string;
  interestPortion: number;
  principalPortion: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    loan: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
  });

  const [selectedLoanDetails, setSelectedLoanDetails] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    try {
      const [resPayments, resLoans] = await Promise.all([
        fetch('/api/payments').then(r => r.json()),
        fetch('/api/loans').then(r => r.json()),
      ]);
      setPayments(Array.isArray(resPayments) ? resPayments : []);
      setFiltered(Array.isArray(resPayments) ? resPayments : []);
      setLoans(Array.isArray(resLoans) ? resLoans : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const result = payments.filter(p => {
      const custName = p.loan?.customer?.name || "unregistered";
      const item = p.loan?.pledgedItemName || "collateral";
      return (
        custName.toLowerCase().includes(term) ||
        item.toLowerCase().includes(term) ||
        (p.loan?._id && p.loan._id.includes(term))
      );
    });
    setFiltered(result);
  }, [search, payments]);

  // Fetch full details including financials when loan is selected
  const handleLoanChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loanId = e.target.value;
    setForm(prev => ({ ...prev, loan: loanId }));
    
    if (!loanId) {
      setSelectedLoanDetails(null);
      return;
    }

    try {
      const res = await fetch(`/api/loans/${loanId}`);
      const data = await res.json();
      setSelectedLoanDetails(data);
    } catch (err) {
      console.error("Failed to load selected loan details", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.loan) {
      setErrorMsg("Please select an active loan contract.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan: form.loan,
          amount: Number(form.amount),
          date: form.date,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to record payment.");
        return;
      }
      setForm({
        loan: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
      });
      setSelectedLoanDetails(null);
      setSuccessMsg("Payment recorded successfully! Accounting entries created.");
      setTimeout(() => setSuccessMsg(""), 4000);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment log?")) return;
    try {
      await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Live portions breakdown preview logic
  let unpaidInterest = 0;
  let previewInterestPortion = 0;
  let previewPrincipalPortion = 0;

  if (selectedLoanDetails?.financials) {
    const fin = selectedLoanDetails.financials;
    unpaidInterest = Math.max(0, fin.interestAccrued - fin.interestPaid);
    const payAmt = Number(form.amount) || 0;
    previewInterestPortion = Math.min(payAmt, unpaidInterest);
    previewPrincipalPortion = Math.max(0, payAmt - previewInterestPortion);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Received Payments Log</h1>
          <p className="page-subtitle">Record and audit loan servicing installments. Payment is automatically adjusted to pay accrued interest first.</p>
        </div>
      </div>

      <div className="form-card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontWeight: 600 }}>Record Payment Received</h2>
        {successMsg && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid var(--success)', padding: '0.85rem 1rem', borderRadius: '0.6rem', marginBottom: '1.25rem', color: 'var(--success)', fontSize: '0.9rem' }}>
            ✅ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', padding: '0.85rem 1rem', borderRadius: '0.6rem', marginBottom: '1.25rem', color: 'var(--danger)', fontSize: '0.9rem' }}>
            ⚠️ {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Active Loan Contract</label>
              <select name="loan" value={form.loan} onChange={handleLoanChange} required className="form-select">
                <option value="">-- Select Active Loan (Customer & Collateral Info) --</option>
                {loans.map(l => {
                  const custName = l.customer?.name || "Unregistered Customer";
                  return (
                    <option key={l._id} value={l._id}>
                      {custName} - {l.pledgedItemName} (Principal: ₹{l.amount.toLocaleString()})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Total Amount Paid (₹)</label>
              <input name="amount" type="number" placeholder="10000" value={form.amount} onChange={handleChange} required className="form-input" min="1" />
            </div>

            {selectedLoanDetails?.financials && (
              <>
                <div className="form-group">
                  <label className="form-label">Accrued Interest Balance (₹)</label>
                  <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--warning)', fontWeight: 500 }}>
                    ₹{unpaidInterest.toLocaleString()}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Interest Share (Auto-Allocated)</label>
                  <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--success)', fontWeight: 500 }}>
                    ₹{previewInterestPortion.toLocaleString()}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Principal Share (Auto-Allocated)</label>
                  <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--accent)', fontWeight: 500 }}>
                    ₹{previewPrincipalPortion.toLocaleString()}
                  </div>
                </div>
              </>
            )}
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Saving Payment Entry..." : "Record Payment Entry"}
            </button>
          </div>
        </form>
      </div>

      <div className="search-wrapper">
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
        <input 
          type="text" 
          placeholder="Search by customer name, collateral details, or loan ID..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="form-input search-input" 
        />
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Pledged Asset</th>
                <th>Payment Date</th>
                <th>Total Paid</th>
                <th>Interest Repaid</th>
                <th>Principal Repaid</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <span className="badge badge-info">Fetching payments directory...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No payment logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.loan?.customer?.name || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}
                    </td>
                    <td>{p.loan?.pledgedItemName || <span style={{ color: 'var(--danger)' }}>Contract Deleted</span>}</td>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{p.amount.toLocaleString()}</td>
                    <td>₹{p.interestPortion.toLocaleString()}</td>
                    <td>₹{p.principalPortion.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link href={`/payments/${p._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(p._id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
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
