import './globals.css';

export const metadata = {
  title: 'Munch — The Yard Milkshake Bar',
  description: 'Order over-the-top milkshakes, sundaes, edible cookie dough & craft coffee from The Yard Milkshake Bar. Fast delivery, real-time tracking.',
  manifest: '/manifest.json',
  themeColor: '#FF1F8E',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Munch',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF1F8E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Munch" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <Providers>
          <div className="page-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

// Inline providers wrapper (client component)
import Providers from '@/components/Providers';
