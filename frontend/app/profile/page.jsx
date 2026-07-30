'use client';
import { useState, useEffect } from 'react';
import { LogOut, User, MapPin, ShoppingBag, Wallet, Settings, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userApi, walletApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [tab, setTab] = useState('profile');
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    userApi.getAddresses().then(({ data }) => setAddresses(data.addresses)).catch(() => {});
    walletApi.get().then(({ data }) => setWallet(data.wallet)).catch(() => {});
  }, [user, router]);

  if (!user) return null;

  return (
    <>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--black), var(--charcoal))', padding: 'var(--space-6) var(--space-5) var(--space-10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'var(--white)', flexShrink: 0 }}>
            {user.name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--white)', fontWeight: 800, fontSize: 'var(--fs-xl)' }}>{user.name}</p>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'var(--fs-sm)' }}>{user.email}</p>
            {wallet && (
              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--pink)', color: 'var(--white)', borderRadius: 'var(--radius-full)', padding: '3px 10px', fontSize: 'var(--fs-xs)', fontWeight: 700 }}>
                👛 ${wallet.balance.toFixed(2)} balance
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50, marginTop: -24, borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }}>
        {[['profile','Profile'],['addresses','Addresses'],['wallet','Wallet']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: 'var(--space-4)',
            fontWeight: 700, fontSize: 'var(--fs-sm)',
            borderBottom: `3px solid ${tab === key ? 'var(--pink)' : 'transparent'}`,
            color: tab === key ? 'var(--pink)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      <div className="page-content">
        {/* Profile tab */}
        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Link href="/orders" className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--pink-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} color="var(--pink)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>My Orders</p>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>View past orders</p>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </Link>

            <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }} onClick={() => setTab('wallet')}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--pink-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={20} color="var(--pink)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>Munch Wallet</p>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>Balance: ${wallet?.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>

            <button onClick={logout} className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', textAlign: 'left' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={20} color="#F44336" />
              </div>
              <p style={{ fontWeight: 700, color: '#F44336' }}>Sign Out</p>
            </button>
          </div>
        )}

        {/* Addresses tab */}
        {tab === 'addresses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {addresses.map((addr) => (
              <div key={addr.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--pink-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} color="var(--pink)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700 }}>{addr.label} {addr.isDefault && <span className="tag-popular" style={{ fontSize: 9 }}>Default</span>}</p>
                  <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}</p>
                </div>
                <button onClick={() => userApi.deleteAddress(addr.id).then(() => setAddresses((a) => a.filter((x) => x.id !== addr.id)))}>
                  <Trash2 size={15} color="var(--text-muted)" />
                </button>
              </div>
            ))}
            {addresses.length === 0 && (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">📍</div>
                <div className="empty-state-title">No addresses saved</div>
              </div>
            )}
            <button className="btn btn-outline btn-lg">
              <Plus size={18} /> Add Address
            </button>
          </div>
        )}

        {/* Wallet tab */}
        {tab === 'wallet' && (
          <div>
            <div className="rainbow-banner" style={{ marginBottom: 'var(--space-5)' }}>
              <p style={{ fontSize: 'var(--fs-sm)', opacity: 0.85, marginBottom: 4 }}>Wallet Balance</p>
              <p style={{ fontSize: 48, fontWeight: 900 }}>${wallet?.balance?.toFixed(2) || '0.00'}</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
              {[10, 20, 50].map((amt) => (
                <button key={amt} className="btn btn-outline" style={{ flex: 1 }}
                  onClick={() => walletApi.topup(amt).then(({ data }) => { setWallet(data.wallet); toast.success(`$${amt} added! 🎉`); })}>
                  +${amt}
                </button>
              ))}
            </div>
            <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Transactions</h3>
            {wallet?.transactions?.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>No transactions yet</p>}
            {wallet?.transactions?.map((tx) => (
              <div key={tx.id} className="summary-row" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{tx.description}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ fontWeight: 800, color: tx.type === 'topup' ? '#00C853' : 'var(--pink)' }}>
                  {tx.type === 'topup' ? '+' : '-'}${tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
