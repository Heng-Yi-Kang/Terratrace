'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLocations, createReview } from './queries';
import type { LocationOption } from './queries';

// ─── Inline icons ─────────────────────────────────────────────────────────────

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width={24} height={24} aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20} aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width={12} height={12} aria-hidden="true">
      <path d="M3.75 9.776c.112-.017.227-.026.344-.026h15.156l-4.53-4.531a.75.75 0 01.53-1.281h.002a.75.75 0 01.528.22l5.5 5.5a.75.75 0 010 1.062l-5.5 5.5a.75.75 0 01-1.06-1.06l4.53-4.531H4.094c-.112 0-.227-.009-.344-.026a4.25 4.25 0 110-8.5 4.25 4.25 0 01.344 8.474z" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRACTICES = [
  'Solar Energy',
  'Local Hiring',
  'Reforestation',
  'Zero Waste',
  'Local Food',
  'Sustainable Materials',
  'Water Conservation',
  'Leave No Trace',
  'Community Investment',
  'Fair Wages',
  'Hyper-Local Food',
  'Locally-Owned',
  'Cultural Heritage',
  'Plastic-Free',
  'Carbon Neutral',
];

// ─── Shared style objects ─────────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1.5px solid #D1FAE5',
  fontSize: 14,
  color: '#064E3B',
  fontFamily: '"Open Sans", sans-serif',
  background: '#F0FDF9',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#064E3B',
  marginBottom: 6,
  fontFamily: '"Open Sans", sans-serif',
};

const counterStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(6,78,59,0.45)',
  textAlign: 'right',
  marginTop: 3,
  fontFamily: '"Open Sans", sans-serif',
};

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  userId: string | null;
  onClose: () => void;
  onSubmitted: () => void;
};

export default function WriteReviewModal({ open, userId, onClose, onSubmitted }: Props) {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [locationId, setLocationId] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setLocationId('');
    setRating(0);
    setHoverRating(0);
    setTitle('');
    setBody('');
    setSelectedPractices([]);
    setError(null);
    setSubmitting(false);
    onClose();
  }, [onClose]);

  // Fetch locations once when modal first opens
  useEffect(() => {
    if (!open) return;
    fetchLocations().then(setLocations);
  }, [open]);

  // Escape key to dismiss
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  function togglePractice(p: string) {
    setSelectedPractices((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setError('You must be signed in to post a review.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await createReview({
      locationId,
      userId,
      rating,
      title,
      body,
      practices: selectedPractices,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong. Please try again.');
      return;
    }
    handleClose();
    onSubmitted();
  }

  if (!open) return null;

  const displayRating = hoverRating || rating;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) handleClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(6,78,59,0.55)',
        backdropFilter: 'blur(4px)',
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-title"
        style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(6,78,59,0.18)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px 32px 28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2
              id="write-review-title"
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: '#064E3B',
                fontFamily: 'Poppins, sans-serif',
                lineHeight: 1.3,
              }}
            >
              Share Your Eco-Experience
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(6,78,59,0.6)', fontFamily: '"Open Sans", sans-serif' }}>
              Help the community discover genuinely sustainable places.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            style={{
              flexShrink: 0,
              marginLeft: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(6,78,59,0.45)',
              padding: 4,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 150ms',
            }}
          >
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Location */}
          <div>
            <label htmlFor="wr-location" style={labelStyle}>Location</label>
            <select
              id="wr-location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              style={{ ...fieldStyle, cursor: 'pointer' }}
              required
            >
              <option value="">Select a location…</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} · {loc.city}, {loc.country}
                </option>
              ))}
            </select>
          </div>

          {/* Star rating */}
          <div>
            <label style={labelStyle}>Rating</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px 3px',
                    cursor: 'pointer',
                    display: 'flex',
                    color: i <= displayRating ? '#F59E0B' : '#D1FAE5',
                    transition: 'color 100ms',
                  }}
                >
                  <StarIcon />
                </button>
              ))}
              {rating > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#064E3B',
                    fontFamily: '"Open Sans", sans-serif',
                  }}
                >
                  {rating}.0 / 5
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="wr-title" style={labelStyle}>Title</label>
            <input
              id="wr-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g. Genuinely sustainable, not just greenwashed"
              style={fieldStyle}
              required
            />
            <div style={counterStyle}>{title.length}/100</div>
          </div>

          {/* Body */}
          <div>
            <label htmlFor="wr-body" style={labelStyle}>Your review</label>
            <textarea
              id="wr-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Describe the eco practices you observed…"
              style={{ ...fieldStyle, resize: 'vertical', minHeight: 120, lineHeight: 1.6 }}
              required
            />
            <div style={counterStyle}>{body.length}/1000</div>
          </div>

          {/* Practice chips */}
          <div>
            <label style={labelStyle}>
              Eco practices observed{' '}
              <span style={{ fontWeight: 400, color: 'rgba(6,78,59,0.5)' }}>(optional)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRACTICES.map((p) => {
                const active = selectedPractices.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePractice(p)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 12px',
                      borderRadius: 999,
                      border: `1.5px solid ${active ? '#059669' : '#D1FAE5'}`,
                      background: active ? '#059669' : '#fff',
                      color: active ? '#fff' : '#064E3B',
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: '"Open Sans", sans-serif',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    <span style={{ color: active ? '#bbf7d0' : '#059669', display: 'flex' }}>
                      <LeafIcon />
                    </span>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                color: '#9F1239',
                fontSize: 13,
                fontFamily: '"Open Sans", sans-serif',
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: '1.5px solid #D1FAE5',
                background: '#fff',
                color: '#064E3B',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: '"Open Sans", sans-serif',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 150ms',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: submitting ? '#D1FAE5' : '#FBBF24',
                color: '#064E3B',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: '"Open Sans", sans-serif',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 150ms',
                boxShadow: submitting ? 'none' : '0 2px 8px rgba(251,191,36,0.35)',
              }}
            >
              {submitting ? 'Submitting…' : 'Post review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
