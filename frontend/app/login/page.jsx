'use client';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back! 🎉');
      } else {
        await register(form.name, form.email, form.password, form.phone);
        toast.success('Account created! Welcome to Munch 🍦');
      }
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(145deg, #FF1F8E 0%, #D4167A 60%, #0A0A0A 100%)',
        padding: 'var(--space-12) var(--space-6) var(--space-8)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ fontSize: 64, marginBottom: 'var(--space-3)' }}>🥤</div>
        <h1 style={{ fontSize: 'var(--fs-4xl)', fontWeight: 900, color: 'var(--white)', letterSpacing: '-0.02em' }}>Munch</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: 6, fontSize: 'var(--fs-md)' }}>
          The Yard Milkshake Bar
        </p>
      </div>

      {/* Form card */}
      <div style={{
        flex: 1, background: 'var(--surface)',
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        marginTop: -24,
        padding: 'var(--space-8) var(--space-6)',
      }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'var(--grey-100)', borderRadius: 'var(--radius-full)', padding: 4, marginBottom: 'var(--space-6)' }}>
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius-full)',
              fontWeight: 700, fontSize: 'var(--fs-sm)',
              background: mode === m ? 'var(--white)' : 'transparent',
              color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {mode === 'register' && (
            <>
              <div className="input-wrap">
                <label className="input-label">Full Name</label>
                <div className="input-icon-wrap">
                  <User size={18} className="input-icon" />
                  <input className="input" placeholder="Alex Johnson" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div className="input-wrap">
                <label className="input-label">Phone (optional)</label>
                <div className="input-icon-wrap">
                  <Phone size={18} className="input-icon" />
                  <input className="input" type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            </>
          )}

          <div className="input-wrap">
            <label className="input-label">Email</label>
            <div className="input-icon-wrap">
              <Mail size={18} className="input-icon" />
              <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="input-wrap">
            <label className="input-label">Password</label>
            <div className="input-icon-wrap" style={{ position: 'relative' }}>
              <Lock size={18} className="input-icon" />
              <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} /> : (mode === 'login' ? 'Sign In 🚀' : 'Create Account 🎉')}
          </button>
        </form>

        {/* Demo hint */}
        <div style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)', background: 'var(--pink-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--pink-light)' }}>
          <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--pink)', marginBottom: 4 }}>DEMO CREDENTIALS</p>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
            📧 customer@demo.com<br />
            🔐 password123
          </p>
          <button onClick={() => { setForm({ ...form, email: 'customer@demo.com', password: 'password123' }); setMode('login'); }}
            style={{ marginTop: 8, fontSize: 'var(--fs-xs)', color: 'var(--pink)', fontWeight: 700 }}>
            Auto-fill →
          </button>
        </div>
      </div>
    </div>
  );
}
