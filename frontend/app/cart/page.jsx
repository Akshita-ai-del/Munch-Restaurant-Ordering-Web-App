'use client';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function CartPage() {
  const { cart, count, subtotal, updateItem, removeItem } = useCart();
  const router = useRouter();

  const deliveryFee = subtotal > 0 ? (subtotal >= 30 ? 0 : 3.99) : 0;
  const tax         = subtotal * 0.08;
  const total       = subtotal + deliveryFee + tax;

  if (!count) return (
    <>
      <div className="page-header">
        <button className="page-header-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="h3">Cart</h1>
      </div>
      <div className="empty-state" style={{ minHeight: '70dvh' }}>
        <div className="empty-state-icon">🛒</div>
        <div className="empty-state-title">Your cart is empty</div>
        <div className="empty-state-desc">Add some delicious milkshakes and treats!</div>
        <Link href="/menu" className="btn btn-primary" style={{ marginTop: 8 }}>Browse Menu 🍦</Link>
      </div>
      <BottomNav />
    </>
  );

  return (
    <>
      <div className="page-header">
        <button className="page-header-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="h3">Cart ({count})</h1>
      </div>

      <div className="page-content">
        {/* Items */}
        <div className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
          {cart?.items?.map((item) => (
            <div key={item.id} className="cart-item-row">
              {item.menuItem?.imageUrl && (
                <img src={item.menuItem.imageUrl} alt={item.menuItem.name} style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.menuItem?.name || 'Item'}</p>
                {item.addons && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {Object.values(JSON.parse(item.addons)).map((a) => a.label).join(', ')}
                  </p>
                )}
                <p style={{ fontWeight: 800, color: 'var(--pink)', fontSize: 'var(--fs-sm)', marginTop: 2 }}>${(item.unitPrice * item.quantity).toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                <button onClick={() => removeItem(item.id)} style={{ color: 'var(--grey-400)', padding: 4 }}>
                  <Trash2 size={14} />
                </button>
                <div className="qty-control" style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}>
                  <button className="qty-btn" onClick={() => updateItem(item.id, item.quantity - 1)}><Minus size={12} /></button>
                  <span className="qty-num" style={{ fontSize: 13 }}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateItem(item.id, item.quantity + 1)}><Plus size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Free delivery banner */}
        {deliveryFee > 0 && (
          <div style={{ background: 'var(--pink-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', border: '1px dashed var(--pink-light)' }}>
            <span>🚚</span>
            <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Add <strong style={{ color: 'var(--pink)' }}>${(30 - subtotal).toFixed(2)}</strong> more for free delivery!
            </p>
          </div>
        )}

        {/* Order summary */}
        <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? <span style={{ color: '#00C853', fontWeight: 700 }}>FREE</span> : `$${deliveryFee.toFixed(2)}`}</span>
          </div>
          <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        {/* Checkout button */}
        <Link href={{ pathname: '/checkout', query: { subtotal, deliveryFee, tax, total } }} className="btn btn-primary btn-lg" style={{ marginBottom: 'var(--space-4)' }}>
          <ShoppingBag size={20} />
          Proceed to Checkout — ${total.toFixed(2)}
        </Link>
      </div>
      <BottomNav />
    </>
  );
}
