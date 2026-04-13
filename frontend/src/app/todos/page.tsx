import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Todos</h1>
      <ul className="space-y-2">
        {todos?.map((todo) => (
          <li key={todo.id} className="rounded-lg border border-text/20 bg-white/70 px-4 py-3">
            {todo.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
