import { ReactNode, useEffect, useState, useRef } from 'react'

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  color?: 'primary' | 'secondary' | 'cta' | 'cyan'
}

function useCountUp(end: number, elementRef: React.RefObject<HTMLDivElement>, duration: number = 1500, start: number = 0, decimals: number = 0) {
  const [count, setCount] = useState(start)
  const [isAnimating, setIsAnimating] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (typeof end !== 'number') {
      setCount(end)
      return
    }

    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          setIsAnimating(true)
          hasAnimated.current = true
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [end])

  useEffect(() => {
    if (!isAnimating) return

    const startTime = performance.now()
    const diff = end - start

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(start + diff * easeOut)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isAnimating, end, start, duration])

  if (typeof end === 'number') {
    return decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()
  }
  return end
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary'
}: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const numericValue = typeof value === 'number' ? value : parseFloat(value)
  const hasDecimals = typeof value === 'string' && value.includes('.')
  const displayValue = useCountUp(numericValue, cardRef, 1500, 0, hasDecimals ? 1 : 0)

  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    cta: 'bg-cta/10 text-cta',
    cyan: 'bg-cyan-primary/10 text-cyan-primary',
  }

  return (
    <div ref={cardRef} className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic hover:shadow-organic-lg transition-shadow duration-200" data-stat-card>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-sm font-medium text-text/60">{title}</p>
          <p className="font-sans font-bold text-3xl text-text mt-2">{displayValue}</p>
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