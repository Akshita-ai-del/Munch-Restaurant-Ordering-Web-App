'use client';
import { useEffect, useState } from 'react';
import { PartyPopper, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { orderApi } from '@/services/api';

export default function ConfirmationPage() {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) orderApi.getById(orderId).then(({ data }) => setOrder(data.order));
  }, [orderId]);

  return (
    <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', minHeight: '100dvh' }}>
      {/* Rainbow celebration card */}
      <div className="rainbow-banner animate-pop">
        <div style={{ fontSize: 64, marginBottom: 'var(--space-3)' }}>🎉</div>
        <h1 style={{ fontSize: 'var(--fs-3xl)', fontWeight: 900, marginBottom: 8 }}>Order Placed!</h1>
        <p style={{ fontSize: 'var(--fs-md)', opacity: 0.9 }}>
          Your delicious treats are on their way 🍦
        </p>
        {order && (
          <div style={{ marginTop: 'var(--space-4)', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', backdropFilter: 'blur(4px)' }}>
            <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', opacity: 0.85 }}>Order Number</p>
            <p style={{ fontWeight: 900, fontSize: 'var(--fs-xl)', letterSpacing: '0.05em' }}>{order.orderNumber}</p>
          </div>
        )}
      </div>

      {/* Order details */}
      {order && (
        <div className="card" style={{ padding: 'var(--space-5)', animation: 'fade-up 0.5s ease 0.2s both' }}>
          <h3 className="h4" style={{ marginBottom: 'var(--space-4)' }}>Your Order</h3>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 'var(--fs-sm)' }}>
              <span>{item.quantity}× {item.name}</span>
              <span style={{ fontWeight: 700 }}>${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 'var(--fs-lg)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--pink)' }}>${order.total.toFixed(2)}</span>
          </div>
          {order.estimatedTime && (
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--pink-surface)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span>⏱</span>
              <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>Estimated delivery: {order.estimatedTime} min</span>
            </div>
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', animation: 'fade-up 0.5s ease 0.4s both' }}>
        {orderId && (
          <Link href={`/order/${orderId}`} className="btn btn-primary btn-lg">
            <ClipboardList size={20} />
            Track My Order
          </Link>
        )}
        <Link href="/" className="btn btn-outline btn-lg">
          Back to Home
        </Link>
      </div>

      {/* Confetti SVG animation */}
      <div className="confetti" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
          {[...Array(20)].map((_, i) => (
            <circle key={i} cx={Math.random()*400} cy={-20} r={4} fill={['#FF1F8E','#FFD700','#00E676','#00B0FF','#AA00FF'][i%5]}
              style={{ animation: `fall ${1.5 + Math.random()*2}s linear ${Math.random()*2}s infinite` }} />
          ))}
        </svg>
        <style>{`
          @keyframes fall {
            0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(800px) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
