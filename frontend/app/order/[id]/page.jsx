'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle, Star } from 'lucide-react';
import { orderApi } from '@/services/api';
import { connectSocket } from '@/services/socket';
import OrderStatusTimeline from '@/components/OrderStatusTimeline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderTrackingPage({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    orderApi.getById(params.id)
      .then(({ data }) => { setOrder(data.order); setLoading(false); })
      .catch(() => { router.push('/orders'); });

    // Subscribe to live status updates
    const socket = connectSocket();
    socket.emit('join-order', params.id);
    socket.on('order-status-updated', ({ status }) => {
      setOrder((prev) => prev ? { ...prev, status } : prev);
    });
    return () => { socket.off('order-status-updated'); socket.emit('leave-order', params.id); };
  }, [params.id]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!order) return null;

  const isDelivered = order.status === 'delivered';

  return (
    <>
      <div className="page-header">
        <button className="page-header-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <div style={{ flex: 1 }}>
          <h1 className="h3">Order Status</h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{order.orderNumber}</p>
        </div>
        <Link href={`/order/${order.id}/chat`} className="btn-icon" style={{ background: 'var(--pink-surface)', color: 'var(--pink)' }}>
          <MessageCircle size={20} />
        </Link>
      </div>

      <div className="page-content">
        {/* Status card */}
        <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)', background: isDelivered ? 'linear-gradient(135deg, #FF1F8E11, #AA00FF11)' : 'var(--surface)' }}>
          <OrderStatusTimeline status={order.status} />
        </div>

        {/* Estimated time */}
        {!isDelivered && order.estimatedTime && (
          <div style={{ textAlign: 'center', padding: 'var(--space-5)', background: 'var(--pink)', borderRadius: 'var(--radius-xl)', color: 'var(--white)', marginBottom: 'var(--space-5)' }}>
            <p style={{ fontSize: 'var(--fs-sm)', opacity: 0.85, marginBottom: 4, fontWeight: 600 }}>Estimated Arrival</p>
            <p style={{ fontSize: 'var(--fs-4xl)', fontWeight: 900 }}>{order.estimatedTime}<span style={{ fontSize: 'var(--fs-xl)' }}> min</span></p>
          </div>
        )}

        {/* Order items */}
        <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Order Items</h3>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 'var(--fs-sm)', borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontWeight: 600 }}>{item.quantity}× {item.name}</span>
              <span style={{ color: 'var(--pink)', fontWeight: 700 }}>${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-3)', fontWeight: 800, fontSize: 'var(--fs-lg)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--pink)' }}>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Rate order button (if delivered and no review) */}
        {isDelivered && !order.review && (
          <Link href={`/order/${order.id}/rate`} className="btn btn-primary btn-lg">
            <Star size={20} />
            Rate Your Order ⭐
          </Link>
        )}

        {/* Chat shortcut */}
        <Link href={`/order/${order.id}/chat`} className="btn btn-outline btn-lg" style={{ marginTop: 'var(--space-3)' }}>
          <MessageCircle size={20} />
          Chat with Store
        </Link>
      </div>
    </>
  );
}
