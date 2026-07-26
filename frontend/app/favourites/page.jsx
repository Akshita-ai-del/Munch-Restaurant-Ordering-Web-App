'use client';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { userApi } from '@/services/api';
import MenuCard from '@/components/MenuCard';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getFavourites()
      .then(({ data }) => setFavourites(data.favourites))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="h3">Favourites</h1>
        <Heart size={22} color="var(--pink)" fill="var(--pink)" />
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1,2,3].map((n) => <div key={n} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : favourites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">❤️</div>
            <div className="empty-state-title">No favourites yet</div>
            <div className="empty-state-desc">Tap the heart on any item to save it here</div>
            <Link href="/menu" className="btn btn-primary" style={{ marginTop: 8 }}>Browse Menu 🍦</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {favourites.map((fav) => (
              <MenuCard key={fav.id} item={fav.menuItem} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
