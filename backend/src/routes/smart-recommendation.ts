import { Request, Response, Router } from 'express'
import { randomUUID } from 'crypto'

type Interest = 'nature' | 'culture' | 'food' | 'adventure' | 'wellness' | 'history' | 'shopping'

type SmartRecommendationInput = {
  city: string
  startDate: string
  endDate: string
  budget: number
  interests: Interest[]
}

type WeatherContext = {
  cityName: string
  country?: string
  condition: 'sunny' | 'rainy' | 'mixed' | 'unknown'
  avgTemperatureC: number
}

type SearchCandidate = {
  id: string
  name: string
  url: string
  snippet: string
  sourceDomain: string
  category: 'accommodation' | 'restaurant' | 'activity'
  estimatedCost: number
  isIndoorLikely: boolean
  ecoEvidenceScore: number
  sourceTrustScore: number
  scoreBreakdown: {
    ecoCertScore: number
    interestMatch: number
    weatherFit: number
    budgetFit: number
    total: number
  }
}

type RecommendationItem = {
  candidateId: string
  title: string
  category: 'accommodation' | 'restaurant' | 'activity'
  estimatedCost: number
  rationale: string
  weatherAlternative: string
  communityImpact: string
}

type RecommendationPlan = {
  summary: string
  totalEstimatedCost: number
  recommendations: RecommendationItem[]
}

type SmartRecommendationResponse = {
  requestId: string
  provider: 'gemini' | 'deterministic-fallback'
  cacheHit: boolean
  weather: WeatherContext
  scoringWeights: {
    ecoCertScore: number
    interestMatch: number
    weatherFit: number
    budgetFit: number
  }
  shortlistedCandidates: SearchCandidate[]
  plan: RecommendationPlan
}

type Provider = {
  name: 'gemini' | 'deterministic-fallback'
  generate: (args: {
    input: SmartRecommendationInput
    weather: WeatherContext
    shortlisted: SearchCandidate[]
    repairContext?: {
      previousPlan: RecommendationPlan
      validationErrors: string[]
    }
  }) => Promise<RecommendationPlan>
}

type GeocodeResult = {
  name: string
  country?: string
  latitude: number
  longitude: number
}

const router = Router()

const scoringWeights = {
  ecoCertScore: 0.35,
  interestMatch: 0.25,
  weatherFit: 0.2,
  budgetFit: 0.2,
}

const cacheTTLms = Number(process.env.SMART_RECO_CACHE_TTL_MS || 1000 * 60 * 15)
const maxResults = Number(process.env.SMART_RECO_MAX_RESULTS || 6)
const cache = new Map<string, { expiresAt: number; value: SmartRecommendationResponse }>()

const ecoKeywords = [
  'eco',
  'sustainable',
  'green',
  'eco-certified',
  'low-impact',
  'responsible travel',
  'zero waste',
]

const certificationKeywords = [
  'green key',
  'earthcheck',
  'gstc',
  'leed',
  'b corp',
  'ecolabel',
  'certified',
]

const trustedDomains = [
  'greenkey.global',
  'earthcheck.org',
  'gstcouncil.org',
  'ecobnb.com',
  'bookdifferent.com',
  'responsibletravel.com',
  'lonelyplanet.com',
  'tripadvisor.com',
]

const interestKeywords: Record<Interest, string[]> = {
  nature: ['park', 'trail', 'forest', 'wildlife', 'botanical', 'nature'],
  culture: ['cultural', 'local', 'art', 'festival', 'heritage'],
  food: ['food', 'farm-to-table', 'organic', 'restaurant', 'market'],
  adventure: ['hiking', 'kayak', 'bike', 'trek', 'climb', 'adventure'],
  wellness: ['wellness', 'spa', 'yoga', 'retreat', 'mindful'],
  history: ['history', 'museum', 'historic', 'heritage'],
  shopping: ['craft', 'artisan', 'market', 'shop', 'fairtrade'],
}

const clamp = (value: number, min = 0, max = 1): number => Math.max(min, Math.min(max, value))

