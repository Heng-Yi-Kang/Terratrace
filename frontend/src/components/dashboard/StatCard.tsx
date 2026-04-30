import { ReactNode } from 'react'

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  color?: 'primary' | 'secondary' | 'cta' | 'cyan'
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary'
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    cta: 'bg-cta/10 text-cta',
    cyan: 'bg-cyan-primary/10 text-cyan-primary',
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic hover:shadow-organic-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-sm font-medium text-text/60">{title}</p>
          <p className="font-sans font-bold text-3xl text-text mt-2">{value}</p>
          {subtitle && (
            <p className="font-sans text-sm text-text/50 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}