'use client';

import { useState } from 'react';
import { StarIcon, MapPinIcon, LeafIcon, ThumbsUpIcon, CheckBadgeIcon } from './Icons';
import { tokens } from '../tokens';
import type { Review } from './types';

interface ReviewCardProps {
  review: Review;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= rating} className="h-4 w-4" />)}
    </div>
  );
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [hovered, setHovered] = useState(false);
  const [helpful, setHelpful] = useState(review.helpful);
  const [marked, setMarked] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`rounded-2xl border border-emerald-100 bg-white p-7 transition-all duration-200 ${
        hovered ? 'shadow-lg -translate-y-0.5' : 'shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-emerald-900">{review.location}</h3>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: `${review.color}1a`, color: review.color }}
            >
              {review.category.charAt(0).toUpperCase() + review.category.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-900/60">
            <MapPinIcon className="h-3 w-3" />
            <span className="text-sm">{review.city}, {review.country}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={review.rating} />
          <span className="font-display text-base font-semibold text-emerald-900">{review.rating}.0 / 5</span>
        </div>
      </div>

      {/* Title + body */}
      <h4 className="mb-2 font-display font-semibold text-emerald-900">{review.title}</h4>
      <p className="mb-5 text-sm text-emerald-900/70 leading-relaxed">{review.body}</p>

      {/* Practice tags */}
      <div className="mb-5 flex flex-wrap gap-2">
        {review.practices.map(p => (
          <span key={p} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
            <LeafIcon className="h-3 w-3" />
            {p}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-emerald-100 pt-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
            style={{
              background: `linear-gradient(135deg, ${review.color}33, ${review.color}66)`,
              color: review.color,
            }}
          >
            {review.reviewerInitials}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display text-sm font-semibold text-emerald-900">{review.reviewer}</span>
              {review.verified && (
                <span className="text-emerald-600" title="Verified traveler">
                  <CheckBadgeIcon className="h-4 w-4" />
                </span>
              )}
            </div>
            <span className="text-xs text-emerald-900/50">{review.date}</span>
          </div>
        </div>

        <button
          onClick={() => { setMarked(!marked); setHelpful(h => marked ? h - 1 : h + 1); }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
            marked
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'border border-emerald-200/50 text-emerald-900/70 hover:border-emerald-300'
          }`}
        >
          <ThumbsUpIcon className="h-3 w-3" />
          {helpful}
        </button>
      </div>
    </article>
  );
}