const parseDate = (value: string): Date => new Date(`${value}T00:00:00`)

const dateSpan = (startDate: string, endDate: string): string[] => {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  const dates: string[] = []

  const cursor = new Date(start)
  while (cursor <= end) {
    const yyyy = cursor.getFullYear()
    const mm = String(cursor.getMonth() + 1).padStart(2, '0')
    const dd = String(cursor.getDate()).padStart(2, '0')
    dates.push(`${yyyy}-${mm}-${dd}`)
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

const normalizeInterests = (input: string[]): Interest[] => {
  const valid: Interest[] = ['nature', 'culture', 'food', 'adventure', 'wellness', 'history', 'shopping']
  const normalized = input
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry): entry is Interest => valid.includes(entry as Interest))

  return Array.from(new Set(normalized))
}

const htmlDecode = (value: string): string => {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

const stripTags = (value: string): string => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

const decodeDuckDuckGoUrl = (rawHref: string): string => {
  try {
    const absolute = new URL(rawHref, 'https://duckduckgo.com')
    const redirected = absolute.searchParams.get('uddg')
    return redirected ? decodeURIComponent(redirected) : absolute.toString()
  } catch {
    return rawHref
  }
}

const domainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const guessCategory = (text: string): 'accommodation' | 'restaurant' | 'activity' => {
  const lower = text.toLowerCase()
  if (/(hotel|hostel|lodge|resort|stay|accommodation)/.test(lower)) return 'accommodation'
  if (/(restaurant|cafe|dining|bistro|food|eatery)/.test(lower)) return 'restaurant'
  return 'activity'
}

const guessIndoorLikely = (text: string, category: SearchCandidate['category']): boolean => {
  const lower = text.toLowerCase()
  if (category === 'restaurant' || category === 'accommodation') return true
  if (/(museum|gallery|indoor|market hall|workshop|center)/.test(lower)) return true
  return false
}

const guessEstimatedCost = (
  category: SearchCandidate['category'],
  budgetPerDay: number,
  text: string,
): number => {
  const lower = text.toLowerCase()

  if (/(luxury|five-star|5-star|exclusive)/.test(lower)) return Math.round(budgetPerDay * 0.65)
  if (/(budget|affordable|cheap|hostel|free)/.test(lower)) return Math.round(budgetPerDay * 0.2)

  if (category === 'accommodation') return Math.round(budgetPerDay * 0.5)
  if (category === 'restaurant') return Math.round(budgetPerDay * 0.22)
  return Math.round(budgetPerDay * 0.28)
}

const ecoEvidenceScore = (text: string, domain: string): number => {
  const lower = text.toLowerCase()
  let score = 0.25

  if (ecoKeywords.some((entry) => lower.includes(entry))) score += 0.35
  if (certificationKeywords.some((entry) => lower.includes(entry))) score += 0.25
  if (trustedDomains.some((trusted) => domain.endsWith(trusted))) score += 0.15

  return clamp(score)
}

const sourceTrustScore = (domain: string): number => {
  if (!domain) return 0
  if (trustedDomains.some((entry) => domain.endsWith(entry))) return 1
  if (domain.includes('gov') || domain.includes('org')) return 0.75
  return 0.45
}

const interestMatchScore = (candidateText: string, interests: Interest[]): number => {
  if (interests.length === 0) return 0.5
  const lower = candidateText.toLowerCase()
  let matched = 0

  for (const interest of interests) {
    if (interestKeywords[interest].some((term) => lower.includes(term))) {
      matched += 1
    }
  }

  return clamp(matched / interests.length)
}

const weatherFitScore = (isIndoorLikely: boolean, weather: WeatherContext): number => {
  if (weather.condition === 'unknown' || weather.condition === 'mixed') return 0.75
  if (weather.condition === 'rainy') return isIndoorLikely ? 0.95 : 0.45
  return isIndoorLikely ? 0.7 : 0.95
}

const budgetFitScore = (estimatedCost: number, budgetPerDay: number): number => {
  return clamp(1 - Math.max(0, estimatedCost - budgetPerDay) / Math.max(budgetPerDay, 1))
}

const parseSearchResultsFromHtml = (html: string): Array<{ title: string; url: string; snippet: string }> => {
  const results: Array<{ title: string; url: string; snippet: string }> = []

  const primaryRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  let match = primaryRegex.exec(html)

  while (match && results.length < 20) {
    const rawUrl = htmlDecode(match[1])
    const title = htmlDecode(stripTags(match[2]))

    const windowStart = Math.max(0, match.index - 300)
    const windowEnd = Math.min(html.length, match.index + 1200)
    const nearby = html.slice(windowStart, windowEnd)

    const snippetMatch = nearby.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>|<div[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/div>/)
    const snippet = htmlDecode(stripTags(snippetMatch?.[1] || snippetMatch?.[2] || ''))
    const decodedUrl = decodeDuckDuckGoUrl(rawUrl)

    if (title && decodedUrl) {
      results.push({ title, url: decodedUrl, snippet })
    }

    match = primaryRegex.exec(html)
  }

  if (results.length > 0) {
    return results
  }

  // Fallback parser: generic links in case DuckDuckGo markup changes
  const genericRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  let genericMatch = genericRegex.exec(html)

  while (genericMatch && results.length < 20) {
    const rawUrl = htmlDecode(genericMatch[1])
    const title = htmlDecode(stripTags(genericMatch[2]))

    const decodedUrl = decodeDuckDuckGoUrl(rawUrl)
    const domain = domainFromUrl(decodedUrl)

    if (title && decodedUrl && domain && !decodedUrl.includes('duckduckgo.com')) {
      results.push({ title, url: decodedUrl, snippet: '' })
    }

    genericMatch = genericRegex.exec(html)
  }

  return results
}

const weatherCodeToCondition = (code: number): WeatherContext['condition'] => {
  if ([0, 1, 2].includes(code)) return 'sunny'
  if ([61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'rainy'
  return 'mixed'
}

const fetchGeocode = async (city: string): Promise<GeocodeResult> => {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
  )

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status}`)
  }

  const payload = (await response.json()) as {
    results?: Array<{
      name: string
      country?: string
      latitude: number
      longitude: number
    }>
  }

  const top = payload.results?.[0]
  if (!top) {
    throw new Error('City not found')
  }

  return {
    name: top.name,
    country: top.country,
    latitude: top.latitude,
    longitude: top.longitude,
  }
}

const fetchWeatherContext = async (
  city: string,
  startDate: string,
  endDate: string,
): Promise<WeatherContext> => {
  try {
    const geocode = await fetchGeocode(city)

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geocode.latitude}&longitude=${geocode.longitude}&timezone=auto&daily=weather_code,temperature_2m_max,temperature_2m_min&start_date=${startDate}&end_date=${endDate}`,
    )

    if (!response.ok) {
      throw new Error(`Weather failed: ${response.status}`)
    }

    const payload = (await response.json()) as {
      daily?: {
        weather_code?: number[]
        temperature_2m_max?: number[]
        temperature_2m_min?: number[]
      }
    }

    const weatherCodes = payload.daily?.weather_code || []
    const maxTemps = payload.daily?.temperature_2m_max || []
    const minTemps = payload.daily?.temperature_2m_min || []

    if (weatherCodes.length === 0) {
      return {
        cityName: geocode.name,
        country: geocode.country,
        condition: 'unknown',
        avgTemperatureC: 25,
      }
    }

    const rainyCount = weatherCodes.filter((code) => weatherCodeToCondition(code) === 'rainy').length
    const sunnyCount = weatherCodes.filter((code) => weatherCodeToCondition(code) === 'sunny').length

    const condition: WeatherContext['condition'] =
      rainyCount > weatherCodes.length * 0.45 ? 'rainy' : sunnyCount > weatherCodes.length * 0.45 ? 'sunny' : 'mixed'

    const avgTemperatureC =
      maxTemps.length > 0 && minTemps.length > 0
        ? Math.round(
            maxTemps.reduce((sum, value, index) => sum + (value + (minTemps[index] || value)) / 2, 0) /
              Math.max(1, maxTemps.length),
          )
        : 25

    return {
      cityName: geocode.name,
      country: geocode.country,
      condition,
      avgTemperatureC,
    }
  } catch {
    return {
      cityName: city,
      condition: 'unknown',
      avgTemperatureC: 25,
    }
  }
}

