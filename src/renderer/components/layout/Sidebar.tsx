import { Plus, Loader2, Circle, Trash2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog'
import { useUIStore } from '../../stores/uiStore'
import { useConversations } from '../../hooks/useConversations'
import { cn } from '../../lib/utils'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const {
    processingConversations,
    unreadConversations,
    activeConversationId,
    setActiveConversation
  } = useUIStore()
  const { conversations, createConversation, deleteConversation, isCreating } = useConversations()
  const [conversationToDelete, setConversationToDelete] = useState<{
    id: string
    title: string
  } | null>(null)

  const handleNewChat = async () => {
    const conversation = await createConversation('New Chat')
    setActiveConversation(conversation.id)
  }

  const handleDeleteConfirm = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete.id)
      // Clear active conversation if we're deleting it
      if (activeConversationId === conversationToDelete.id) {
        setActiveConversation(null)
      }
      setConversationToDelete(null)
    }
  }

  // Get active conversations (processing or unread)
  const activeConvs = useMemo(() => {
    const activeIds = new Set([...processingConversations, ...unreadConversations])
    return conversations.filter((c) => activeIds.has(c.id))
  }, [conversations, processingConversations, unreadConversations])

  // Group remaining conversations by date (exclude active ones)
  const groupedConversations = useMemo(() => {
    const activeIds = new Set([...processingConversations, ...unreadConversations])
    const nonActiveConvs = conversations.filter((c) => !activeIds.has(c.id))

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups: { label: string; items: typeof conversations }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Last 7 Days', items: [] },
      { label: 'Older', items: [] }
    ]

    nonActiveConvs.forEach((conv) => {
      const date = new Date(conv.updatedAt)
      if (date >= today) {
        groups[0].items.push(conv)
      } else if (date >= yesterday) {
        groups[1].items.push(conv)
      } else if (date >= lastWeek) {
        groups[2].items.push(conv)
      } else {
        groups[3].items.push(conv)
      }
    })

    return groups.filter((g) => g.items.length > 0)
  }, [conversations, processingConversations, unreadConversations])

  return (
    <aside className={cn('flex flex-col bg-muted/30', className)}>
      <div className="p-2">
        <Button
          className="w-full justify-start gap-2"
          variant="outline"
          onClick={handleNewChat}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* Active Conversations (processing or unread) */}
        {activeConvs.length > 0 && (
          <div className="px-2 py-1">
            <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">Active</h3>
            <div className="space-y-0.5">
              {activeConvs.map((conv) => {
                const isProcessing = processingConversations.includes(conv.id)
                const isUnread = unreadConversations.includes(conv.id)
                return (
                  <div
                    key={conv.id}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      activeConversationId === conv.id
                        ? 'bg-accent/50 text-foreground'
                        : 'text-muted-foreground/70 hover:text-foreground'
                    )}
                  >
                    <button
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => setActiveConversation(conv.id)}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                      ) : isUnread ? (
                        <Circle className="h-2 w-2 shrink-0 fill-primary text-primary" />
                      ) : null}
                      <span className="truncate" title={conv.title}>{conv.title}</span>
                    </button>
                    <button
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConversationToDelete({ id: conv.id, title: conv.title })
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Conversation History */}
        {groupedConversations.map((group) => (
          <div key={group.label} className="px-2 py-1">
            <h3 className="mb-1 px-2 text-xs font-medium text-muted-foreground">{group.label}</h3>
            <div className="space-y-0.5">
              {group.items.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    activeConversationId === conv.id
                      ? 'bg-accent/50 text-foreground'
                      : 'text-muted-foreground/70 hover:text-foreground'
                  )}
                >
                  <button
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    onClick={() => setActiveConversation(conv.id)}
                  >
                    <span className="truncate" title={conv.title}>{conv.title}</span>
                  </button>
                  <button
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setConversationToDelete({ id: conv.id, title: conv.title })
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={conversationToDelete !== null}
        onOpenChange={(open) => !open && setConversationToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{conversationToDelete?.title}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConversationToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
