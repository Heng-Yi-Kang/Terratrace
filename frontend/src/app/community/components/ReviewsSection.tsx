'use client';

import { useCallback, useEffect, useState } from 'react';
import { FilterIcon, PencilIcon } from './Icons';
import type { Review } from './types';
import ReviewCard from './ReviewCard';
import { fetchReviews } from '../queries';
import { createClient } from '@/utils/supabase/client';
import WriteReviewModal from '../write-review-modal';

const FILTERS = ['All', 'Eco-Lodge', 'Boutique Hotel', 'Tour Operator', 'Restaurant'];

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const loadReviews = useCallback(() => {
    setLoading(true);
    fetchReviews()
      .then(setReviews)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    void (async () => {
      const result = await supabase.auth.getUser();
      setUserId(result.data.user?.id ?? null);
    })();
  }, []);

  const filtered = filter === 'All' ? reviews : reviews.filter(r => r.category === filter);

  if (loading) {
    return (
      <div
        className="py-16 text-center font-medium"
        style={{ color: '#064E3B', opacity: 0.5 }}
      >
        Loading reviews…
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar + CTA */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterIcon className="h-4 w-4 text-emerald-900/50" />
          <span className="mr-1 text-sm text-emerald-900/60">Filter:</span>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                filter === f
                  ? 'bg-emerald-600 text-white border border-emerald-600'
                  : 'bg-white text-emerald-900 border border-emerald-200/50 hover:border-emerald-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          disabled={!userId}
          title={userId ? 'Write a review' : 'Sign in to write a review'}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-sm shadow-md transition-all duration-200 hover:bg-amber-500 hover:shadow-lg"
          style={{
            color: '#064E3B',
            ...(!userId
              ? { opacity: 0.55, cursor: 'not-allowed' }
              : { cursor: 'pointer' }),
          }}
        >
          <PencilIcon className="h-4 w-4" />
          Write a Review
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
        {filtered.map(r => <ReviewCard key={r.id} review={r} />)}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-emerald-900/50 font-medium">
          No reviews in this category yet. Be the first to write one!
        </div>
      )}

      <WriteReviewModal
        open={modalOpen}
        userId={userId}
        onClose={() => setModalOpen(false)}
        onSubmitted={loadReviews}
      />
    </div>
  );
}
