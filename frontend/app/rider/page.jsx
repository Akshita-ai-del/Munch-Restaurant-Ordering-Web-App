'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Bike, MapPin, CheckCircle2, Phone, Clock, Package,
  Navigation, RefreshCw, Wifi, WifiOff, ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { adminApi, orderApi } from '@/services/api';
import { connectSocket, disconnectSocket } from '@/services/socket';

/* ─── helpers ───────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatAddress(addr) {
  if (!addr) return 'No address';
  return [addr.line1, addr.line2, addr.city, addr.zip].filter(Boolean).join(', ');
}

/* ─── Status config for rider ───────────────────────────────── */
const RIDER_FLOW = [
  { status: 'ready',            label: 'Ready to pick up', actionLabel: 'Accept & Pick Up', actionStatus: 'out_for_delivery', color: '#00B0FF', bg: '#E1F5FE', icon: Package },
  { status: 'out_for_delivery', label: 'On your way',       actionLabel: 'Mark Delivered ✓', actionStatus: 'delivered',         color: '#FF9800', bg: '#FFF3E0', icon: Navigation },
];

/* ─── Delivery Card ─────────────────────────────────────────── */
function DeliveryCard({ order, onAction }) {
  const [loading, setLoading] = useState(false);
  const flow = RIDER_FLOW.find(f => f.status === order.status);

  const handleAction = async () => {
    if (!flow) return;
    setLoading(true);
    await onAction(order.id, flow.actionStatus);
    setLoading(false);
  };

  if (!flow) return null;

  const Icon = flow.icon;
  const addr = order.address;

  return (
    <div style={{
      background: 'var(--charcoal)', borderRadius: 'var(--radius-xl)',
      overflow: 'hidden', border: `1px solid ${flow.color}33`,
    }}>
      {/* Status strip */}
      <div style={{ background: flow.color + '22', padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: `1px solid ${flow.color}33` }}>
        <Icon size={16} color={flow.color} />
        <span style={{ color: flow.color, fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{flow.label}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
          <Clock size={9} style={{ verticalAlign: 'middle' }} /> {timeAgo(order.placedAt)}
        </span>
      </div>

      <div style={{ padding: 'var(--space-4)' }}>
        {/* Order number + customer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 'var(--fs-lg)', color: '#fff' }}>#{order.orderNumber}</p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
              {order.customer?.name || 'Customer'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 900, fontSize: 'var(--fs-xl)', color: 'var(--pink)' }}>
              £{Number(order.total).toFixed(2)}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {order.paymentMethod === 'cash' ? '💵 Cash' : '💳 Card'}
            </p>
          </div>
        </div>

        {/* Address */}
        {addr && (
          <div style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)', marginBottom: 'var(--space-3)',
            display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start',
          }}>
            <MapPin size={16} color="#FF9800" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--fs-sm)', color: '#fff', fontWeight: 600 }}>{addr.label || 'Delivery address'}</p>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{formatAddress(addr)}</p>
            </div>
            {/* Google Maps deep link */}
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(addr))}`}
              target="_blank" rel="noopener noreferrer"
              style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: '#FF9800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Navigation size={15} color="#fff" />
            </a>
          </div>
        )}

        {/* Items summary */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          {order.items?.slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.6)', padding: '3px 0' }}>
              <span>{item.quantity}× {item.name}</span>
            </div>
          ))}
          {(order.items?.length || 0) > 3 && (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              +{order.items.length - 3} more items
            </p>
          )}
        </div>

        {/* Customer phone */}
        {order.customer?.phone && (
          <a
            href={`tel:${order.customer.phone}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)', marginBottom: 'var(--space-3)',
              color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-sm)',
            }}
          >
            <Phone size={15} color="var(--pink)" />
            {order.customer.phone}
            <ChevronRight size={13} style={{ marginLeft: 'auto' }} />
          </a>
        )}

        {/* CTA */}
        <button
          onClick={handleAction}
          disabled={loading}
          style={{
            width: '100%', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
            background: loading ? 'rgba(255,255,255,0.1)' : flow.color,
            color: '#fff', fontWeight: 800, fontSize: 'var(--fs-md)',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
            transition: '0.2s',
          }}
        >
          {loading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />}
          {loading ? 'Updating…' : flow.actionLabel}
        </button>
      </div>
    </div>
  );
}

