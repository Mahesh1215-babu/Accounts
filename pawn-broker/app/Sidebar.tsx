"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/customers', label: 'Customers', icon: '👥' },
    { href: '/loans', label: 'Loans', icon: '💼' },
    { href: '/payments', label: 'Payments', icon: '💳' },
    { href: '/vouchers', label: 'Vouchers', icon: '🎟️' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>💎</span> PawnBroker
      </div>
      <nav className="sidebar-menu">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        v1.0.0 Stable
      </div>
    </aside>
  );
}
