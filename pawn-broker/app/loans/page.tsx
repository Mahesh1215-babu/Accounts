"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Customer {
  _id: string;
  name: string;
}

interface Loan {
  _id: string;
  customer: Customer | null;
  loanDate: string;
  amount: number;
  interestRate: number;
  pledgedItemName: string;
  grossWeight: number;
  stoneWeight: number;
  netWeight?: number;
  estimatedValue: number;
  paymentMode: "Cash" | "Bank";
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Loan[]>([]);
  const [search, setSearch] = useState("");
  
  const [form, setForm] = useState({
    customer: "",
    loanDate: new Date().toISOString().split('T')[0],
    amount: "",
    interestRate: "2.0", // default 2% per month
    pledgedItemName: "",
    grossWeight: "",
    stoneWeight: "0",
    estimatedValue: "",
    paymentMode: "Cash" as "Cash" | "Bank",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    try {
      const [resLoans, resCust] = await Promise.all([
        fetch('/api/loans').then(r => r.json()),
        fetch('/api/customers').then(r => r.json()),
      ]);
      setLoans(Array.isArray(resLoans) ? resLoans : []);
      setFiltered(Array.isArray(resLoans) ? resLoans : []);
      setCustomers(Array.isArray(resCust) ? resCust : []);
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
    const result = loans.filter(l => {
      const custName = l.customer?.name || "unregistered";
      return (
        custName.toLowerCase().includes(term) ||
        l.pledgedItemName.toLowerCase().includes(term) ||
        l._id.includes(term)
      );
    });
    setFiltered(result);
  }, [search, loans]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer) {
      setErrorMsg("Please select a registered customer.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form.customer,
          loanDate: form.loanDate,
          amount: Number(form.amount),
          interestRate: Number(form.interestRate),
          pledgedItemName: form.pledgedItemName,
          grossWeight: Number(form.grossWeight),
          stoneWeight: Number(form.stoneWeight),
          estimatedValue: Number(form.estimatedValue),
          paymentMode: form.paymentMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create loan.");
        return;
      }
      setForm({
        customer: "",
        loanDate: new Date().toISOString().split('T')[0],
        amount: "",
        interestRate: "2.0",
        pledgedItemName: "",
        grossWeight: "",
        stoneWeight: "0",
        estimatedValue: "",
        paymentMode: "Cash",
      });
      setSuccessMsg("Loan disbursed successfully! Accounting entries created.");
      setTimeout(() => setSuccessMsg(""), 4000);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this loan record? Payments tied to this loan might lose their reference context.")) return;
    try {
      await fetch(`/api/loans/${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // derived net weight for preview in form
  const previewNetWeight = (Number(form.grossWeight) || 0) - (Number(form.stoneWeight) || 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pledge & Loans Ledger</h1>
          <p className="page-subtitle">Disburse capital backed by physical assets and collateral items</p>
        </div>
      </div>

      <div className="form-card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontWeight: 600 }}>Disburse New Pawn Loan</h2>

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
            <div className="form-group">
              <label className="form-label">Customer Profile *</label>
              <select name="customer" value={form.customer} onChange={handleChange} required className="form-select">
                <option value="">{customers.length === 0 ? '-- No customers yet, register one first --' : '-- Choose Registered Customer --'}</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Loan Date</label>
              <input name="loanDate" type="date" value={form.loanDate} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Principal Amount (₹)</label>
              <input name="amount" type="number" placeholder="50000" value={form.amount} onChange={handleChange} required className="form-input" min="1" />
            </div>

            <div className="form-group">
              <label className="form-label">Interest Rate (% per month)</label>
              <input name="interestRate" type="number" step="0.01" placeholder="2.0" value={form.interestRate} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Pledged Collateral Item</label>
              <input name="pledgedItemName" placeholder="Gold Chain 22K" value={form.pledgedItemName} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Gross Weight (grams)</label>
              <input name="grossWeight" type="number" step="0.01" placeholder="24.50" value={form.grossWeight} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Stone Weight (grams)</label>
              <input name="stoneWeight" type="number" step="0.01" placeholder="0.50" value={form.stoneWeight} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Market Value (₹)</label>
              <input name="estimatedValue" type="number" placeholder="75000" value={form.estimatedValue} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Disbursal Mode</label>
              <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className="form-select">
                <option value="Cash">Cash Disbursal</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Calculated Net Asset Weight</label>
              <div className="form-input" style={{ background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed', color: 'var(--text-secondary)' }}>
                {previewNetWeight.toFixed(2)} grams
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Processing Disbursal..." : "Disburse Pawn Loan"}
            </button>
          </div>
        </form>
      </div>

      <div className="search-wrapper">
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
        <input 
          type="text" 
          placeholder="Search by customer name, pledged item, or loan reference..." 
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
                <th>Disbursal Date</th>
                <th>Collateral Asset</th>
                <th>Weight (Gross/Net)</th>
                <th>Market Value</th>
                <th>Principal Amount</th>
                <th>Interest Rate</th>
                <th>Mode</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>
                    <span className="badge badge-info">Fetching loans directory...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No pawn contracts found.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => {
                  const gross = l.grossWeight || 0;
                  const stone = l.stoneWeight || 0;
                  const net = l.netWeight ?? (gross - stone);
                  return (
                    <tr key={l._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {l.customer?.name || <span style={{ color: 'var(--danger)' }}>Deregistered User</span>}
                      </td>
                      <td>{new Date(l.loanDate).toLocaleDateString()}</td>
                      <td>{l.pledgedItemName}</td>
                      <td>
                        {gross.toFixed(2)}g / <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{net.toFixed(2)}g</span>
                      </td>
                      <td>₹{l.estimatedValue.toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{l.amount.toLocaleString()}</td>
                      <td>{l.interestRate}% / mo</td>
                      <td>
                        <span className={`badge ${l.paymentMode === 'Cash' ? 'badge-success' : 'badge-info'}`}>
                          {l.paymentMode}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <Link href={`/loans/${l._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(l._id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
