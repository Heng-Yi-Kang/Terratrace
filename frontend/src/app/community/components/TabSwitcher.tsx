'use client';

import { StarIcon, TrophyIcon } from './Icons';
import { tokens } from '../tokens';
import type { Tab } from './types';

interface TabSwitcherProps {
  active: Tab;
  onChange: (t: Tab) => void;
}

export default function TabSwitcher({ active, onChange }: TabSwitcherProps) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'reviews', label: 'Eco-Reviews', icon: <StarIcon className="h-4 w-4" /> },
    { id: 'challenges', label: 'Challenges', icon: <TrophyIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="mb-8 inline-flex gap-1 rounded-xl bg-white p-1.5 shadow-md border border-emerald-100">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-sm transition-all duration-200 cursor-pointer ${
            active === t.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-900 hover:text-emerald-600'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}