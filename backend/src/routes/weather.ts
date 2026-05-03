import { Router, Request, Response } from 'express'

const router = Router()

type OpenWeatherItem = {
  dt: number
  dt_txt: string
  main: {
    temp: number
    temp_min: number
    temp_max: number
    humidity: number
  }
  weather: Array<{
    description: string
    icon: string
    main: string
  }>
  pop?: number
  wind: {
    speed: number
  }
}

type OpenWeatherForecastResponse = {
  cod: string
  message: number
  cnt: number
  list: OpenWeatherItem[]
  city: {
    name: string
    country: string
    timezone: number
  }
}

const pickDailySnapshots = (items: OpenWeatherItem[]): OpenWeatherItem[] => {
  const byDate = new Map<string, OpenWeatherItem[]>()

  for (const item of items) {
    const dateKey = item.dt_txt.split(' ')[0]
    const current = byDate.get(dateKey) || []
    current.push(item)
    byDate.set(dateKey, current)
  }

  const selected: OpenWeatherItem[] = []
  for (const dayItems of byDate.values()) {
    let best = dayItems[0]
    let bestDistance = Math.abs(new Date(best.dt_txt).getHours() - 12)

    for (const item of dayItems) {
      const distance = Math.abs(new Date(item.dt_txt).getHours() - 12)
      if (distance < bestDistance) {
        best = item
        bestDistance = distance
      }
    }

    selected.push(best)
  }

  return selected.slice(0, 5)
}

router.get('/forecast', async (req: Request, res: Response) => {
  const city = String(req.query.city || '').trim()

  if (!city) {
    return res.status(400).json({ error: 'City is required.' })
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenWeather API key is not configured.' })
  }

  const units = process.env.OPENWEATHER_UNITS || 'metric'
  const lang = process.env.OPENWEATHER_LANG || 'en'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const params = new URLSearchParams({
      q: city,
      appid: apiKey,
      units,
      lang,
    })

    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${params.toString()}`, {
      signal: controller.signal,
    })

    const data = (await response.json()) as OpenWeatherForecastResponse & { message?: string }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Unable to fetch weather data.',
      })
    }

    const dailyForecast = pickDailySnapshots(data.list).map((item) => ({
      date: item.dt_txt.split(' ')[0],
      temperature: Math.round(item.main.temp),
      minTemperature: Math.round(item.main.temp_min),
      maxTemperature: Math.round(item.main.temp_max),
      humidity: item.main.humidity,
      precipitation: Math.round((item.pop || 0) * 100),
      description: item.weather[0]?.description || 'N/A',
      summary: item.weather[0]?.main || 'N/A',
      icon: item.weather[0]?.icon || '',
      windSpeed: item.wind.speed,
    }))

    return res.status(200).json({
      city: data.city.name,
      country: data.city.country,
      timezone: data.city.timezone,
      units,
      forecast: dailyForecast,
    })
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return res.status(504).json({ error: 'Weather provider timeout. Please try again.' })
    }

    return res.status(500).json({ error: 'Unable to fetch weather data.' })
  } finally {
    clearTimeout(timeout)
  }
})

export default router