const fetchWebSearchResults = async (query: string): Promise<Array<{ title: string; url: string; snippet: string }>> => {
  const response = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`)
  if (!response.ok) {
    return []
  }

  const html = await response.text()
  const parsed = parseSearchResultsFromHtml(html)
  return parsed.slice(0, 8)
}

const buildCandidates = async (
  input: SmartRecommendationInput,
  weather: WeatherContext,
): Promise<SearchCandidate[]> => {
  const days = Math.max(1, dateSpan(input.startDate, input.endDate).length)
  const budgetPerDay = input.budget / days

  const querySet = [
    `${input.city} eco-certified hotels sustainable travel`,
    `${input.city} sustainable restaurants local community`,
    `${input.city} eco-friendly activities ${input.interests.join(' ')}`,
    `${input.city} green destinations responsible tourism`,
  ]

  const resultLists = await Promise.all(querySet.map((query) => fetchWebSearchResults(query)))
  const flattened = resultLists.flat()

  const dedupMap = new Map<string, { title: string; url: string; snippet: string }>()
  for (const item of flattened) {
    const key = item.url.toLowerCase()
    if (!dedupMap.has(key)) {
      dedupMap.set(key, item)
    }
  }

  const candidates: SearchCandidate[] = []
  const entries = Array.from(dedupMap.values()).slice(0, 30)

  for (let index = 0; index < entries.length; index++) {
    const item = entries[index]
    const sourceDomain = domainFromUrl(item.url)
    const text = `${item.title} ${item.snippet}`
    const category = guessCategory(text)
    const isIndoorLikely = guessIndoorLikely(text, category)

    const ecoScoreRaw = ecoEvidenceScore(text, sourceDomain)
    const sourceTrustRaw = sourceTrustScore(sourceDomain)
    const interestRaw = interestMatchScore(text, input.interests)
    const weatherRaw = weatherFitScore(isIndoorLikely, weather)

    const estimatedCost = Math.max(8, guessEstimatedCost(category, budgetPerDay, text))
    const budgetRaw = budgetFitScore(estimatedCost, budgetPerDay)

    const total =
      scoringWeights.ecoCertScore * ecoScoreRaw +
      scoringWeights.interestMatch * interestRaw +
      scoringWeights.weatherFit * weatherRaw +
      scoringWeights.budgetFit * budgetRaw

    // Validation: keep trusted/eco-evidenced and with cost estimate
    if (ecoScoreRaw < 0.45 && sourceTrustRaw < 0.7) {
      continue
    }

    candidates.push({
      id: `cand-${index + 1}`,
      name: item.title,
      url: item.url,
      snippet: item.snippet,
      sourceDomain,
      category,
      estimatedCost,
      isIndoorLikely,
      ecoEvidenceScore: Number(ecoScoreRaw.toFixed(3)),
      sourceTrustScore: Number(sourceTrustRaw.toFixed(3)),
      scoreBreakdown: {
        ecoCertScore: Number(ecoScoreRaw.toFixed(3)),
        interestMatch: Number(interestRaw.toFixed(3)),
        weatherFit: Number(weatherRaw.toFixed(3)),
        budgetFit: Number(budgetRaw.toFixed(3)),
        total: Number(total.toFixed(3)),
      },
    })
  }

  return candidates.sort((a, b) => b.scoreBreakdown.total - a.scoreBreakdown.total).slice(0, 10)
}

const extractGeminiText = (payload: unknown): string => {
  const data = payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string
        }>
      }
    }>
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

const validateRecommendationPlan = (
  plan: RecommendationPlan,
  input: SmartRecommendationInput,
  shortlisted: SearchCandidate[],
): string[] => {
  const errors: string[] = []
  const candidateMap = new Map(shortlisted.map((entry) => [entry.id, entry]))

  if (!plan.summary?.trim()) {
    errors.push('Summary is required.')
  }

  if (!Array.isArray(plan.recommendations) || plan.recommendations.length === 0) {
    errors.push('At least one recommendation is required.')
  }

  let total = 0

  for (const recommendation of plan.recommendations || []) {
    const candidate = candidateMap.get(recommendation.candidateId)
    if (!candidate) {
      errors.push(`Invalid candidateId ${recommendation.candidateId}`)
      continue
    }

    if (!recommendation.weatherAlternative?.trim()) {
      errors.push(`Weather alternative missing for ${recommendation.candidateId}`)
    }

    if (recommendation.estimatedCost <= 0) {
      errors.push(`Estimated cost invalid for ${recommendation.candidateId}`)
    }

    total += recommendation.estimatedCost
  }

  if (total > input.budget) {
    errors.push(`Total estimated cost ${total} exceeds budget ${input.budget}`)
  }

  if (plan.totalEstimatedCost > input.budget) {
    errors.push(`plan.totalEstimatedCost ${plan.totalEstimatedCost} exceeds budget ${input.budget}`)
  }

  return errors
}

const fallbackProvider: Provider = {
  name: 'deterministic-fallback',
  generate: async ({ shortlisted, weather, input }) => {
    const selected = shortlisted.slice(0, maxResults)

    const recommendations: RecommendationItem[] = selected.map((candidate) => ({
      candidateId: candidate.id,
      title: candidate.name,
      category: candidate.category,
      estimatedCost: candidate.estimatedCost,
      rationale: `Selected by score ${candidate.scoreBreakdown.total} (eco ${candidate.scoreBreakdown.ecoCertScore}, interest ${candidate.scoreBreakdown.interestMatch}, weather ${candidate.scoreBreakdown.weatherFit}, budget ${candidate.scoreBreakdown.budgetFit}).`,
      weatherAlternative:
        weather.condition === 'rainy'
          ? 'If rain intensifies, prioritize indoor museum, local market, or eco-restaurant options.'
          : 'If weather shifts to rain, move this activity to an indoor eco-certified venue from the shortlist.',
      communityImpact: 'Supports local operators and sustainability-focused providers with verified eco signals.',
    }))

    const totalEstimatedCost = recommendations.reduce((sum, entry) => sum + entry.estimatedCost, 0)

    return {
      summary: `Smart eco recommendations for ${input.city} based on budget, interests, weather, and source trust validation.`,
      totalEstimatedCost,
      recommendations,
    }
  },
}

const geminiProvider: Provider = {
  name: 'gemini',
  generate: async ({ input, weather, shortlisted, repairContext }) => {
    const key = process.env.GEMINI_API_KEY
    if (!key) {
      throw new Error('GEMINI_API_KEY is missing')
    }

    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

    const schemaHint = {
      summary: 'string',
      totalEstimatedCost: 'number',
      recommendations: [
        {
          candidateId: 'string',
          title: 'string',
          category: 'accommodation|restaurant|activity',
          estimatedCost: 'number',
          rationale: 'string',
          weatherAlternative: 'string',
          communityImpact: 'string',
        },
      ],
    }

    const prompt = [
      'You are a sustainable-travel recommendation engine.',
      'Return JSON only. No markdown.',
      `Schema: ${JSON.stringify(schemaHint)}`,
      `Input city: ${input.city}`,
      `Date range: ${input.startDate} to ${input.endDate}`,
      `Budget: ${input.budget}`,
      `Interests: ${input.interests.join(', ') || 'none'}`,
      `Weather context: ${JSON.stringify(weather)}`,
      `Shortlisted candidates (only use these candidateId values): ${JSON.stringify(shortlisted)}`,
      'Rules:',
      '- Recommend up to 6 items',
      '- totalEstimatedCost must be <= budget',
      '- each item must include weatherAlternative',
      '- prioritize eco certification evidence and local community benefit',
      repairContext
        ? `Repair previous output. Validation errors: ${JSON.stringify(
            repairContext.validationErrors,
          )}. Previous output: ${JSON.stringify(repairContext.previousPlan)}`
        : '',
    ]
      .filter(Boolean)
      .join('\n')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini request failed: ${response.status} ${errorText}`)
    }

    const payload = (await response.json()) as unknown
    const text = extractGeminiText(payload)
    if (!text) {
      throw new Error('Gemini did not return JSON text')
    }

    return JSON.parse(text) as RecommendationPlan
  },
}

