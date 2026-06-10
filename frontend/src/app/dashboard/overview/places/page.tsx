import PlacesClient from "./components/PlacesClient";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";

export default async function DashboardPlacesPage() {
    const queryClient = new QueryClient();

    try {
        await queryClient.prefetchQuery({
            queryKey: ['locations'],
            queryFn: async () => {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
                const response = await fetch(`${baseUrl}/api/locations`, { cache: 'no-store' })
                if (!response.ok) {
                    throw new Error('Failed to prefetch destinations')
                }
                return response.json()
            }
        });
    } catch (e) {
        console.error("Failed to prefetch locations on server:", e);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PlacesClient />
        </HydrationBoundary>
    );
}
