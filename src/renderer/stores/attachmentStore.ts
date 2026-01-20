import { create } from 'zustand'

interface Attachment {
  id: string
  type: 'image' | 'file'
  name: string
  data: string
  mimeType: string
}

interface AttachmentState {
  // Map of conversationId -> messageIndex -> attachments
  // Using messageIndex since we don't have messageId until after saving
  attachments: Record<string, Attachment[]>

  // Store attachments for a message (keyed by conversationId:messageContent hash)
  storeAttachments: (key: string, attachments: Attachment[]) => void

  // Get attachments for a message
  getAttachments: (key: string) => Attachment[]

  // Clear all attachments
  clear: () => void
}

// Simple hash function for creating keys
function hashKey(conversationId: string, content: string): string {
  // Use first 50 chars of content + conversationId
  return `${conversationId}:${content.slice(0, 50)}`
}

export const useAttachmentStore = create<AttachmentState>((set, get) => ({
  attachments: {},

  storeAttachments: (key: string, attachments: Attachment[]) => {
    set((state) => ({
      attachments: {
        ...state.attachments,
        [key]: attachments
      }
    }))
  },

  getAttachments: (key: string) => {
    return get().attachments[key] || []
  },

  clear: () => {
    set({ attachments: {} })
  }
}))

export { hashKey }
export type { Attachment }
