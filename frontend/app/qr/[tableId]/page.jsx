'use client';
import { useEffect, useState } from 'react';
import { menuApi } from '@/services/api';
import MenuCard from '@/components/MenuCard';
import { QrCode } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function TableMenuPage({ params }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { count, subtotal } = useCart();

  useEffect(() => {
    menuApi.getAll().then(({ data }) => setItems(data.items)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Table header */}
      <div style={{ background: 'var(--black)', padding: 'var(--space-5)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginBottom: 4 }}>
          <QrCode size={20} color="var(--pink)" />
          <span style={{ color: 'var(--white)', fontWeight: 700 }}>Table {params.tableId}</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'var(--fs-sm)' }}>Dine-in menu · Browse & add to table</p>
      </div>

      <div className="page-content" style={{ paddingBottom: count ? 120 : 'var(--space-6)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1,2,3].map((n) => <div key={n} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {items.map((item) => <MenuCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Running total */}
      {count > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'var(--max-w)', padding: 'var(--space-4)', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <Link href="/cart" className="btn btn-primary btn-lg" style={{ justifyContent: 'space-between' }}>
            <span>{count} items</span>
            <span>View Cart — ${subtotal.toFixed(2)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
