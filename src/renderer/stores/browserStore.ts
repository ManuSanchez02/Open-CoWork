import { create } from 'zustand'

interface BrowserStore {
  showSelectionDialog: boolean
  pendingOperation: (() => Promise<unknown>) | null
  setShowSelectionDialog: (show: boolean) => void
  setPendingOperation: (op: (() => Promise<unknown>) | null) => void
  executePendingOperation: () => Promise<unknown>
}

export const useBrowserStore = create<BrowserStore>((set, get) => ({
  showSelectionDialog: false,
  pendingOperation: null,
  setShowSelectionDialog: (show) => set({ showSelectionDialog: show }),
  setPendingOperation: (op) => set({ pendingOperation: op }),
  executePendingOperation: async () => {
    const { pendingOperation } = get()
    if (pendingOperation) {
      const result = await pendingOperation()
      set({ pendingOperation: null })
      return result
    }
    return null
  }
}))

// Helper to check if browser is configured and show dialog if not
export async function ensureBrowserConfigured(): Promise<boolean> {
  const settings = await window.api.getSettings()
  if (!settings?.preferredBrowser) {
    useBrowserStore.getState().setShowSelectionDialog(true)
    return false
  }
  return true
}
