'use client';
import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import StarRating from '@/components/StarRating';
import api from '@/services/api';

const EMOJIS = ['😞', '😕', '😐', '😊', '🤩'];
const LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Amazing!'];

export default function RatePage({ params }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const submit = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { orderId: params.id, rating, comment });
      setDone(true);
      toast.success('Thanks for your review! 🌟');
      setTimeout(() => router.push('/orders'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className="page-header">
        <button className="page-header-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="h3">Rate Your Order</h1>
      </div>

      <div className="page-content" style={{ textAlign: 'center' }}>
        {done ? (
          <div className="animate-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', paddingTop: 'var(--space-12)' }}>
            <CheckCircle size={80} color="var(--pink)" strokeWidth={1.5} />
            <h2 className="h2">Thank You! 🎉</h2>
            <p style={{ color: 'var(--text-muted)' }}>Your review helps us do better.</p>
          </div>
        ) : (
          <>
            <div style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
              <div style={{ fontSize: 80, marginBottom: 'var(--space-4)' }}>{rating ? EMOJIS[rating - 1] : '⭐'}</div>
              <h2 className="h2" style={{ marginBottom: 8 }}>How was your order?</h2>
              {rating > 0 && <p style={{ color: 'var(--pink)', fontWeight: 700, fontSize: 'var(--fs-lg)' }}>{LABELS[rating - 1]}</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
              <StarRating value={rating} onChange={setRating} size={48} />
            </div>

            <div className="input-wrap" style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
              <label className="input-label">Tell us more (optional)</label>
              <textarea className="input" rows={3} placeholder="What did you love? Any suggestions?" value={comment} onChange={(e) => setComment(e.target.value)} style={{ resize: 'none' }} />
            </div>

            <button className="btn btn-primary btn-lg" onClick={submit} disabled={!rating || submitting}>
              {submitting ? 'Submitting...' : 'Submit Review ✨'}
            </button>
          </>
        )}
      </div>
    </>
  );
}
