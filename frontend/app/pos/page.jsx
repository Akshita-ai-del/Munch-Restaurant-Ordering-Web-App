'use client';
// P5 — Staff POS (scaffold)
import { ShoppingBag, Wifi, WifiOff } from 'lucide-react';

export default function POSPage() {
  return (
    <div style={{ padding: 'var(--space-6)', minHeight: '100dvh', background: 'var(--black)', color: 'var(--white)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <ShoppingBag size={28} color="var(--pink)" />
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 'var(--fs-2xl)' }}>Munch POS</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--fs-sm)' }}>The Yard Milkshake Bar — Staff Mode</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-sm)', color: '#00C853' }}>
          <Wifi size={14} /> Online
        </div>
      </div>
      <div style={{ background: 'var(--charcoal)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 'var(--space-4)' }}>🖥️</div>
        <h2 style={{ fontWeight: 800, fontSize: 'var(--fs-2xl)', marginBottom: 8 }}>POS — P5 Priority</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 280, margin: '0 auto' }}>
          In-store point-of-sale for staff. Offline-first, thermal receipt printing. Built after P1–P4 are complete.
        </p>
      </div>
    </div>
  );
}
