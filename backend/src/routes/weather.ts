import { Router, Request, Response } from 'express'

const router = Router()

const wmoToOpenWeatherIcon = (code: number, isDay: boolean = true): string => {
  const d = isDay ? 'd' : 'n'
  if (code === 0) return `01${d}`
  if (code === 1) return `02${d}`
  if (code === 2) return `03${d}`
  if (code === 3) return `04${d}`
  if ([45, 48].includes(code)) return `50${d}`
  if ([51, 53, 55, 56, 57].includes(code)) return `09${d}`
  if ([61, 63, 65, 66, 67].includes(code)) return `10${d}`
  if ([71, 73, 75, 77].includes(code)) return `13${d}`
  if ([80, 81, 82].includes(code)) return `09${d}`
  if ([85, 86].includes(code)) return `13${d}`
  if ([95, 96, 99].includes(code)) return `11${d}`
  return `01${d}`
}

const wmoToDescription = (code: number): string => {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Fog'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code >= 85 && code <= 86) return 'Snow showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Unknown'
}

router.get('/forecast', async (req: Request, res: Response) => {
  const city = String(req.query.city || '').trim()

  if (!city) {
    return res.status(400).json({ error: 'City is required.' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    // 1. Geocoding via Open-Meteo
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`, { signal: controller.signal })
    const geoData = await geoRes.json()
    
    if (!geoRes.ok || !geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: 'City not found.' })
    }

    const { latitude, longitude, name, country, timezone } = geoData.results[0]
    
    // 2. Ensemble Forecast (14 days using GFS model)
    const url = `https://ensemble-api.open-meteo.com/v1/ensemble?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&models=gfs_seamless&forecast_days=14`
    
    const weatherRes = await fetch(url, { signal: controller.signal })
    const weatherData = await weatherRes.json()

    if (!weatherRes.ok) {
      return res.status(weatherRes.status).json({ error: 'Unable to fetch weather data from Open-Meteo.' })
    }

    const daily = weatherData.daily
    const forecast = []
    
    for (let i = 0; i < daily.time.length; i++) {
      const wmoCode = daily.weather_code[i]
      
      // Calculate probability from ensemble members
      let rainMembers = 0
      let validMembers = 0
      for (let m = 1; m <= 30; m++) {
        const memberKey = `precipitation_sum_member${m.toString().padStart(2, '0')}`
        if (daily[memberKey] && daily[memberKey][i] !== undefined) {
          validMembers++
          if (daily[memberKey][i] > 0.1) rainMembers++
        }
      }
      const precipitation = validMembers > 0 ? Math.round((rainMembers / validMembers) * 100) : 0

      forecast.push({
        date: daily.time[i],
        temperature: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
        minTemperature: Math.round(daily.temperature_2m_min[i]),
        maxTemperature: Math.round(daily.temperature_2m_max[i]),
        humidity: 60, // Ensemble model doesn't supply daily mean humidity directly
        precipitation, 
        description: wmoToDescription(wmoCode),
        summary: wmoToDescription(wmoCode),
        icon: wmoToOpenWeatherIcon(wmoCode),
        windSpeed: Math.round((daily.wind_speed_10m_max[i] * 1000) / 3600) // Convert km/h to m/s
      })
    }

    return res.status(200).json({
      city: name,
      country: country,
      timezone: timezone || 'UTC',
      units: 'metric',
      forecast
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