const providers = (): Provider[] => [geminiProvider, fallbackProvider]

const validateInput = (
  body: Partial<SmartRecommendationInput>,
): { valid: boolean; message?: string; input?: SmartRecommendationInput } => {
  const city = String(body.city || '').trim()
  const startDate = String(body.startDate || '').trim()
  const endDate = String(body.endDate || '').trim()
  const budget = Number(body.budget)
  const interests = normalizeInterests(Array.isArray(body.interests) ? body.interests : [])

  if (!city) return { valid: false, message: 'City is required.' }
  if (!startDate || !endDate) return { valid: false, message: 'Start and end dates are required.' }
  if (Number.isNaN(parseDate(startDate).getTime()) || Number.isNaN(parseDate(endDate).getTime())) {
    return { valid: false, message: 'Dates must be in YYYY-MM-DD format.' }
  }
  if (parseDate(startDate) > parseDate(endDate)) {
    return { valid: false, message: 'Start date must be before or equal to end date.' }
  }
  if (!Number.isFinite(budget) || budget <= 0) {
    return { valid: false, message: 'Budget must be a positive number.' }
  }

  return {
    valid: true,
    input: {
      city,
      startDate,
      endDate,
      budget,
      interests,
    },
  }
}

router.post('/smart', async (req: Request, res: Response) => {
  const requestId = randomUUID()
  const validated = validateInput(req.body as Partial<SmartRecommendationInput>)

  if (!validated.valid || !validated.input) {
    return res.status(400).json({ error: validated.message || 'Invalid request.', requestId })
  }

  const input = validated.input
  const cacheKey = JSON.stringify({
    city: input.city.toLowerCase(),
    startDate: input.startDate,
    endDate: input.endDate,
    budget: input.budget,
    interests: [...input.interests].sort(),
  })

  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json({ ...cached.value, cacheHit: true, requestId })
  }

  const weather = await fetchWeatherContext(input.city, input.startDate, input.endDate)
  const shortlisted = await buildCandidates(input, weather)

  if (shortlisted.length === 0) {
    console.warn('[smart-recommendation] shortlist-empty', {
      requestId,
      city: input.city,
      interests: input.interests,
      startDate: input.startDate,
      endDate: input.endDate,
    })

    // Graceful deterministic fallback so users still get actionable output
    const fallbackCandidates: SearchCandidate[] = [
      {
        id: 'fallback-1',
        name: `${input.city} Community Eco Hotel`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`${input.city} eco certified hotel`)}`,
        snippet: 'Fallback recommendation generated due to low-confidence web search results. Verify certification before booking.',
        sourceDomain: 'google.com',
        category: 'accommodation',
        estimatedCost: Math.max(30, Math.round(input.budget / Math.max(1, dateSpan(input.startDate, input.endDate).length) * 0.5)),
        isIndoorLikely: true,
        ecoEvidenceScore: 0.55,
        sourceTrustScore: 0.5,
        scoreBreakdown: {
          ecoCertScore: 0.55,
          interestMatch: 0.5,
          weatherFit: 0.8,
          budgetFit: 0.6,
          total: 0.615,
        },
      },
      {
        id: 'fallback-2',
        name: `${input.city} Local Sustainable Food Market`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`${input.city} sustainable restaurant local market`)}`,
        snippet: 'Fallback recommendation generated due to low-confidence web search results. Verify sustainability claims locally.',
        sourceDomain: 'google.com',
        category: 'restaurant',
        estimatedCost: Math.max(15, Math.round(input.budget / Math.max(1, dateSpan(input.startDate, input.endDate).length) * 0.22)),
        isIndoorLikely: true,
        ecoEvidenceScore: 0.52,
        sourceTrustScore: 0.5,
        scoreBreakdown: {
          ecoCertScore: 0.52,
          interestMatch: 0.55,
          weatherFit: 0.85,
          budgetFit: 0.7,
          total: 0.635,
        },
      },
      {
        id: 'fallback-3',
        name: `${input.city} Low-impact Local Activity`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`${input.city} eco friendly activity local community`)}`,
        snippet: 'Fallback recommendation generated due to low-confidence web search results. Prefer operators with transparent eco policies.',
        sourceDomain: 'google.com',
        category: 'activity',
        estimatedCost: Math.max(18, Math.round(input.budget / Math.max(1, dateSpan(input.startDate, input.endDate).length) * 0.28)),
        isIndoorLikely: false,
        ecoEvidenceScore: 0.5,
        sourceTrustScore: 0.5,
        scoreBreakdown: {
          ecoCertScore: 0.5,
          interestMatch: 0.6,
          weatherFit: 0.7,
          budgetFit: 0.7,
          total: 0.61,
        },
      },
    ]

    const fallbackPlan = await fallbackProvider.generate({
      input,
      weather,
      shortlisted: fallbackCandidates,
    })

    const payload: SmartRecommendationResponse = {
      requestId,
      provider: 'deterministic-fallback',
      cacheHit: false,
      weather,
      scoringWeights,
      shortlistedCandidates: fallbackCandidates,
      plan: fallbackPlan,
    }

    cache.set(cacheKey, {
      expiresAt: Date.now() + cacheTTLms,
      value: payload,
    })

    return res.status(200).json(payload)
  }

  console.info('[smart-recommendation] request', {
    requestId,
    input,
    weather,
    shortlisted: shortlisted.map((item) => ({
      id: item.id,
      name: item.name,
      domain: item.sourceDomain,
      total: item.scoreBreakdown.total,
      breakdown: item.scoreBreakdown,
    })),
  })

  for (const provider of providers()) {
    try {
      const firstTry = await provider.generate({ input, weather, shortlisted })
      const firstErrors = validateRecommendationPlan(firstTry, input, shortlisted)

      if (firstErrors.length === 0) {
        const payload: SmartRecommendationResponse = {
          requestId,
          provider: provider.name,
          cacheHit: false,
          weather,
          scoringWeights,
          shortlistedCandidates: shortlisted,
          plan: firstTry,
        }

        cache.set(cacheKey, {
          expiresAt: Date.now() + cacheTTLms,
          value: payload,
        })

        return res.status(200).json(payload)
      }

      if (provider.name === 'gemini') {
        const repaired = await provider.generate({
          input,
          weather,
          shortlisted,
          repairContext: {
            previousPlan: firstTry,
            validationErrors: firstErrors,
          },
        })

        const repairedErrors = validateRecommendationPlan(repaired, input, shortlisted)
        if (repairedErrors.length === 0) {
          const payload: SmartRecommendationResponse = {
            requestId,
            provider: provider.name,
            cacheHit: false,
            weather,
            scoringWeights,
            shortlistedCandidates: shortlisted,
            plan: repaired,
          }

          cache.set(cacheKey, {
            expiresAt: Date.now() + cacheTTLms,
            value: payload,
          })

          return res.status(200).json(payload)
        }

        console.warn('[smart-recommendation] repair-failed', {
          requestId,
          provider: provider.name,
          errors: repairedErrors,
        })
      }
    } catch (error) {
      console.warn('[smart-recommendation] provider-failed', {
        requestId,
        provider: provider.name,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return res.status(502).json({ error: 'Unable to generate smart recommendations right now.', requestId })
})

export default router
