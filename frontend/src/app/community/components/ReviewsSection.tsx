'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { FilterIcon, PencilIcon } from './Icons';
import type { Review } from './types';
import ReviewCard from './ReviewCard';
import { useCreateCommunityReview } from '@/hooks/useCommunity';

interface ReviewsSectionProps {
  reviews: Review[];
  filter: string;
  onFilterChange: (filter: string) => void;
  isSignedIn: boolean;
}

const DEFAULT_FILTERS = ['All', 'Eco-Lodge', 'Boutique Hotel', 'Tour Operator', 'Restaurant'];

export default function ReviewsSection({ reviews, filter, onFilterChange, isSignedIn }: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    location: '',
    city: '',
    country: '',
    category: 'Eco-Lodge',
    rating: 5,
    title: '',
    body: '',
    practices: '',
  });
  const createReview = useCreateCommunityReview();
  const filters = Array.from(new Set([...DEFAULT_FILTERS, ...reviews.map(r => r.category)]));

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    await createReview.mutateAsync({
      location: form.location,
      city: form.city,
      country: form.country,
      category: form.category,
      rating: form.rating,
      title: form.title,
      body: form.body,
      practices: form.practices.split(',').map(p => p.trim()).filter(Boolean),
    });
    setForm({
      location: '',
      city: '',
      country: '',
      category: 'Eco-Lodge',
      rating: 5,
      title: '',
      body: '',
      practices: '',
    });
    setShowForm(false);
    onFilterChange('All');
  };

  return (
    <div>
      {/* Filter bar + CTA */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterIcon className="h-4 w-4 text-emerald-900/50" />
          <span className="mr-1 text-sm text-emerald-900/60">Filter:</span>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
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
          onClick={() => setShowForm(open => !open)}
          disabled={!isSignedIn}
          title={isSignedIn ? 'Write a Review' : 'Log in to write a review'}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-sm text-white shadow-md transition-all duration-200 cursor-pointer hover:bg-amber-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PencilIcon className="h-4 w-4" />
          Write a Review
        </button>
      </div>

      {!isSignedIn && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Log in to write reviews, edit your posts, and mark helpful feedback.
        </div>
      )}

      {showForm && (
        <form onSubmit={submitReview} className="mb-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold text-emerald-900">
              Location
              <input
                value={form.location}
                onChange={event => setForm(current => ({ ...current, location: event.target.value }))}
                required
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-semibold text-emerald-900">
              Category
              <select
                value={form.category}
                onChange={event => setForm(current => ({ ...current, category: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
              >
                {DEFAULT_FILTERS.filter(item => item !== 'All').map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-emerald-900">
              City
              <input
                value={form.city}
                onChange={event => setForm(current => ({ ...current, city: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-semibold text-emerald-900">
              Country
              <input
                value={form.country}
                onChange={event => setForm(current => ({ ...current, country: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
              />
            </label>
            <label className="text-sm font-semibold text-emerald-900">
              Rating
              <select
                value={form.rating}
                onChange={event => setForm(current => ({ ...current, rating: Number(event.target.value) }))}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
              >
                {[5, 4, 3, 2, 1].map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-emerald-900">
              Practices
              <input
                value={form.practices}
                onChange={event => setForm(current => ({ ...current, practices: event.target.value }))}
                placeholder="Solar Energy, Local Hiring"
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
              />
            </label>
          </div>
          <label className="mb-3 block text-sm font-semibold text-emerald-900">
            Title
            <input
              value={form.title}
              onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
              required
              className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
            />
          </label>
          <label className="mb-4 block text-sm font-semibold text-emerald-900">
            Review
            <textarea
              value={form.body}
              onChange={event => setForm(current => ({ ...current, body: event.target.value }))}
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
            />
          </label>
          {createReview.isError && (
            <div className="mb-3 text-sm font-semibold text-red-600">{createReview.error.message}</div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReview.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {createReview.isPending ? 'Saving...' : 'Publish Review'}
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
        {reviews.map(r => <ReviewCard key={r.id} review={r} isSignedIn={isSignedIn} />)}
      </div>

      {/* Empty state */}
      {reviews.length === 0 && (
        <div className="py-16 text-center text-emerald-900/50 font-medium">
          No reviews in this category yet. Be the first to write one!
        </div>
      )}
    </div>
  );
}
