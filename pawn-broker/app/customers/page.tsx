"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const result = customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    );
    setFiltered(result);
  }, [search, customers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to register customer.");
        return;
      }
      setForm({ name: "", email: "", phone: "", address: "" });
      setSuccessMsg(`Customer "${data.name}" registered successfully!`);
      await fetchCustomers();
      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All active loans under this customer may become orphaned.`)) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete customer.");
        return;
      }
      await fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers Directory</h1>
          <p className="page-subtitle">Manage system client records and registration profiles</p>
        </div>
      </div>

      <div className="form-card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontWeight: 600 }}>Register New Customer</h2>

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
              <label className="form-label">Full Name *</label>
              <input
                name="name"
                placeholder="e.g. Ravi Kumar"
                value={form.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                name="email"
                type="email"
                placeholder="e.g. ravi@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                name="phone"
                placeholder="e.g. +91 9876543210"
                value={form.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Residential Address</label>
              <textarea
                name="address"
                placeholder="e.g. 12, Main St, Chennai - 600001"
                value={form.address}
                onChange={handleChange}
                className="form-input"
                rows={2}
                style={{ resize: 'none' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Registering..." : "Register Customer"}
            </button>
          </div>
        </form>
      </div>

      <div className="search-wrapper">
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
        <input
          type="text"
          placeholder="Search by name, email or phone..."
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
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Registered</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <span className="badge badge-info">Fetching customer directory...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {search ? "No customers match your search." : "No customers registered yet. Add one above."}
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={c._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}</td>
                    <td>{c.address || <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Link href={`/customers/${c._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(c._id, c.name)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
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
