import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useSettings() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => window.api.getSettings()
  })

  const updateSettings = useMutation({
    mutationFn: (data: {
      theme?: string
      defaultModel?: string
      analyticsOptIn?: boolean
      onboardingComplete?: boolean
      preferredBrowser?: string
    }) => window.api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending
  }
}

export function useAvailableBrowsers() {
  const { data: browsers, isLoading } = useQuery({
    queryKey: ['availableBrowsers'],
    queryFn: () => window.api.browserGetAvailableBrowsers()
  })

  return {
    browsers: browsers || [],
    isLoading
  }
}

export function useApiKey() {
  const queryClient = useQueryClient()

  const { data: apiKey, isLoading } = useQuery({
    queryKey: ['apiKey'],
    queryFn: () => window.api.getApiKey()
  })

  const setApiKey = useMutation({
    mutationFn: (key: string) => window.api.setApiKey(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKey'] })
    }
  })

  const deleteApiKey = useMutation({
    mutationFn: () => window.api.deleteApiKey(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKey'] })
    }
  })

  return {
    apiKey,
    isLoading,
    setApiKey: setApiKey.mutate,
    deleteApiKey: deleteApiKey.mutate,
    isSettingKey: setApiKey.isPending
  }
}
