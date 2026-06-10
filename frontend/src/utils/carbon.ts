const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

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

//authHeaders
async function getAuthHeaders(): Promise<HeadersInit> {
    return{
        'Content-type': 'application/json',
    }
}

//calculate + save 
export async function calculateAndSave (trips: any[]) {

    const headers = await getAuthHeaders()
    const response = await fetch(`${API}/api/carbon/calculate`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ trips }),
    })
    if (!response.ok)
        throw new Error(`Calculation Failed`)
    return response.json()

}

//fetch full history
export async function fetchHistory(): Promise<CarbonEntry[]> {

    const headers = await getAuthHeaders()
    const response = await fetch(`${API}/api/carbon/history`, { headers, credentials: 'include' })
    if (!response.ok)
        throw new Error(`Failed to fetch history`)
    return response.json()
}

//fetch full summary
export async function fetchSummary(): Promise<CarbonSummary> {

    const headers = await getAuthHeaders()
    const response = await fetch(`${API}/api/carbon/summary`, { headers, credentials: 'include' })
    if (!response.ok)
        throw new Error(`Failed to fetch summary`)
    return response.json()
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
