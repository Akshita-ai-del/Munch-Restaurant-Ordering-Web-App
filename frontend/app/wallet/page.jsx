'use client';
// P3 — Wallet page (full implementation)
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { walletApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    walletApi.get()
      .then(({ data }) => setWallet(data.wallet))
      .finally(() => setLoading(false));
  }, []);

  const topup = async (amount) => {
    try {
      const { data } = await walletApi.topup(amount);
      setWallet(data.wallet);
      toast.success(`$${amount} added to your wallet! 🎉`);
    } catch { toast.error('Top-up failed'); }
  };

  return (
    <>
      <div className="page-header">
        <button className="page-header-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="h3">My Wallet</h1>
      </div>

      <div className="page-content">
        {/* Balance card */}
        <div className="rainbow-banner" style={{ marginBottom: 'var(--space-5)' }}>
          <p style={{ opacity: 0.85, fontWeight: 600, marginBottom: 4 }}>Available Balance</p>
          <p style={{ fontSize: 52, fontWeight: 900 }}>${loading ? '—' : (wallet?.balance || 0).toFixed(2)}</p>
          <p style={{ opacity: 0.75, fontSize: 'var(--fs-sm)', marginTop: 6 }}>Munch Wallet · The Yard Milkshake Bar</p>
        </div>

        {/* Top-up options */}
        <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Top Up</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          {[10, 20, 25, 50, 75, 100].map((amt) => (
            <button key={amt} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 'var(--fs-lg)', transition: 'all 0.2s' }}
              onClick={() => topup(amt)}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{amt >= 50 ? '🎁' : '💳'}</div>
              ${amt}
            </button>
          ))}
        </div>

        {/* Transaction history */}
        <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Transactions</h3>
        {wallet?.transactions?.length === 0 && (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div style={{ fontSize: 40 }}>💳</div>
            <div className="empty-state-title">No transactions yet</div>
          </div>
        )}
        {wallet?.transactions?.map((tx) => (
          <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: tx.type === 'topup' ? '#00C85318' : 'var(--pink-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {tx.type === 'topup' ? '⬆️' : '🛒'}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{tx.description}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <span style={{ fontWeight: 800, color: tx.type === 'topup' ? '#00C853' : 'var(--pink)', fontSize: 'var(--fs-md)' }}>
              {tx.type === 'topup' ? '+' : '-'}${tx.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <BottomNav />
    </>
  );
}
