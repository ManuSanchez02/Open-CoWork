import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useSkills() {
  const queryClient = useQueryClient()

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => window.api.getSkills()
  })

  const { data: enabledSkills = [] } = useQuery({
    queryKey: ['skills', 'enabled'],
    queryFn: () => window.api.getEnabledSkills()
  })

  const createSkill = useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      content: string
      sourceUrl?: string
    }) => window.api.createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    }
  })

  const updateSkill = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { enabled?: boolean; content?: string } }) =>
      window.api.updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    }
  })

  const deleteSkill = useMutation({
    mutationFn: (id: string) => window.api.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    }
  })

  return {
    skills,
    enabledSkills,
    isLoading,
    createSkill: createSkill.mutateAsync,
    updateSkill: updateSkill.mutate,
    deleteSkill: deleteSkill.mutate,
    isCreating: createSkill.isPending
  }
}
