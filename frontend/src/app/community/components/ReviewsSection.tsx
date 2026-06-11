'use client';

import { useState } from 'react';
import { FilterIcon, PencilIcon } from './Icons';
import type { Review } from './types';
import ReviewCard from './ReviewCard';

interface ReviewsSectionProps {
  reviews: Review[];
}

const FILTERS = ['All', 'Accommodation', 'Dining', 'Transport'];

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All'
    ? reviews
    : reviews.filter(r => r.category.toLowerCase() === filter.toLowerCase());

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

        <button className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-sm text-white shadow-md transition-all duration-200 cursor-pointer hover:bg-amber-500 hover:shadow-lg">
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
    </div>
  );
}