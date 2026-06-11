'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { StarIcon, MapPinIcon, LeafIcon, ThumbsUpIcon, CheckBadgeIcon, PencilIcon } from './Icons';
import type { Review } from './types';
import { useToggleReviewHelpful, useUpdateCommunityReview } from '@/hooks/useCommunity';

interface ReviewCardProps {
  review: Review;
  isSignedIn: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= rating} className="h-4 w-4" />)}
    </div>
  );
}

export default function ReviewCard({ review, isSignedIn }: ReviewCardProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    rating: review.rating,
    title: review.title,
    body: review.body,
    practices: review.practices.join(', '),
  });
  const helpfulMutation = useToggleReviewHelpful();
  const updateReview = useUpdateCommunityReview();
  const location = [review.city, review.country].filter(Boolean).join(', ');
  const created = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(review.createdAt),
  );

  const submitEdit = async (event: FormEvent) => {
    event.preventDefault();
    await updateReview.mutateAsync({
      id: review.id,
      input: {
        rating: editForm.rating,
        title: editForm.title,
        body: editForm.body,
        practices: editForm.practices.split(',').map(p => p.trim()).filter(Boolean),
      },
    });
    setEditing(false);
  };

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
              {review.category}
            </span>
          </div>
          {location && (
            <div className="flex items-center gap-1.5 text-emerald-900/60">
              <MapPinIcon className="h-3 w-3" />
              <span className="text-sm">{location}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating rating={review.rating} />
          <span className="font-display text-base font-semibold text-emerald-900">{review.rating}.0 / 5</span>
        </div>
      </div>

      {editing ? (
        <form onSubmit={submitEdit} className="mb-5">
          <div className="mb-3 grid gap-3 sm:grid-cols-[120px_1fr]">
            <label className="text-sm font-semibold text-emerald-900">
              Rating
              <select
                value={editForm.rating}
                onChange={event => setEditForm(current => ({ ...current, rating: Number(event.target.value) }))}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
              >
                {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-emerald-900">
              Title
              <input
                value={editForm.title}
                onChange={event => setEditForm(current => ({ ...current, title: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
              />
            </label>
          </div>
          <label className="mb-3 block text-sm font-semibold text-emerald-900">
            Review
            <textarea
              value={editForm.body}
              onChange={event => setEditForm(current => ({ ...current, body: event.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
            />
          </label>
          <label className="mb-3 block text-sm font-semibold text-emerald-900">
            Practices
            <input
              value={editForm.practices}
              onChange={event => setEditForm(current => ({ ...current, practices: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
            />
          </label>
          {updateReview.isError && (
            <div className="mb-3 text-sm font-semibold text-red-600">{updateReview.error.message}</div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateReview.isPending}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {updateReview.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-2 flex items-start justify-between gap-3">
            <h4 className="font-display font-semibold text-emerald-900">{review.title}</h4>
            {review.viewerCanEdit && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <PencilIcon className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
          <p className="mb-5 text-sm text-emerald-900/70 leading-relaxed">{review.body}</p>
        </>
      )}

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
            <span className="text-xs text-emerald-900/50">{created}</span>
          </div>
        </div>

        <button
          onClick={() => helpfulMutation.mutate({ id: review.id, marked: review.viewerMarkedHelpful })}
          disabled={!isSignedIn || helpfulMutation.isPending}
          title={isSignedIn ? 'Mark as helpful' : 'Log in to mark helpful'}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
            review.viewerMarkedHelpful
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'border border-emerald-200/50 text-emerald-900/70 hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-60'
          }`}
        >
          <ThumbsUpIcon className="h-3 w-3" />
          {review.helpful}
        </button>
      </div>
    </article>
  );
}
