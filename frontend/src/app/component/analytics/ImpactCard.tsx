import React from 'react';

interface ImpactCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

export default function ImpactCard({ title, value, unit, icon, trend }: ImpactCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-organic border border-white/20 shadow-organic hover:shadow-organic-lg transition-shadow duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">{icon}</div>
        {trend && (
          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
            trend.isPositive 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-sm text-text/70 font-medium mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-heading font-bold text-primary">{value}</h3>
        <span className="text-sm text-text/60">{unit}</span>
      </div>
    </div>
  );
}