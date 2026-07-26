'use client';
import { useState, useEffect } from 'react';
import { Search, Bell, MapPin, ChevronRight, Flame, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { menuApi } from '@/services/api';
import MenuCard from '@/components/MenuCard';
import CategoryFilter from '@/components/CategoryFilter';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    menuApi.getCategories().then(({ data }) => setCategories(data.categories));
    menuApi.getAll({ featured: true }).then(({ data }) => setFeatured(data.items.slice(0, 5)));
    menuApi.getAll({ popular: true }).then(({ data }) => setPopular(data.items.slice(0, 6)));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await menuApi.getAll({ search });
      setSearchResults(data.items);
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Show spinner while auth state is being determined
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  // Redirect to login if not authenticated — do this BEFORE rendering any content
  if (!user) { router.replace('/login'); return <div className="page-loading"><div className="spinner" /></div>; }

  return (
    <>
      {/* Header */}
      <header style={{ padding: 'var(--space-5) var(--space-4) var(--space-3)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
          <div>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>Delivery to</p>
            <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 'var(--fs-md)' }}>
              <MapPin size={16} color="var(--pink)" />
              {user?.name?.split(' ')[0]}'s Location
              <ChevronRight size={14} color="var(--text-muted)" />
            </button>
          </div>
          <button className="btn-icon" style={{ background: 'var(--grey-100)', position: 'relative' }}>
            <Bell size={20} />
            <span className="badge" style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, fontSize: 9 }}>2</span>
          </button>
        </div>

        {/* Search */}
        <div className="search-bar">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search milkshakes, sundaes, dough..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searching && <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
        </div>
      </header>

      <div className="page-content">
        {/* Search results overlay */}
        {search && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <p className="label" style={{ marginBottom: 'var(--space-3)' }}>{searchResults.length} results for "{search}"</p>
            {searchResults.length === 0 && !searching && (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-title">Nothing found</div>
                <div className="empty-state-desc">Try "pink lemonade" or "cookie dough"</div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {searchResults.map((item) => <MenuCard key={item.id} item={item} />)}
            </div>
          </div>
        )}

        {!search && (
          <>
            {/* Hero banner */}
            <div className="section">
              <div className="featured-banner" style={{ marginBottom: 0 }}>
                <img src="https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800&q=80" alt="Featured milkshake" />
                <div className="featured-banner-content">
                  <span className="tag-popular" style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-2)' }}>✨ July Special</span>
                  <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 900, marginBottom: 4 }}>Firework Shake</h2>
                  <p style={{ fontSize: 'var(--fs-sm)', opacity: 0.85, marginBottom: 'var(--space-3)' }}>Red, white & blue. Limited time! 🎆</p>
                  <Link href="/menu/july-fourth-firework-shake" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                    Order Now →
                  </Link>
                </div>
              </div>
            </div>

            {/* Promo strip */}
            <div style={{ background: 'var(--black)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'var(--pink)', fontWeight: 700, fontSize: 'var(--fs-sm)' }}>🎉 First order offer</p>
                <p style={{ color: 'var(--white)', fontWeight: 800, fontSize: 'var(--fs-lg)' }}>10% off with MUNCH10</p>
              </div>
              <Link href="/menu" className="btn btn-primary btn-sm">Grab it →</Link>
            </div>

            {/* Categories */}
            <div className="section">
              <div className="section-header">
                <h3 className="h4">Categories</h3>
                <Link href="/menu" style={{ fontSize: 'var(--fs-sm)', color: 'var(--pink)', fontWeight: 600 }}>See all</Link>
              </div>
              <div className="h-scroll">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/menu?category=${cat.slug}`}>
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)',
                      padding: '14px 18px', minWidth: 80, flexShrink: 0,
                      transition: 'background 0.2s',
                    }}>
                      <span style={{ fontSize: 28 }}>{cat.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'center', whiteSpace: 'nowrap' }}>{cat.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div className="section">
              <div className="section-header">
                <h3 className="h4"><Sparkles size={16} style={{ display: 'inline', color: 'var(--pink)' }} /> Featured</h3>
                <Link href="/menu?featured=true" style={{ fontSize: 'var(--fs-sm)', color: 'var(--pink)', fontWeight: 600 }}>See all</Link>
              </div>
              <div className="h-scroll">
                {featured.map((item) => (
                  <Link key={item.id} href={`/menu/${item.id}`} style={{ flexShrink: 0, width: 170 }}>
                    <div className="card card-hover" style={{ overflow: 'hidden' }}>
                      <div style={{ height: 130, background: '#f5e8e0', position: 'relative' }}>
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ padding: 'var(--space-3)' }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
                        <div style={{ color: 'var(--pink)', fontWeight: 800 }}>${item.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Now */}
            <div className="section">
              <div className="section-header">
                <h3 className="h4"><Flame size={16} style={{ display: 'inline', color: 'var(--pink)' }} /> Popular Now</h3>
                <Link href="/menu?popular=true" style={{ fontSize: 'var(--fs-sm)', color: 'var(--pink)', fontWeight: 600 }}>See all</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {popular.map((item) => <MenuCard key={item.id} item={item} />)}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </>
  );
}
