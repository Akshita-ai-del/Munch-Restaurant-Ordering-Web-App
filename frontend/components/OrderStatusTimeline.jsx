'use client';
import { CheckCircle, Clock, ChefHat, Bike, Package } from 'lucide-react';

const STEPS = [
  { key: 'placed',           label: 'Order Placed',     icon: CheckCircle,  desc: 'We received your order!' },
  { key: 'confirmed',        label: 'Confirmed',         icon: Clock,        desc: 'Restaurant accepted your order' },
  { key: 'preparing',        label: 'Preparing',         icon: ChefHat,      desc: 'Our team is making your order' },
  { key: 'out_for_delivery', label: 'On the Way',        icon: Bike,         desc: 'Rider is heading to you' },
  { key: 'delivered',        label: 'Delivered',         icon: Package,      desc: 'Enjoy your order! 🎉' },
];

const STATUS_ORDER = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export default function OrderStatusTimeline({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="timeline">
      {STEPS.map((step, idx) => {
        const isDone   = idx < currentIdx;
        const isActive = idx === currentIdx;
        const Icon     = step.icon;
        return (
          <div key={step.key} className={`timeline-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
            <div className="timeline-dot">
              <Icon size={18} strokeWidth={2.5} />
            </div>
            <div className="timeline-content">
              <div className="timeline-title" style={{ color: isDone || isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {step.label}
              </div>
              {(isDone || isActive) && (
                <div className="timeline-time">{step.desc}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
