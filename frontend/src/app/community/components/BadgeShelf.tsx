'use client';

import { BoltIcon, LeafIcon, MapPinIcon, FireIcon } from './Icons';
import type { EarnedBadge } from './types';

interface BadgeShelfProps {
  badges: EarnedBadge[];
  points: number;
}

export default function BadgeShelf({ badges, points }: BadgeShelfProps) {
  const earned = badges.filter(b => b.earned).length;
  const locked = badges.filter(b => !b.earned).length;

  return (
    <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-emerald-900 mb-0.5">Your Badge Collection</h3>
          <p className="text-sm text-emerald-900/60">{earned} earned · {locked} locked</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 border border-amber-200/50">
          <BoltIcon className="h-4 w-4 text-amber-500" />
          <span className="font-display text-sm font-bold text-emerald-900">{points.toLocaleString()} points</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {badges.map(b => (
          <div
            key={b.name}
            className={`rounded-xl border p-4 text-center transition-transform duration-200 ${
              b.earned
                ? 'cursor-default'
                : 'cursor-default opacity-40'
            }`}
            style={{
              background: b.earned ? `linear-gradient(135deg, ${b.color}11, ${b.color}06)` : 'rgba(5,150,105,0.04)',
              borderColor: b.earned ? `${b.color}33` : 'rgba(5,150,105,0.08)',
            }}
            title={b.earned ? `Earned ${b.date}` : 'Not yet earned'}
          >
            <div
              className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-white"
              style={{
                background: b.earned
                  ? `linear-gradient(135deg, ${b.color}, ${b.color}cc)`
                  : 'rgba(5,150,105,0.15)',
                boxShadow: b.earned ? `0 4px 12px ${b.color}55` : 'none',
                filter: b.earned ? 'none' : 'grayscale(0.5)',
              }}
            >
              {b.icon}
            </div>
            <div className="font-display text-xs font-semibold text-emerald-900">{b.name}</div>
            {b.earned && (
              <div className="mt-0.5 text-xs text-emerald-900/50">{b.date}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}