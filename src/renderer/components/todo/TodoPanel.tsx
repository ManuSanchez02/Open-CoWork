import { Circle, CheckCircle2, Loader2, X } from 'lucide-react'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { useTodoStore, type TodoStatus } from '../../stores/todoStore'
import { useUIStore } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

interface TodoPanelProps {
  className?: string
}

export function TodoPanel({ className }: TodoPanelProps) {
  const { todos, clearTodos } = useTodoStore()
  const { setTodoPanelOpen } = useUIStore()

  const statusIcon = (status: TodoStatus) => {
    switch (status) {
      case 'pending':
        return <Circle className="h-4 w-4 text-muted-foreground" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div className={cn('flex h-full flex-col bg-muted/30', className)}>
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
        <span className="text-sm font-medium">Tasks</span>
        <div className="flex items-center gap-1">
          {todos.length > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearTodos}>
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setTodoPanelOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-2">
        {todos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active tasks. The AI will create tasks when working on multi-step operations.
          </p>
        ) : (
          <div className="space-y-1">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={cn(
                  'flex items-start gap-2 rounded-md px-2 py-1.5 text-sm',
                  todo.status === 'in_progress' && 'bg-primary/10',
                  todo.status === 'completed' && 'text-muted-foreground line-through'
                )}
              >
                <span className="mt-0.5 shrink-0">{statusIcon(todo.status)}</span>
                <span className="break-words">{todo.content}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
