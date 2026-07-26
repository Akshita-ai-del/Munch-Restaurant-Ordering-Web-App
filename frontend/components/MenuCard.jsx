'use client';
import Image from 'next/image';
import { Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { userApi } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function MenuCard({ item, layout = 'list' }) {
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const toast = useToast();
  const router = useRouter();

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (item.addons?.length > 0) { router.push(`/menu/${item.id}`); return; }
    setAdding(true);
    try {
      await addItem(item.id, 1);
      toast.success(`${item.name} added to cart! 🎉`);
    } catch { toast.error('Please log in to add items'); }
    finally { setAdding(false); }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    setLiked(!liked);
    try {
      if (!liked) await userApi.addFavourite(item.id);
      else await userApi.removeFavourite(item.id);
    } catch { setLiked(liked); }
  };

  if (layout === 'grid') {
    return (
      <div className="menu-card card-hover" onClick={() => router.push(`/menu/${item.id}`)} style={{ flexDirection: 'column', cursor: 'pointer' }}>
        <div style={{ position: 'relative', height: 140, background: '#f5e8e0' }}>
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <button className="btn-icon" style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }} onClick={handleLike}>
            <Heart size={16} fill={liked ? '#FF1F8E' : 'none'} color={liked ? '#FF1F8E' : '#888'} />
          </button>
          {item.isPopular && <span className="tag-popular" style={{ position: 'absolute', top: 8, left: 8 }}>🔥 Popular</span>}
        </div>
        <div className="menu-card-body" style={{ paddingLeft: 'var(--space-3)' }}>
          <div className="menu-card-name" style={{ fontSize: 'var(--fs-sm)' }}>{item.name}</div>
          <div className="menu-card-footer">
            <span className="menu-card-price">${item.price.toFixed(2)}</span>
            <button className="menu-card-add" onClick={handleAdd} disabled={adding}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-card card-hover" onClick={() => router.push(`/menu/${item.id}`)} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative', width: 110, flexShrink: 0 }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="menu-card-img" />
        ) : (
          <div className="menu-card-img skeleton" />
        )}
        {item.isPopular && (
          <span className="tag-popular" style={{ position: 'absolute', bottom: 6, left: 6, fontSize: 9 }}>🔥</span>
        )}
      </div>
      <div className="menu-card-body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div className="menu-card-name">{item.name}</div>
          <button className="btn-icon" style={{ flexShrink: 0, width: 32, height: 32 }} onClick={handleLike}>
            <Heart size={15} fill={liked ? '#FF1F8E' : 'none'} color={liked ? '#FF1F8E' : '#888'} />
          </button>
        </div>
        <div className="menu-card-desc">{item.description}</div>
        {item.prepTime && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>⏱ {item.prepTime} min</span>
        )}
        <div className="menu-card-footer">
          <span className="menu-card-price">${item.price.toFixed(2)}</span>
          <button className="menu-card-add" onClick={handleAdd} disabled={adding}>
            {adding ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
