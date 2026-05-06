import { createClient, supabaseConnectionState } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import TodosClient from "./components/TodosClient";

export default async function TodosPage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-3">Todos</h1>
        <p className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          Supabase is not configured. Missing env vars: {supabaseConnectionState.missingEnvVars.join(", ")}
        </p>
      </main>
    );
  }

  const { data: todos } = await supabase.from("todos").select();

  // Prefetch into cache so client can read from it
  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: () => Promise.resolve(todos ?? []),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodosClient />
    </HydrationBoundary>
  );
}
