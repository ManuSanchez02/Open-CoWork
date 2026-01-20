import { Globe, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog'
import { Button } from '../ui/button'
import { useSettings, useAvailableBrowsers } from '../../hooks/useSettings'
import { cn } from '../../lib/utils'

interface BrowserSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (browserId: string) => void
}

export function BrowserSelectionDialog({
  open,
  onOpenChange,
  onSelect
}: BrowserSelectionDialogProps) {
  const { settings, updateSettings } = useSettings()
  const { browsers, isLoading } = useAvailableBrowsers()

  const handleSelect = (browserId: string) => {
    updateSettings({ preferredBrowser: browserId })
    onSelect?.(browserId)
    onOpenChange(false)
  }

  // Filter to only show browsers with data (user has used them)
  const browsersWithData = browsers.filter((b) => b.hasData)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Choose Your Browser
          </DialogTitle>
          <DialogDescription>
            Select which browser to use for web browsing. Your logins and cookies from this browser
            will be available.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading browsers...</div>
          ) : browsersWithData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No browsers with saved data found. A fresh browser session will be used.
            </div>
          ) : (
            browsersWithData.map((browser) => (
              <button
                key={browser.id}
                onClick={() => handleSelect(browser.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent',
                  settings?.preferredBrowser === browser.id && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{browser.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {browser.hasData ? 'Logins available' : 'No saved data'}
                  </div>
                </div>
                {settings?.preferredBrowser === browser.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {browsersWithData.length === 0 && (
            <Button onClick={() => handleSelect('chromium')}>Use Fresh Browser</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
