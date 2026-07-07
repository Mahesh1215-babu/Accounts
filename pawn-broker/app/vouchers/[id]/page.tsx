"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function VoucherDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    voucherNo: "",
    date: "",
    account: "",
    debit: "0",
    credit: "0",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVoucher() {
      try {
        const res = await fetch(`/api/vouchers/${id}`);
        if (!res.ok) throw new Error("Voucher entry not found");
        const data = await res.json();
        setForm({
          voucherNo: data.voucherNo?.toString() || "",
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
          account: data.account || "",
          debit: data.debit?.toString() || "0",
          credit: data.credit?.toString() || "0",
        });
      } catch (err: any) {
        setError(err.message || "Failed to load voucher details");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadVoucher();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(errData.error || "Failed to save updates. Ensure voucher number is unique.");
      }
      router.push("/vouchers");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this voucher entry?")) return;
    try {
      const res = await fetch(`/api/vouchers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete voucher entry");
      router.push("/vouchers");
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <span className="badge badge-info">Loading voucher journal entry...</span>
      </div>
    );
  }

  if (error && !form.voucherNo) {
    return (
      <div className="form-card">
        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Error</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <Link href="/vouchers" className="btn btn-secondary">← Back to Ledger</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Journal Voucher</h1>
          <p className="page-subtitle">Amend transaction details, debits, credits, or target accounting ledgers</p>
        </div>
        <Link href="/vouchers" className="btn btn-secondary">← Cancel</Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', color: 'var(--danger)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Voucher Number</label>
              <input name="voucherNo" type="number" value={form.voucherNo} onChange={handleChange} required className="form-input" />
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

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={handleDelete} className="btn btn-danger">
              Delete Entry
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/vouchers" className="btn btn-secondary">Cancel</Link>
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
