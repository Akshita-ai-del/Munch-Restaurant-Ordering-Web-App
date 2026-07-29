'use client';
import { useState, useEffect, Suspense } from 'react';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { menuApi } from '@/services/api';
import MenuCard from '@/components/MenuCard';
import CategoryFilter from '@/components/CategoryFilter';
import BottomNav from '@/components/BottomNav';
import { useSearchParams } from 'next/navigation';

function MenuContent() {
  const params = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(params.get('category') || 'all');
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuApi.getCategories().then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = {};
    if (activeCategory !== 'all') query.category = activeCategory;
    if (search) query.search = search;
    if (params.get('featured') === 'true') query.featured = true;
    if (params.get('popular') === 'true') query.popular = true;
    menuApi.getAll(query)
      .then(({ data }) => setItems(data.items))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  return (
    <>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 50, padding: 'var(--space-4)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <h1 className="h3" style={{ flex: 1 }}>Menu</h1>
          <button className="btn-icon btn-ghost" onClick={() => setLayout(layout === 'list' ? 'grid' : 'list')}>
            {layout === 'list' ? <Grid size={20} /> : <List size={20} />}
          </button>
        </div>
        <div className="search-bar" style={{ marginBottom: 'var(--space-3)' }}>
          <Search size={18} color="var(--text-muted)" />
          <input placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1,2,3,4].map((n) => <div key={n} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍦</div>
            <div className="empty-state-title">Nothing found</div>
            <div className="empty-state-desc">Try a different filter or search term</div>
          </div>
        ) : layout === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {items.map((item) => <MenuCard key={item.id} item={item} layout="list" />)}
          </div>
        ) : (
          <div className="menu-card-grid">
            {items.map((item) => <MenuCard key={item.id} item={item} layout="grid" />)}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
export default function MenuPage() {
  return (
    <Suspense fallback={null}>
      <MenuContent />
    </Suspense>
  );
}
