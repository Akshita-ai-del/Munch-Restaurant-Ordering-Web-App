'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react';
import { orderApi } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

const STATUS_COLORS = {
  placed: '#888', confirmed: '#FF9800', preparing: '#FF1F8E',
  ready: '#00BCD4', out_for_delivery: '#2196F3', delivered: '#00C853', cancelled: '#F44336',
};
const STATUS_LABELS = {
  placed: '📋 Placed', confirmed: '✅ Confirmed', preparing: '👨‍🍳 Preparing',
  ready: '📦 Ready', out_for_delivery: '🚴 On the way', delivered: '✅ Delivered', cancelled: '❌ Cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    orderApi.getAll()
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  const handleReorder = async (orderId) => {
    try {
      const { data } = await orderApi.reorder(orderId);
      for (const item of data.items) {
        await addItem(item.menuItemId, item.quantity);
      }
      toast.success('Items added to cart! 🎉');
      router.push('/cart');
    } catch { toast.error('Failed to reorder'); }
  };

  return (
    <>
      <div className="page-header">
        <button className="page-header-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="h3">Order History</h1>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1,2,3].map((n) => <div key={n} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No orders yet</div>
            <div className="empty-state-desc">Place your first order to see it here</div>
            <Link href="/menu" className="btn btn-primary" style={{ marginTop: 8 }}>Browse Menu 🍦</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {orders.map((order) => (
              <div key={order.id} className="card" style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
                onClick={() => router.push(`/order/${order.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{order.orderNumber}</span>
                  <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: STATUS_COLORS[order.status], background: STATUS_COLORS[order.status] + '18', borderRadius: 'var(--radius-full)', padding: '3px 10px' }}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <p style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', marginBottom: 4 }}>
                  {order.items.slice(0,2).map((i) => `${i.name}`).join(', ')}
                  {order.items.length > 2 && ` +${order.items.length - 2} more`}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 800, color: 'var(--pink)' }}>${order.total.toFixed(2)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {new Date(order.placedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ gap: 4 }} onClick={(e) => { e.stopPropagation(); handleReorder(order.id); }}>
                    <RotateCcw size={13} /> Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
