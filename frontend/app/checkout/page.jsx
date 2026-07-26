'use client';
import { useState, Suspense } from 'react';
import { ArrowLeft, CreditCard, Banknote, Wallet, Tag, MapPin, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useOrder } from '@/context/OrderContext';
import { useToast } from '@/context/ToastContext';
import { promoApi, userApi } from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';

const PAYMENT_METHODS = [
  { id: 'card',   label: 'Card (Stripe)',  icon: '💳', desc: 'Visa, Mastercard, etc.' },
  { id: 'cash',   label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
  { id: 'wallet', label: 'Munch Wallet',   icon: '👛', desc: 'Use your balance' },
];

function CheckoutContent() {
  const params = useSearchParams();
  const subtotal    = parseFloat(params.get('subtotal')    || 0);
  const deliveryFee = parseFloat(params.get('deliveryFee') || 0);
  const tax         = parseFloat(params.get('tax')         || 0);
  const totalBase   = parseFloat(params.get('total')       || 0);

  const [payment, setPayment] = useState('cash');
  const [orderType, setOrderType] = useState('delivery');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [tip, setTip] = useState(0);
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);

  const { cart, clearCart } = useCart();
  const { placeOrder } = useOrder();
  const toast = useToast();
  const router = useRouter();

  const discount = promoApplied?.discountAmount || 0;
  const total = totalBase + tip - discount;

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const { data } = await promoApi.validate(promoCode, subtotal);
      setPromoApplied(data);
      toast.success(`Promo applied! Saved $${data.discountAmount.toFixed(2)} 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid promo code');
    } finally { setPromoLoading(false); }
  };

  const handlePlaceOrder = async () => {
    if (!cart?.items?.length) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const items = cart.items.map((i) => ({
        menuItemId: i.menuItemId, name: i.menuItem?.name, quantity: i.quantity,
        unitPrice: i.unitPrice, addons: i.addons ? JSON.parse(i.addons) : null,
      }));
      const order = await placeOrder({
        items, orderType, paymentMethod: payment, promoCode: promoApplied?.promo?.code,
        subtotal, deliveryFee, tax, tip, discount, total, specialNote: note,
      });
      await clearCart();
      router.push(`/confirmation?orderId=${order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  return (
    <>
      <div className="page-header">
        <button className="page-header-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="h3">Checkout</h1>
      </div>

      <div className="page-content">
        {/* Order type */}
        <div className="section">
          <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Order Type</h3>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {[['delivery','🚚','Delivery'],['pickup','🏃','Pickup'],['dine_in','🪑','Dine-in']].map(([type, emoji, label]) => (
              <button key={type} onClick={() => setOrderType(type)} style={{
                flex: 1, padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                border: `2px solid ${orderType === type ? 'var(--pink)' : 'var(--border)'}`,
                background: orderType === type ? 'var(--pink-surface)' : 'var(--surface)',
                fontWeight: 700, fontSize: 'var(--fs-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 20 }}>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery address */}
        {orderType === 'delivery' && (
          <div className="section">
            <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Delivery Address</h3>
            <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }} onClick={() => router.push('/profile?tab=addresses')}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--pink-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="var(--pink)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>123 Main St, New York</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Home • Tap to change</p>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>
        )}

        {/* Payment */}
        <div className="section">
          <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Payment Method</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {PAYMENT_METHODS.map((m) => (
              <div key={m.id} className={`payment-card ${payment === m.id ? 'selected' : ''}`} onClick={() => setPayment(m.id)}>
                <div className="payment-card-icon">{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{m.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.desc}</p>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${payment === m.id ? 'var(--pink)' : 'var(--border)'}`, background: payment === m.id ? 'var(--pink)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {payment === m.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--white)' }} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="section">
          <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Add a Tip 🤍</h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {[0, 1, 2, 3].map((t) => (
              <button key={t} onClick={() => setTip(t)} className={`chip ${tip === t ? 'chip-active' : 'chip-default'}`} style={{ flex: 1, justifyContent: 'center' }}>
                {t === 0 ? 'No tip' : `$${t}`}
              </button>
            ))}
          </div>
        </div>

        {/* Promo code */}
        <div className="section">
          <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Promo Code</h3>
          {promoApplied ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: 'var(--pink-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--pink)' }}>
              <Tag size={16} color="var(--pink)" />
              <span style={{ flex: 1, fontWeight: 700, color: 'var(--pink)' }}>{promoApplied.promo.code} — ${promoApplied.discountAmount.toFixed(2)} off</span>
              <button onClick={() => { setPromoApplied(null); setPromoCode(''); }} style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>Remove</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input className="input" placeholder="Enter code (try MUNCH10)" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} style={{ flex: 1 }} />
              <button className="btn btn-outline btn-sm" onClick={applyPromo} disabled={promoLoading}>
                {promoLoading ? '...' : 'Apply'}
              </button>
            </div>
          )}
        </div>

        {/* Special note */}
        <div className="section">
          <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Special Instructions</h3>
          <textarea className="input" rows={2} placeholder="Any requests for the store..." value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: 'none' }} />
        </div>

        {/* Order summary */}
        <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Total Breakdown</h3>
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>{deliveryFee === 0 ? <span style={{ color: '#00C853', fontWeight: 700 }}>FREE</span> : `$${deliveryFee.toFixed(2)}`}</span></div>
          <div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
          {tip > 0 && <div className="summary-row"><span>Tip 🤍</span><span>${tip.toFixed(2)}</span></div>}
          {discount > 0 && <div className="summary-row"><span style={{ color: '#00C853' }}>Promo 🎉</span><span style={{ color: '#00C853' }}>-${discount.toFixed(2)}</span></div>}
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={placing}>
          {placing
            ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
            : `Place Order — $${total.toFixed(2)} 🚀`
          }
        </button>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="page-content" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
