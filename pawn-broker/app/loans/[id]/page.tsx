"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Customer {
  _id: string;
  name: string;
}

export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [form, setForm] = useState({
    customer: "",
    loanDate: "",
    amount: "",
    interestRate: "",
    pledgedItemName: "",
    grossWeight: "",
    stoneWeight: "",
    estimatedValue: "",
    paymentMode: "Cash" as "Cash" | "Bank",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [resCust, resLoan] = await Promise.all([
          fetch('/api/customers').then(r => r.json()),
          fetch(`/api/loans/${id}`).then(r => r.json()),
        ]);
        
        setCustomers(resCust || []);
        
        if (resLoan.error) throw new Error(resLoan.error);
        
        setFinancials(resLoan.financials || null);
        setForm({
          customer: resLoan.customer?._id || resLoan.customer || "",
          loanDate: resLoan.loanDate ? new Date(resLoan.loanDate).toISOString().split('T')[0] : "",
          amount: resLoan.amount?.toString() || "",
          interestRate: resLoan.interestRate?.toString() || "",
          pledgedItemName: resLoan.pledgedItemName || "",
          grossWeight: resLoan.grossWeight?.toString() || "",
          stoneWeight: resLoan.stoneWeight?.toString() || "0",
          estimatedValue: resLoan.estimatedValue?.toString() || "",
          paymentMode: resLoan.paymentMode || "Cash",
        });
      } catch (err: any) {
        setError(err.message || "Failed to load loan record");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/loans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
      if (!res.ok) throw new Error("Failed to save loan updates");
      router.push("/loans");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this loan record? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/loans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete loan");
      router.push("/loans");
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  };

  const previewNetWeight = (Number(form.grossWeight) || 0) - (Number(form.stoneWeight) || 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <span className="badge badge-info">Loading loan contract details...</span>
      </div>
    );
  }

  if (error && !form.amount) {
    return (
      <div className="form-card">
        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Error</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <Link href="/loans" className="btn btn-secondary">← Back to Ledger</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Pawn Loan</h1>
          <p className="page-subtitle">Update parameters, values, and collateral calculations of the active contract</p>
        </div>
        <Link href="/loans" className="btn btn-secondary">← Cancel</Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {financials && (
        <div className="form-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📈</span> Financial State & Servicing Summary
          </h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Original Loan Amount</span>
              <span className="detail-value">₹{financials.amount?.toLocaleString()}</span>
            </div>
            <div className="detail-item" style={{ borderLeftColor: 'var(--warning)' }}>
              <span className="detail-label">Accrued Interest Till Date</span>
              <span className="detail-value">₹{financials.interestAccrued?.toLocaleString()}</span>
            </div>
            <div className="detail-item" style={{ borderLeftColor: 'var(--success)' }}>
              <span className="detail-label">Principal Paid</span>
              <span className="detail-value">₹{financials.principalPaid?.toLocaleString()}</span>
            </div>
            <div className="detail-item" style={{ borderLeftColor: 'var(--success)' }}>
              <span className="detail-label">Interest Paid</span>
              <span className="detail-value">₹{financials.interestPaid?.toLocaleString()}</span>
            </div>
            <div className="detail-item" style={{ borderLeftColor: 'var(--accent)' }}>
              <span className="detail-label">Balance Principal</span>
              <span className="detail-value">₹{financials.balancePrincipal?.toLocaleString()}</span>
            </div>
            <div className="detail-item" style={{ borderLeftColor: 'var(--danger)' }}>
              <span className="detail-label">Total Amount Payable</span>
              <span className="detail-value" style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{financials.totalPayable?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Profile</label>
              <select name="customer" value={form.customer} onChange={handleChange} required className="form-select">
                <option value="">-- Choose Registered Customer --</option>
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
              <input name="amount" type="number" value={form.amount} onChange={handleChange} required className="form-input" min="1" />
            </div>

            <div className="form-group">
              <label className="form-label">Interest Rate (% per month)</label>
              <input name="interestRate" type="number" step="0.01" value={form.interestRate} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Pledged Collateral Item</label>
              <input name="pledgedItemName" value={form.pledgedItemName} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Gross Weight (grams)</label>
              <input name="grossWeight" type="number" step="0.01" value={form.grossWeight} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Stone Weight (grams)</label>
              <input name="stoneWeight" type="number" step="0.01" value={form.stoneWeight} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Market Value (₹)</label>
              <input name="estimatedValue" type="number" value={form.estimatedValue} onChange={handleChange} required className="form-input" />
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

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={handleDelete} className="btn btn-danger">
              Delete Contract
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/loans" className="btn btn-secondary">Cancel</Link>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
