import { useState, useEffect, type FormEvent } from 'react';

// Type TypeScript pour une tâche
interface Todo {
  todo_id: number;
  description: string;
  completed: boolean;
  priority: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('moyenne');
  const [activeFilter, setActiveFilter] = useState<'toutes' | 'faible' | 'moyenne' | 'élevée'>('toutes');

  // Récupérer les tâches au chargement
  const getTodos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/todos');
      const jsonData = await response.json();
      setTodos(jsonData);
    } catch (err) {
      console.error(err);
    }
  };

  // Ajouter une tâche
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedDescription = description.trim();
    if (!trimmedDescription) return;

    try {
      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: trimmedDescription, priority }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Impossible d’ajouter la tâche');
      }

      const newTodo = await response.json();
      setTodos((currentTodos) => [...currentTodos, newTodo]);
      setDescription('');
      setPriority('moyenne');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  // Basculer l'état (coché / décoché)
  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      setTodos(
        todos.map((todo) =>
          todo.todo_id === id ? { ...todo, completed: !completed } : todo
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Supprimer une tâche
  const deleteTodo = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: 'DELETE',
      });
      setTodos(todos.filter((todo) => todo.todo_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  const filteredTodos = todos.filter((todo) => {
    if (activeFilter === 'toutes') return true;
    return todo.priority === activeFilter;
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900">Ma Todo List</h1>

        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Nouvelle tâche..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
          >
            <option value="faible">Faible</option>
            <option value="moyenne">Moyenne</option>
            <option value="élevée">Élevée</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-4 py-3 font-medium text-white transition hover:bg-violet-700"
          >
            Ajouter
          </button>
        </form>

        <div className="mb-4 flex flex-wrap gap-2">
          {(['toutes', 'faible', 'moyenne', 'élevée'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                activeFilter === filter
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'toutes' ? 'Toutes' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {filteredTodos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Aucune tâche pour cette priorité.
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredTodos.map((todo) => (
              <li
                key={todo.todo_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <span
                    onClick={() => toggleTodo(todo.todo_id, todo.completed)}
                    className={`cursor-pointer break-words ${
                      todo.completed ? 'text-slate-400 line-through opacity-70' : 'text-slate-700'
                    }`}
                  >
                    {todo.description}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      todo.priority === 'élevée'
                        ? 'text-rose-600'
                        : todo.priority === 'moyenne'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                    }`}
                  >
                    Priorité : {todo.priority || 'moyenne'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.todo_id)}
                  className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default App;