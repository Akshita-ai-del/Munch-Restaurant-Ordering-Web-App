'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, ChefHat, Bike, CheckCircle2, XCircle,
  Clock, RefreshCw, Bell, TrendingUp, Package, DollarSign,
  ChevronDown, LogOut, Wifi, WifiOff,
} from 'lucide-react';
import { adminApi, orderApi } from '@/services/api';
import { connectSocket, disconnectSocket } from '@/services/socket';

/* ─── Status helpers ────────────────────────────────────────── */
const STATUS_META = {
  placed:            { label: 'New',          color: '#FF1F8E', bg: '#FFE0F0', icon: Bell },
  confirmed:         { label: 'Confirmed',    color: '#FF9800', bg: '#FFF3E0', icon: ClipboardList },
  preparing:         { label: 'Preparing',    color: '#9C27B0', bg: '#F3E5F5', icon: ChefHat },
  ready:             { label: 'Ready',        color: '#00B0FF', bg: '#E1F5FE', icon: Package },
  out_for_delivery:  { label: 'On the way',   color: '#00C853', bg: '#E8F5E9', icon: Bike },
  delivered:         { label: 'Delivered',    color: '#4CAF50', bg: '#E8F5E9', icon: CheckCircle2 },
  cancelled:         { label: 'Cancelled',    color: '#888',    bg: '#F5F5F5', icon: XCircle },
};

const NEXT_STATUS = {
  placed:           'confirmed',
  confirmed:        'preparing',
  preparing:        'ready',
  ready:            'out_for_delivery',
  out_for_delivery: 'delivered',
};

const ORDER_TYPE_LABEL = { delivery: '🛵 Delivery', dine_in: '🍽 Dine-in', pickup: '🥡 Pickup' };

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/* ─── Order Card ────────────────────────────────────────────── */
function OrderCard({ order, onAdvance, onCancel }) {
  const [expanding, setExpanding] = useState(false);
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[order.status] || STATUS_META.placed;
  const StatusIcon = meta.icon;
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      border: `2px solid ${meta.color}22`,
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Card header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: 'var(--space-4)', cursor: 'pointer',
          borderLeft: `4px solid ${meta.color}`,
        }}
      >
        {/* Status badge */}
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius-md)',
          background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <StatusIcon size={20} color={meta.color} />
        </div>

        {/* Order info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 'var(--fs-sm)' }}>#{order.orderNumber}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: meta.color,
              background: meta.bg, padding: '2px 6px', borderRadius: 99,
            }}>{meta.label}</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {order.customer?.name || 'Guest'} · {ORDER_TYPE_LABEL[order.orderType] || order.orderType}
            {order.tableNumber ? ` · Table ${order.tableNumber}` : ''}
          </p>
        </div>

        {/* Right side */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 'var(--fs-sm)', color: 'var(--pink)' }}>
            £{Number(order.total).toFixed(2)}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            <Clock size={9} style={{ verticalAlign: 'middle', marginRight: 2 }} />
            {timeAgo(order.placedAt)}
          </p>
        </div>

        <ChevronDown size={16} color="var(--text-muted)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-4)', borderTop: '1px solid var(--border)' }}>
          {/* Items */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)', padding: '4px 0', borderBottom: i < order.items.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                <span style={{ fontWeight: 600 }}>{item.quantity}× {item.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>£{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {order.specialNote && (
            <div style={{ background: '#FFF3E0', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-3)', fontSize: 'var(--fs-sm)', color: '#E65100' }}>
              📝 {order.specialNote}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {nextStatus && (
              <button
                onClick={() => onAdvance(order.id, nextStatus)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                  background: meta.color, color: '#fff', fontWeight: 700,
                  fontSize: 'var(--fs-sm)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <RefreshCw size={14} />
                Mark as {STATUS_META[nextStatus]?.label}
              </button>
            )}
            {!['delivered', 'cancelled'].includes(order.status) && (
              <button
                onClick={() => onCancel(order.id)}
                style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: '#FFF0F0', color: '#E53935', fontWeight: 700,
                  fontSize: 'var(--fs-sm)', border: '1px solid #FFCDD2', cursor: 'pointer',
                }}
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)', boxShadow: 'var(--shadow-sm)',
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
        <p style={{ fontWeight: 900, fontSize: 'var(--fs-xl)', lineHeight: 1.2 }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // active | all | delivered
  const [connected, setConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await adminApi.getAllOrders();
      setOrders(data.orders || []);
      setLastRefresh(new Date());
    } catch {
      // ignore – auth error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + real-time socket
  useEffect(() => {
    fetchOrders();
    const s = connectSocket();
    s.emit('join-staff-room');
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('new-order', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });
    s.on('order-status-updated', ({ orderId, status }) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    });
    return () => {
      s.off('new-order');
      s.off('order-status-updated');
      disconnectSocket();
    };
  }, []);

  const handleAdvance = async (id, status) => {
    await orderApi.updateStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleCancel = async (id) => {
    await orderApi.updateStatus(id, 'cancelled');
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
  };

  // Filter
  const ACTIVE_STATUSES = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];
  const filtered = orders.filter(o => {
    if (filter === 'active') return ACTIVE_STATUSES.includes(o.status);
    if (filter === 'delivered') return o.status === 'delivered';
    return true;
  });

  // KPIs
  const activeCount = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;
  const todayRevenue = orders
    .filter(o => o.status !== 'cancelled' && new Date(o.placedAt).toDateString() === new Date().toDateString())
    .reduce((s, o) => s + Number(o.total), 0);
  const todayOrders = orders.filter(o => new Date(o.placedAt).toDateString() === new Date().toDateString()).length;

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F4F1', paddingBottom: 32 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--black)', color: '#fff',
        padding: 'var(--space-4) var(--space-4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
      }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 'var(--fs-xl)', letterSpacing: -0.5 }}>⚡ Admin</h1>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
            The Yard Milkshake Bar · Back-of-house
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: connected ? '#00C853' : '#FF5252' }}>
            {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
            {connected ? 'Live' : 'Offline'}
          </div>
          <button
            onClick={fetchOrders}
            style={{ width: 34, height: 34, borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RefreshCw size={15} color="#fff" />
          </button>
        </div>
      </div>

      <div style={{ padding: 'var(--space-4)', maxWidth: 600, margin: '0 auto' }}>
        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <StatCard icon={Bell} label="Active" value={activeCount} color="var(--pink)" />
          <StatCard icon={Package} label="Today" value={todayOrders} color="#FF9800" />
          <StatCard icon={DollarSign} label="Revenue" value={`£${todayRevenue.toFixed(0)}`} color="#00C853" />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {[
            { key: 'active', label: `Active (${activeCount})` },
            { key: 'all', label: 'All orders' },
            { key: 'delivered', label: 'Delivered' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-full)',
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 'var(--fs-sm)',
                background: filter === key ? 'var(--black)' : 'var(--white)',
                color: filter === key ? '#fff' : 'var(--text-secondary)',
                boxShadow: filter === key ? '0 2px 8px rgba(0,0,0,0.2)' : 'var(--shadow-sm)',
                transition: '0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1, 2, 3].map(n => (
              <div key={n} className="skeleton" style={{ height: 76, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {filter === 'active' ? '✅' : '📋'}
            </div>
            <p style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>
              {filter === 'active' ? 'All caught up!' : 'No orders yet'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginTop: 4 }}>
              {filter === 'active' ? 'No active orders right now' : 'Orders will appear here'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={handleAdvance}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}

        {lastRefresh && (
          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
