const initialTodos = [
  { id: 1, label: "デザイン案を確認する", completed: false },
  { id: 2, label: "週次レポートを作成する", completed: true },
  { id: 3, label: "クライアントに返信する", completed: false },
  { id: 4, label: "請求書を送付する", completed: false },
];

let todos = initialTodos.map((todo) => ({ ...todo }));
let nextId = 5;

const form = document.querySelector("#todo-form");
const input = document.querySelector("#new-todo");
const addButton = document.querySelector("#add-button");
const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");

function checkIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7"></path></svg>';
}

function trashIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"></path></svg>';
}

function render() {
  list.replaceChildren();

  for (const todo of todos) {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " is-complete" : ""}`;

    const checkButton = document.createElement("button");
    checkButton.className = "check-button";
    checkButton.type = "button";
    checkButton.setAttribute("aria-pressed", String(todo.completed));
    checkButton.setAttribute(
      "aria-label",
      todo.completed ? `${todo.label}を未完了にする` : `${todo.label}を完了にする`,
    );
    checkButton.innerHTML = todo.completed ? checkIcon() : "";
    checkButton.addEventListener("click", () => setTodoCompleted(todo.id, !todo.completed));

    const label = document.createElement("span");
    label.className = "todo-label";
    label.textContent = todo.label;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `${todo.label}を削除`);
    deleteButton.innerHTML = trashIcon();
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    item.append(checkButton, label, deleteButton);
    list.append(item);
  }

  emptyState.hidden = todos.length !== 0;
}

function addTodo(label) {
  const normalizedLabel = String(label ?? "").trim();
  if (!normalizedLabel) {
    throw new Error("タスク名を入力してください。");
  }

  const todo = { id: nextId++, label: normalizedLabel, completed: false };
  todos = [...todos, todo];
  render();
  return { ...todo };
}

function setTodoCompleted(id, completed) {
  const todoId = Number(id);
  const target = todos.find((todo) => todo.id === todoId);
  if (!target) {
    throw new Error("指定されたタスクが見つかりません。");
  }

  todos = todos.map((todo) =>
    todo.id === todoId ? { ...todo, completed: Boolean(completed) } : todo,
  );
  render();
  return { ...todos.find((todo) => todo.id === todoId) };
}

function deleteTodo(id) {
  const todoId = Number(id);
  const target = todos.find((todo) => todo.id === todoId);
  if (!target) {
    throw new Error("指定されたタスクが見つかりません。");
  }

  todos = todos.filter((todo) => todo.id !== todoId);
  render();
  return { id: todoId, deleted: true };
}

input.addEventListener("input", () => {
  addButton.disabled = input.value.trim().length === 0;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(input.value);
  input.value = "";
  addButton.disabled = true;
  input.focus();
});

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;

  const tools = [
    {
      name: "list_todos",
      title: "タスク一覧を取得",
      description: "現在表示されているTodoタスクを取得します。",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        return { todos: todos.map((todo) => ({ ...todo })) };
      },
    },
    {
      name: "add_todo",
      title: "タスクを追加",
      description: "新しいTodoタスクを追加し、画面の一覧を更新します。",
      inputSchema: {
        type: "object",
        properties: { label: { type: "string", minLength: 1 } },
        required: ["label"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute({ label }) {
        return { todo: addTodo(label) };
      },
    },
    {
      name: "set_todo_completed",
      title: "タスクの完了状態を変更",
      description: "指定したタスクの完了または未完了の状態を変更します。",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "integer" },
          completed: { type: "boolean" },
        },
        required: ["id", "completed"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute({ id, completed }) {
        return { todo: setTodoCompleted(id, completed) };
      },
    },
    {
      name: "delete_todo",
      title: "タスクを削除",
      description: "指定したTodoタスクを削除し、画面の一覧を更新します。",
      inputSchema: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute({ id }) {
        return deleteTodo(id);
      },
    },
  ];

  for (const tool of tools) {
    try {
      void Promise.resolve(context.registerTool(tool)).catch(() => {});
    } catch {
      // WebMCP is optional; the visible app remains fully functional.
    }
  }
}

render();
registerWebMcpTools();
