'use client'

import { useTodos } from '@/hooks/useTodos'

export default function TodosClient() {
  const { data: todos = [], isLoading, error } = useTodos()

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse text-primary">Loading todos...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          Failed to load todos: {error.message}
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-sans font-bold text-3xl text-text mb-6">Todos</h1>
      {todos.length === 0 ? (
        <p className="text-text/60">No todos yet. Start by creating one!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="rounded-lg border border-text/20 bg-white/70 px-4 py-3">
              {todo.name}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