/* ─── Completed item ────────────────────────────────────────── */
function CompletedRow({ order }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', background: 'var(--charcoal)', borderRadius: 'var(--radius-md)' }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: '#fff' }}>#{order.orderNumber}</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{order.customer?.name} · {timeAgo(order.deliveredAt || order.placedAt)}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <p style={{ fontWeight: 800, color: '#00C853' }}>£{Number(order.total).toFixed(2)}</p>
        <CheckCircle2 size={16} color="#00C853" />
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function RiderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState('deliveries'); // deliveries | done

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await adminApi.getAllOrders();
      setOrders(data.orders || []);
    } catch {
      // auth error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const s = connectSocket();
    s.emit('join-staff-room');
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('new-order', (o) => setOrders(prev => [o, ...prev]));
    s.on('order-status-updated', ({ orderId, status }) =>
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    );
    return () => {
      s.off('new-order');
      s.off('order-status-updated');
      disconnectSocket();
    };
  }, []);

  const handleAction = async (id, status) => {
    await orderApi.updateStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const deliveryOrders = orders.filter(o =>
    o.orderType === 'delivery' && ['ready', 'out_for_delivery'].includes(o.status)
  );
  const doneToday = orders.filter(o =>
    o.status === 'delivered' &&
    new Date(o.deliveredAt || o.placedAt).toDateString() === new Date().toDateString()
  );
  const todayEarnings = doneToday.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--black)', color: '#fff', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-5) var(--space-4) var(--space-4)',
        background: 'linear-gradient(160deg, #1A1A1A 0%, #0A0A0A 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bike size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 'var(--fs-xl)' }}>Rider App</h1>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Munch Delivery Partner</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: connected ? '#00C853' : '#FF5252' }}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? 'Live' : 'Offline'}
            </div>
            <button
              onClick={fetchOrders}
              style={{ width: 34, height: 34, borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={14} color="#fff" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>ACTIVE RUNS</p>
            <p style={{ fontWeight: 900, fontSize: 'var(--fs-2xl)', color: 'var(--pink)' }}>{deliveryOrders.length}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>TODAY'S ORDERS</p>
            <p style={{ fontWeight: 900, fontSize: 'var(--fs-2xl)', color: '#00C853' }}>£{todayEarnings.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: 'var(--space-3) var(--space-4) 0', gap: 'var(--space-2)' }}>
        {[
          { key: 'deliveries', label: `Runs (${deliveryOrders.length})` },
          { key: 'done', label: `Completed (${doneToday.length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 16px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 'var(--fs-sm)',
            background: tab === key ? 'var(--pink)' : 'rgba(255,255,255,0.08)',
            color: tab === key ? '#fff' : 'rgba(255,255,255,0.5)',
            transition: '0.2s',
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: 'var(--space-4)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1, 2].map(n => <div key={n} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-xl)', background: 'var(--charcoal)' }} />)}
          </div>
        ) : tab === 'deliveries' ? (
          deliveryOrders.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <Bike size={56} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto var(--space-4)' }} />
              <p style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'rgba(255,255,255,0.4)' }}>No active deliveries</p>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
                New runs will appear here in real-time
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {deliveryOrders.map(order => (
                <DeliveryCard key={order.id} order={order} onAction={handleAction} />
              ))}
            </div>
          )
        ) : (
          doneToday.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <CheckCircle2 size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto var(--space-4)' }} />
              <p style={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>No completions today yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {doneToday.map(order => <CompletedRow key={order.id} order={order} />)}
            </div>
          )
        )}
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
