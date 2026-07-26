'use client';
// P4 — Delivery tracking map (scaffold — real map requires Google Maps API key)
import { ArrowLeft, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import OrderStatusTimeline from '@/components/OrderStatusTimeline';

export default function LiveMapPage({ params }) {
  const router = useRouter();
  return (
    <>
      <div className="page-header">
        <button className="page-header-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="h3">Live Tracking</h1>
      </div>
      {/* Map placeholder — plug in Google Maps or Leaflet here */}
      <div style={{ height: 300, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
        <Navigation size={48} color="var(--pink)" />
        <p style={{ color: 'var(--white)', fontWeight: 700 }}>Live map — integrate Google Maps here</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--fs-sm)', textAlign: 'center', maxWidth: 240 }}>Add NEXT_PUBLIC_MAPS_API_KEY to .env to enable rider tracking</p>
      </div>
      <div style={{ padding: 'var(--space-5)' }}>
        <h3 className="h4" style={{ marginBottom: 'var(--space-4)' }}>Order Status</h3>
        <OrderStatusTimeline status="out_for_delivery" />
      </div>
    </>
  );
}
