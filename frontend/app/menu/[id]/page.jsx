'use client';
import { useState, useEffect, use } from 'react';
import { ArrowLeft, Heart, Plus, Minus, Star, Clock, Flame } from 'lucide-react';
import { menuApi, userApi } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import StarRating from '@/components/StarRating';

export default function ItemDetailPage({ params }) {
  // Next.js 15+: params is a Promise — must be unwrapped with React.use()
  const { id } = use(params);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [note, setNote] = useState('');
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    menuApi.getById(id)
      .then(({ data }) => { setItem(data.item); setLoading(false); })
      .catch((err) => {
        const msg = err.response?.data?.error || 'Item not found';
        toast.error(msg);
        router.push('/menu');
      });
  }, [id]);

  const handleAddonSelect = (addonId, optionLabel, optionPrice) => {
    setSelectedAddons((prev) => ({ ...prev, [addonId]: { label: optionLabel, price: optionPrice } }));
  };

  const addonTotal = Object.values(selectedAddons).reduce((s, a) => s + (a.price || 0), 0);
  const total = ((item?.price || 0) + addonTotal) * qty;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem(item.id, qty, Object.keys(selectedAddons).length ? selectedAddons : null, note);
      toast.success(`${item.name} added to cart! 🎉`);
      router.back();
    } catch { toast.error('Please log in to add items'); }
    finally { setAdding(false); }
  };

  const handleLike = async () => {
    setLiked(!liked);
    try {
      if (!liked) await userApi.addFavourite(item.id);
      else await userApi.removeFavourite(item.id);
    } catch { setLiked(liked); }
  };

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: 300 }} />
      <div style={{ padding: 'var(--space-5)' }}>
        <div className="skeleton" style={{ height: 28, marginBottom: 8, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 16, width: '70%', borderRadius: 8 }} />
      </div>
    </div>
  );

  const parsedAddons = item.addons?.map((a) => ({ ...a, options: JSON.parse(a.options) })) || [];

  return (
    <>
      {/* Image hero */}
      <div style={{ position: 'relative', height: 300, background: '#f5e8e0' }}>
        {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 40%)' }} />
        <button className="page-header-back" style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)' }} onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <button className="btn-icon" style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }} onClick={handleLike}>
          <Heart size={20} fill={liked ? '#FF1F8E' : 'none'} color={liked ? '#FF1F8E' : '#333'} />
        </button>
        {item.isPopular && <span className="tag-popular" style={{ position: 'absolute', bottom: 16, left: 16 }}>🔥 Popular</span>}
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-5)', paddingBottom: 120 }}>
        {/* Title + meta */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h1 className="h2" style={{ marginBottom: 8 }}>{item.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>{item.description}</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {item.prepTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <Clock size={14} /> {item.prepTime} min
              </span>
            )}
            {item.calories && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <Flame size={14} /> {item.calories} cal
              </span>
            )}
            {item.reviews?.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <Star size={14} fill="#FFB300" color="#FFB300" />
                {(item.reviews.reduce((s, r) => s + r.rating, 0) / item.reviews.length).toFixed(1)} ({item.reviews.length})
              </span>
            )}
          </div>
        </div>

        {/* Addons */}
        {parsedAddons.map((addon) => (
          <div key={addon.id} style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <h3 className="h4">{addon.name}</h3>
              {addon.required && <span className="chip chip-active" style={{ fontSize: 10, padding: '2px 8px' }}>Required</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {addon.options.map((opt) => {
                const isSelected = selectedAddons[addon.id]?.label === opt.label;
                return (
                  <div key={opt.label} onClick={() => handleAddonSelect(addon.id, opt.label, opt.price)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: 'var(--space-3) var(--space-4)',
                      border: `2px solid ${isSelected ? 'var(--pink)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--pink-surface)' : 'var(--surface)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--pink)' : 'var(--border)'}`, background: isSelected ? 'var(--pink)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--white)' }} />}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 'var(--fs-md)' }}>{opt.label}</span>
                    </div>
                    {opt.price > 0 && <span style={{ color: 'var(--pink)', fontWeight: 700 }}>+${opt.price.toFixed(2)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Special note */}
        <div className="input-wrap" style={{ marginBottom: 'var(--space-5)' }}>
          <label className="input-label">Special Instructions (optional)</label>
          <textarea className="input" rows={2} placeholder="No ice, extra sprinkles..." value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: 'none' }} />
        </div>

        {/* Reviews */}
        {item.reviews?.length > 0 && (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h3 className="h4" style={{ marginBottom: 'var(--space-3)' }}>Reviews</h3>
            {item.reviews.slice(0, 3).map((r, i) => (
              <div key={i} style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{r.user?.name || 'Customer'}</span>
                  <StarRating value={r.rating} readOnly size={14} />
                </div>
                {r.comment && <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 'var(--max-w)',
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
      }}>
        <div className="qty-control">
          <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
          <span className="qty-num">{qty}</span>
          <button className="qty-btn" onClick={() => setQty(qty + 1)}><Plus size={14} /></button>
        </div>
        <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'space-between' }} onClick={handleAddToCart} disabled={adding}>
          <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
          <span>${total.toFixed(2)}</span>
        </button>
      </div>
    </>
  );
}
