"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Customer {
  _id: string;
  name: string;
}

interface Loan {
  _id: string;
  amount: number;
  pledgedItemName: string;
  customer: Customer | null;
}

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loans, setLoans] = useState<Loan[]>([]);
  const [form, setForm] = useState({
    loan: "",
    amount: "",
    date: "",
    interestPortion: "",
    principalPortion: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [resLoans, resPay] = await Promise.all([
          fetch('/api/loans').then(r => r.json()),
          fetch(`/api/payments/${id}`).then(r => r.json()),
        ]);

        setLoans(resLoans || []);

        if (resPay.error) throw new Error(resPay.error);

        setForm({
          loan: resPay.loan?._id || resPay.loan || "",
          amount: resPay.amount?.toString() || "",
          date: resPay.date ? new Date(resPay.date).toISOString().split('T')[0] : "",
          interestPortion: resPay.interestPortion?.toString() || "0",
          principalPortion: resPay.principalPortion?.toString() || "0",
        });
      } catch (err: any) {
        setError(err.message || "Failed to load payment log");
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
      const res = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loan: form.loan,
          amount: Number(form.amount),
          date: form.date,
          interestPortion: Number(form.interestPortion),
          principalPortion: Number(form.principalPortion),
        }),
      });
      if (!res.ok) throw new Error("Failed to update payment entry");
      router.push("/payments");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this payment log?")) return;
    try {
      const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete payment entry");
      router.push("/payments");
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <span className="badge badge-info">Loading payment details...</span>
      </div>
    );
  }

  if (error && !form.amount) {
    return (
      <div className="form-card">
        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Error</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <Link href="/payments" className="btn btn-secondary">← Back to Logs</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Payment Entry</h1>
          <p className="page-subtitle">Adjust recorded amounts, interest shares, and linked loans of the payment receipt</p>
        </div>
        <Link href="/payments" className="btn btn-secondary">← Cancel</Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Linked Loan Contract</label>
              <select name="loan" value={form.loan} onChange={handleChange} required className="form-select">
                <option value="">-- Choose Active Loan --</option>
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
              <input name="amount" type="number" value={form.amount} onChange={handleChange} required className="form-input" min="1" />
            </div>

            <div className="form-group">
              <label className="form-label">Interest Portion (₹)</label>
              <input name="interestPortion" type="number" value={form.interestPortion} onChange={handleChange} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Principal Portion (₹)</label>
              <input name="principalPortion" type="number" value={form.principalPortion} onChange={handleChange} required className="form-input" />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={handleDelete} className="btn btn-danger">
              Delete Entry
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/payments" className="btn btn-secondary">Cancel</Link>
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
