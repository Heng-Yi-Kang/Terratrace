'use client';

import { TrophyIcon } from './Icons';
import type { Leader } from './types';

interface LeaderboardProps {
  leaders: Leader[];
}

const PODIUM_COLORS = ['#F59E0B', '#94A3B8', '#D97706'];

export default function Leaderboard({ leaders }: LeaderboardProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-center gap-2.5">
        <TrophyIcon className="h-5 w-5 text-emerald-600" />
        <h3 className="font-display text-lg font-bold text-emerald-900">This Week&apos;s Leaderboard</h3>
      </div>

      <div className="flex flex-col gap-2">
        {leaders.map(l => {
          const isPodium = l.rank <= 3;
          return (
            <div
              key={l.id}
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 ${
                l.you ? 'border border-emerald-200/50 bg-emerald-50/50' : 'border border-transparent'
              }`}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-bold"
                style={{
                  background: isPodium ? PODIUM_COLORS[l.rank - 1] : 'rgba(5,150,105,0.1)',
                  color: isPodium ? 'white' : '#064E3B',
                }}
              >
                {l.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div className={`font-display text-sm font-semibold ${l.you ? 'text-emerald-600' : 'text-emerald-900'}`}>
                  {l.name}{l.you && ' (you)'}
                </div>
                <div className="text-xs text-emerald-900/50">{l.badges} badges</div>
              </div>
              <div className="font-display text-sm font-bold text-emerald-900">{l.points.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full rounded-lg border border-emerald-200 bg-transparent py-2.5 font-semibold text-sm text-emerald-600 transition-all duration-200 cursor-pointer hover:bg-emerald-50">
        View Full Leaderboard
      </button>
    </div>
  );
}
