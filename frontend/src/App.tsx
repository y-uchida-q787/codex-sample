import { useState } from "react";
import type { FormEvent } from "react";

type Todo = {
  id: number;
  label: string;
  completed: boolean;
};

const initialTodos: Todo[] = [
  { id: 1, label: "デザイン案を確認する", completed: false },
  { id: 2, label: "週次レポートを作成する", completed: true },
  { id: 3, label: "クライアントに返信する", completed: false },
  { id: 4, label: "請求書を送付する", completed: false },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />
    </svg>
  );
}

export default function App() {
  const [todos, setTodos] = useState(initialTodos);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = newTodo.trim();

    if (!label) return;

    setTodos((current) => [
      ...current,
      { id: Date.now(), label, completed: false },
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#top" aria-label="Todo ホーム">
          Todo
        </a>
      </header>

      <main className="todo-page" id="top">
        <section className="todo-panel" aria-labelledby="todo-heading">
          <h1 id="todo-heading" className="sr-only">
            タスク一覧
          </h1>

          <form className="todo-form" onSubmit={addTodo}>
            <label className="sr-only" htmlFor="new-todo">
              新しいタスク
            </label>
            <input
              id="new-todo"
              value={newTodo}
              onChange={(event) => setNewTodo(event.target.value)}
              placeholder="タスクを入力..."
              autoComplete="off"
            />
            <button className="add-button" type="submit" disabled={!newTodo.trim()}>
              追加
            </button>
          </form>

          <ul className="todo-list" aria-live="polite">
            {todos.map((todo) => (
              <li className={`todo-item${todo.completed ? " is-complete" : ""}`} key={todo.id}>
                <button
                  className="check-button"
                  type="button"
                  aria-label={todo.completed ? `${todo.label}を未完了にする` : `${todo.label}を完了にする`}
                  aria-pressed={todo.completed}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.completed && <CheckIcon />}
                </button>
                <span className="todo-label">{todo.label}</span>
                <button
                  className="delete-button"
                  type="button"
                  aria-label={`${todo.label}を削除`}
                  onClick={() => deleteTodo(todo.id)}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>

          {todos.length === 0 && (
            <p className="empty-state">タスクはありません。新しいタスクを追加しましょう。</p>
          )}
        </section>
      </main>
    </div>
  );
}
