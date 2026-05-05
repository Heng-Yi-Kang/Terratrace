'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useMemo, useState } from 'react'

type ForecastItem = {
  date: string
  temperature: number
  minTemperature: number
  maxTemperature: number
  humidity: number
  precipitation: number
  description: string
  summary: string
  icon: string
  windSpeed: number
}

type WeatherResponse = {
  city: string
  country: string
  units: 'metric' | 'imperial' | string
  forecast: ForecastItem[]
}

const toDayLabel = (isoDate: string): string => {
  const parsed = new Date(`${isoDate}T00:00:00`)
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const toUnitLabel = (units: string): string => {
  if (units === 'imperial') return '°F'
  return '°C'
}

export default function WeatherForecastSection() {
  const [city, setCity] = useState('Kuala Lumpur')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateLimits, setDateLimits] = useState({ min: '', max: '' })
  const [searchedCity, setSearchedCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<WeatherResponse | null>(null)

  useEffect(() => {
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(today.getDate() + 33)
    
    const fmt = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    setDateLimits({ min: fmt(today), max: fmt(maxDate) })
  }, [])

  const unitLabel = useMemo(() => toUnitLabel(result?.units || 'metric'), [result?.units])

  const filteredForecast = useMemo(() => {
    if (!result) return []
    return result.forecast.filter(item => {
      if (startDate && item.date < startDate) return false
      if (endDate && item.date > endDate) return false
      return true
    })
  }, [result, startDate, endDate])

  const fetchWeather = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedCity = city.trim()
    if (!normalizedCity) {
      setError('Please enter a city name.')
      setResult(null)
      return
    }

    setLoading(true)
    setError('')

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/weather/forecast?city=${encodeURIComponent(normalizedCity)}`)
      const data = (await response.json()) as WeatherResponse & { error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather forecast.')
      }

      setResult(data)
      setSearchedCity(normalizedCity)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather forecast.'
      setError(message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="weather" className="py-20 px-4 bg-white/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-text mb-4">Weather Forecast</h2>
          <p className="text-text/70 max-w-2xl mx-auto">
            Check 35-day weather insights before you finalize your eco-friendly itinerary.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-organic-lg p-6 md:p-8 shadow-organic">
          <form onSubmit={fetchWeather} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <div className="flex-1">
                <label htmlFor="city" className="block text-sm font-medium text-text mb-2">
                  City or town
                </label>
                <input
                  id="city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="e.g., Singapore"
                  className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-text mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  min={dateLimits.min}
                  max={dateLimits.max}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-text mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  min={startDate || dateLimits.min}
                  max={dateLimits.max}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-secondary disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
              >
                {loading ? 'Checking...' : 'Get Forecast'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <h3 className="font-heading font-semibold text-xl text-text">
                  {result.city}, {result.country}
                </h3>
                <p className="text-sm text-text/60">Showing forecast for: {searchedCity}</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-4">
                {filteredForecast.map((item) => (
                  <article
                    key={item.date}
                    className="bg-background rounded-2xl p-4 shadow-organic border border-white/70"
                  >
                    <p className="text-sm font-medium text-text/80">{toDayLabel(item.date)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {item.icon ? (
                        <Image
                          src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                          alt={item.description}
                          width={48}
                          height={48}
                          className="w-12 h-12"
                          unoptimized
                        />
                      ) : null}
                      <div>
                        <p className="font-heading font-semibold text-2xl text-text leading-none">
                          {item.temperature}
                          {unitLabel}
                        </p>
                        <p className="text-xs text-text/70 capitalize">{item.description}</p>
                      </div>
                    </div>
                    <dl className="mt-3 text-xs text-text/70 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <dt>High / Low</dt>
                        <dd>
                          {item.maxTemperature}{unitLabel} / {item.minTemperature}{unitLabel}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt>Humidity</dt>
                        <dd>{item.humidity}%</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt>Precipitation</dt>
                        <dd>{item.precipitation}%</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt>Wind</dt>
                        <dd>{item.windSpeed} m/s</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
