'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const NAV_ITEMS = [
  { href: '/',           label: 'Home',    icon: Home },
  { href: '/menu',       label: 'Menu',    icon: UtensilsCrossed },
  { href: '/cart',       label: 'Cart',    icon: ShoppingBag },
  { href: '/favourites', label: 'Saved',   icon: Heart },
  { href: '/profile',    label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        const isCart = href === '/cart';
        return (
          <Link key={href} href={href} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span style={{ position: 'relative' }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {isCart && count > 0 && <span className="badge cart-badge">{count}</span>}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
