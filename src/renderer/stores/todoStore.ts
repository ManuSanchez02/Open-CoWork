import { create } from 'zustand'

export type TodoStatus = 'pending' | 'in_progress' | 'completed'

export interface Todo {
  id: string
  content: string
  status: TodoStatus
}

interface TodoState {
  todos: Todo[]

  // Actions
  setTodos: (todos: Todo[]) => void
  addTodo: (content: string) => void
  updateTodo: (id: string, updates: Partial<Pick<Todo, 'content' | 'status'>>) => void
  removeTodo: (id: string) => void
  clearTodos: () => void
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],

  setTodos: (todos) => set({ todos }),

  addTodo: (content) =>
    set((state) => ({
      todos: [
        ...state.todos,
        {
          id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          content,
          status: 'pending' as TodoStatus
        }
      ]
    })),

  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    })),

  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id)
    })),

  clearTodos: () => set({ todos: [] })
}))
