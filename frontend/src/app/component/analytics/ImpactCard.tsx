import React, { useEffect, useState, useRef } from 'react';

interface ImpactCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

function useCountUp(end: number, elementRef: React.RefObject<HTMLDivElement | null>, duration: number = 1500, start: number = 0, decimals: number = 0) {
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

export default function ImpactCard({ title, value, unit, icon, trend }: ImpactCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const numericValue = typeof value === 'number' ? value : parseFloat(value)
  const hasDecimals = typeof value === 'string' && value.includes('.')
  const displayValue = useCountUp(numericValue, cardRef, 1500, 0, hasDecimals ? 1 : 0)

  return (
    <div ref={cardRef} className="bg-white/80 backdrop-blur-sm p-6 rounded-organic border border-white/20 shadow-organic hover:shadow-organic-lg transition-shadow duration-300 group">
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
        <h3 className="text-3xl font-heading font-bold text-primary">{displayValue}</h3>
        <span className="text-sm text-text/60">{unit}</span>
      </div>
    </div>
  );
}