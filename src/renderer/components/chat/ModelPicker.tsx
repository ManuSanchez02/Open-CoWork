import { useState } from 'react'
import { ChevronDown, Plus, X, ExternalLink } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useUIStore, DEFAULT_MODELS } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

interface ModelPickerProps {
  variant?: 'default' | 'minimal'
}

export function ModelPicker({ variant = 'default' }: ModelPickerProps) {
  const { selectedModel, setSelectedModel, customModels, addCustomModel, removeCustomModel } =
    useUIStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customModelId, setCustomModelId] = useState('')

  const allModels = [...DEFAULT_MODELS, ...customModels]
  const currentModel = allModels.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel.split('/').pop() || selectedModel,
    provider: selectedModel.split('/')[0] || 'Custom'
  }

  const handleAddCustomModel = () => {
    if (customModelId.trim()) {
      const parts = customModelId.trim().split('/')
      const provider = parts[0] || 'Custom'
      const name = parts.slice(1).join('/') || customModelId
      addCustomModel({
        id: customModelId.trim(),
        name,
        provider
      })
      setSelectedModel(customModelId.trim())
      setCustomModelId('')
      setShowAddCustom(false)
    }
  }

  return (
    <div className="relative">
      {variant === 'minimal' ? (
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-medium">{currentModel.name}</span>
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
        </button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-medium">{currentModel.name}</span>
          <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      )}

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-lg border bg-popover p-2 shadow-lg">
            <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">Select Model</div>

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {allModels.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    'flex items-center justify-between rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent',
                    selectedModel === model.id && 'bg-accent'
                  )}
                  onClick={() => {
                    setSelectedModel(model.id)
                    setIsOpen(false)
                  }}
                >
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.provider}</div>
                  </div>
                  {customModels.some((m) => m.id === model.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCustomModel(model.id)
                        if (selectedModel === model.id) {
                          setSelectedModel(DEFAULT_MODELS[0].id)
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2 border-t pt-2">
              {showAddCustom ? (
                <div className="space-y-2">
                  <Input
                    placeholder="e.g. openai/gpt-4o"
                    value={customModelId}
                    onChange={(e) => setCustomModelId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomModel()
                      if (e.key === 'Escape') setShowAddCustom(false)
                    }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 flex-1 text-xs" onClick={handleAddCustomModel}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setShowAddCustom(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                  onClick={() => setShowAddCustom(true)}
                >
                  <Plus className="h-3 w-3" />
                  Add custom model
                </Button>
              )}

              <a
                href="https://openrouter.ai/models"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                Browse models on OpenRouter
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
