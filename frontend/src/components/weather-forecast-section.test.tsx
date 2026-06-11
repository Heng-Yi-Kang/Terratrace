import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WeatherForecastSection from './weather-forecast-section'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const forecastResponse = {
  city: 'Kyoto',
  country: 'JP',
  units: 'metric',
  forecast: [
    {
      date: '2026-06-20',
      temperature: 18,
      minTemperature: 14,
      maxTemperature: 21,
      humidity: 80,
      precipitation: 40,
      description: 'light rain',
      summary: 'Rainy',
      icon: '10d',
      windSpeed: 3,
    },
    {
      date: '2026-06-21',
      temperature: 20,
      minTemperature: 16,
      maxTemperature: 24,
      humidity: 70,
      precipitation: 15,
      description: 'scattered clouds',
      summary: 'Cloudy',
      icon: '03d',
      windSpeed: 2,
    },
  ],
}

async function submitWeatherForm(city = 'Kyoto') {
  await userEvent.clear(screen.getByLabelText(/city or town/i))
  await userEvent.type(screen.getByLabelText(/city or town/i), city)
  await userEvent.click(screen.getByRole('button', { name: /get forecast/i }))
}

describe('WeatherForecastSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('validates blank city searches without fetching', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    render(<WeatherForecastSection />)

    await userEvent.clear(screen.getByLabelText(/city or town/i))
    await userEvent.click(screen.getByRole('button', { name: /get forecast/i }))

    expect(await screen.findByText('Please enter a city name.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renders a successful forecast response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(forecastResponse))
    render(<WeatherForecastSection />)

    await submitWeatherForm()

    expect(await screen.findByRole('heading', { name: /Kyoto, JP/i })).toBeInTheDocument()
    expect(screen.getByText(/Showing forecast for: Kyoto/i)).toBeInTheDocument()
    expect(screen.getByText('18°C')).toBeInTheDocument()
    expect(screen.getByText('light rain')).toBeInTheDocument()
    expect(screen.getByAltText('light rain')).toHaveAttribute(
      'src',
      'https://openweathermap.org/img/wn/10d@2x.png',
    )
  })

  it('filters rendered forecast days by selected dates', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(forecastResponse))
    render(<WeatherForecastSection />)

    await userEvent.type(screen.getByLabelText(/start date/i), '2026-06-21')
    await userEvent.type(screen.getByLabelText(/end date/i), '2026-06-21')
    await submitWeatherForm()

    expect(await screen.findByText('20°C')).toBeInTheDocument()
    expect(screen.getByText('scattered clouds')).toBeInTheDocument()
    expect(screen.queryByText('18°C')).not.toBeInTheDocument()
    expect(screen.queryByText('light rain')).not.toBeInTheDocument()
  })

  it('renders API errors from failed forecast responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ error: 'Weather provider unavailable.' }, { status: 503 }),
    )
    render(<WeatherForecastSection />)

    await submitWeatherForm()

    expect(await screen.findByText('Weather provider unavailable.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Kyoto, JP/i })).not.toBeInTheDocument()
  })
})
