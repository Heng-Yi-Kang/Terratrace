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

//calculate + save 
export async function calculateAndSave (trips: any[], userid?: string) {

    const response = await fetch(`${API}/api/carbon/calculate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trips, user_id: userid }),
    })
    if (!response.ok)
        throw new Error(`Calculation Failed`)
    return response.json()

}

//fetch full history
export async function fetchHistory(user_id: string): Promise<CarbonEntry[]> {

    const response = await fetch(`${API}/api/carbon/history?user_id=${user_id}`)
    if (!response.ok)
        throw new Error(`Failed to fetch history`)
    return response.json()
}

//fetch full summary
export async function fetchSummary(user_id: string): Promise<CarbonSummary> {

    const response = await fetch(`${API}/api/carbon/summary?user_id=${user_id}`)
    if (!response.ok)
        throw new Error(`Failed to fetch summary`)
    return response.json()
}

//delete entry
export async function deleteEntry(id: string) {
    const response = await fetch(`${API}/api/carbon/entries/${id}`, {
        method: 'DELETE',
    })
    if (!response.ok) throw new Error(`Failed to delete entry`)
    return response.json()
}

