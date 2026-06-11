const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export type CarbonResult = {
    total: number
    flightEmissions: number
    carEmissions: number
    hotelEmissions: number
    railEmissions: number
    busEmissions: number
    taxiEmissions: number
}

export type CarbonEntry = {
    id: string
    created_at: string
    trips: any[]
    total_emissions: number
    flight_emissions: number
    car_emissions: number
    hotel_emissions: number
    rail_emissions: number
    bus_emissions: number
    taxi_emissions: number
}

export type CarbonSummary = {
    totalEmissions: number
    totalCalculations: number
    biggestTrip: number
    avgPerTrip: number
    entries: CarbonEntry[]
}

export type CarbonSuggestions = {
    provider: 'gemini' | 'deterministic-fallback' | 'hardcoded-fallback'
    highestSource: string
    suggestions: string[]
}

const numberFromApi = (value: unknown): number => {
    const parsed = Number(value ?? 0)
    return Number.isFinite(parsed) ? parsed : 0
}

const normalizeEntry = (entry: any): CarbonEntry => ({
    ...entry,
    trips: Array.isArray(entry.trips) ? entry.trips : [],
    total_emissions: numberFromApi(entry.total_emissions),
    flight_emissions: numberFromApi(entry.flight_emissions),
    car_emissions: numberFromApi(entry.car_emissions),
    hotel_emissions: numberFromApi(entry.hotel_emissions),
    rail_emissions: numberFromApi(entry.rail_emissions),
    bus_emissions: numberFromApi(entry.bus_emissions),
    taxi_emissions: numberFromApi(entry.taxi_emissions),
})

const valueFromApi = (data: any, camelKey: string, snakeKey: string): number =>
    numberFromApi(data?.[camelKey] ?? data?.[snakeKey])

const normalizeCarbonResult = (data: any): CarbonResult => ({
    total: valueFromApi(data, 'total', 'total_emissions'),
    flightEmissions: valueFromApi(data, 'flightEmissions', 'flight_emissions'),
    carEmissions: valueFromApi(data, 'carEmissions', 'car_emissions'),
    hotelEmissions: valueFromApi(data, 'hotelEmissions', 'hotel_emissions'),
    railEmissions: valueFromApi(data, 'railEmissions', 'rail_emissions'),
    busEmissions: valueFromApi(data, 'busEmissions', 'bus_emissions'),
    taxiEmissions: valueFromApi(data, 'taxiEmissions', 'taxi_emissions'),
})

//authHeaders
async function getAuthHeaders(): Promise<HeadersInit> {
    return{
        'Content-type': 'application/json',
    }
}

//calculate + save 
export async function calculateAndSave (trips: any[]): Promise<CarbonResult> {

    const headers = await getAuthHeaders()
    const response = await fetch(`${API}/api/carbon/calculate`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ trips }),
    })
    if (!response.ok)
        throw new Error(`Calculation Failed`)
    return normalizeCarbonResult(await response.json())

}

export async function fetchCarbonSuggestions(result: CarbonResult): Promise<CarbonSuggestions> {

    const headers = await getAuthHeaders()
    const response = await fetch(`${API}/api/carbon/suggestions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ result }),
    })

    if (!response.ok)
        throw new Error(`Failed to fetch carbon suggestions`)

    const data = await response.json()
    const suggestions = Array.isArray(data.suggestions)
        ? data.suggestions.map((entry: unknown) => String(entry || '').trim()).filter(Boolean)
        : []

    if (suggestions.length === 0)
        throw new Error(`No carbon suggestions returned`)

    return {
        provider: data.provider === 'gemini' ? 'gemini' : 'deterministic-fallback',
        highestSource: String(data.highestSource || ''),
        suggestions,
    }
}

//fetch full history
export async function fetchHistory(): Promise<CarbonEntry[]> {

    const headers = await getAuthHeaders()
    const response = await fetch(`${API}/api/carbon/history`, { headers, credentials: 'include' })
    if (!response.ok)
        throw new Error(`Failed to fetch history`)
    const data = await response.json()
    return Array.isArray(data) ? data.map(normalizeEntry) : []
}

//fetch full summary
export async function fetchSummary(): Promise<CarbonSummary> {

    const headers = await getAuthHeaders()
    const response = await fetch(`${API}/api/carbon/summary`, { headers, credentials: 'include' })
    if (!response.ok)
        throw new Error(`Failed to fetch summary`)
    const data = await response.json()
    const entries = Array.isArray(data.entries) ? data.entries.map(normalizeEntry) : []

    return {
        ...data,
        totalEmissions: numberFromApi(data.totalEmissions),
        totalCalculations: numberFromApi(data.totalCalculations),
        biggestTrip: numberFromApi(data.biggestTrip),
        avgPerTrip: numberFromApi(data.avgPerTrip),
        entries,
    }
}

//delete entry
export async function deleteEntry(id: string) {

    const headers = await getAuthHeaders()
    const response = await fetch(`${API}/api/carbon/entries/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
    })
    if (!response.ok) throw new Error(`Failed to delete entry`)
    return response.json()
}
