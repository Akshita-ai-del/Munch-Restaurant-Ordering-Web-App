'use client';

export default function CategoryFilter({ categories, active, onChange }) {
  const ALL = { id: 'all', name: 'All', emoji: '✨', slug: 'all' };
  const items = [ALL, ...categories];

  return (
    <div className="h-scroll" style={{ padding: '0 0 4px' }}>
      {items.map((cat) => (
        <button
          key={cat.id}
          className={`chip ${active === cat.slug ? 'chip-active' : 'chip-default'}`}
          onClick={() => onChange(cat.slug)}
          style={{ flexShrink: 0, fontSize: 'var(--fs-sm)', padding: '8px 16px' }}
        >
          {cat.emoji && <span>{cat.emoji}</span>}
          {cat.name}
        </button>
      ))}
    </div>
  );
}
