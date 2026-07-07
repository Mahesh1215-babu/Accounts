"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) throw new Error("Customer not found");
        const data = await res.json();
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      } catch (err: any) {
        setError(err.message || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    }
    if (id) loadCustomer();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      router.push("/customers");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer? All active loans under this customer may become orphaned.")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete customer");
      router.push("/customers");
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <span className="badge badge-info">Loading customer details...</span>
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div className="form-card">
        <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Error</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <Link href="/customers" className="btn btn-secondary">← Back to Directory</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Customer Profile</h1>
          <p className="page-subtitle">Modify customer personal information and communication preferences</p>
        </div>
        <Link href="/customers" className="btn btn-secondary">← Cancel</Link>
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
              <label className="form-label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Residential Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} className="form-input" rows={3} style={{ resize: 'none' }} />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={handleDelete} className="btn btn-danger">
              Delete Profile
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/customers" className="btn btn-secondary">Cancel</Link>
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
