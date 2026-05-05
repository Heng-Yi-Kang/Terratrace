'use client';

import { LeafIcon } from './Icons';
import { tokens } from '../tokens';

const stats = [
  { value: '48,213', label: 'Eco-reviews submitted' },
  { value: '2,847', label: 'Active challenges' },
  { value: '186K', label: 'Badges earned' },
  { value: '92%', label: 'Verified ratings' },
];

export default function PageHeader() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-6 py-16 md:py-20">
      {/* Decorative radial gradients */}
      <div className="pointer-events-none absolute -top-24 -right-12 h-96 w-96 rounded-full bg-emerald-500/20" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-amber-400/15" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 backdrop-blur-sm border border-white/20">
          <LeafIcon className="h-4 w-4 text-white" />
          <span className="font-semibold text-sm text-white">Community Impact</span>
        </div>

        {/* Headline */}
        <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
          Build the Movement,<br />
          <span style={{ color: tokens.secondary }}>One Trip at a Time.</span>
        </h1>

        {/* Description */}
        <p className="mb-10 max-w-xl text-lg text-white/75 leading-relaxed">
          Rate places for their green practices, share what you witnessed, and earn badges as you hit low-carbon milestones together with travelers worldwide.
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:max-w-3xl">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-5 py-4">
              <div className="font-display text-2xl font-bold text-white">{s.value}</div>
              <div className="mt-1 text-sm text-white/60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}