'use client';

import { LeafIcon } from './Icons';

const stats = [
  { value: '48,213', label: 'Eco-reviews submitted' },
  { value: '2,847', label: 'Active challenges' },
  { value: '186K', label: 'Badges earned' },
  { value: '92%', label: 'Verified ratings' },
];

export default function PageHeader() {
  return (
    <header className="bg-background px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 border border-primary/20">
          <LeafIcon className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-primary">Community Impact</span>
        </div>

        {/* Headline */}
        <h1 className="mb-4 font-sans text-3xl font-bold text-text md:text-4xl lg:text-5xl">
          Build the Movement,<br />
          <span className="text-primary">One Trip at a Time.</span>
        </h1>

        {/* Description */}
        <p className="mb-10 max-w-xl text-base text-text/60 leading-relaxed">
          Rate places for their green practices, share what you witnessed, and earn badges as you hit low-carbon milestones together with travelers worldwide.
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:max-w-3xl">
          {stats.map(s => (
            <div key={s.label} className="rounded-organic bg-white/80 backdrop-blur-sm border border-text/10 px-5 py-4 shadow-organic">
              <div className="font-sans text-2xl font-bold text-text">{s.value}</div>
              <div className="mt-1 text-sm text-text/50">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}