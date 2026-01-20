import { ipcMain } from 'electron'

interface RegistrySkill {
  id: string
  name: string
  description: string
  tags?: string[]
  downloadCount?: number
}

export function registerSkillRegistryHandlers(): void {
  // Search skills on skillregistry.io
  ipcMain.handle(
    'skillregistry:search',
    async (_, query: string): Promise<RegistrySkill[]> => {
      try {
        const url = query.trim()
          ? `https://skillregistry.io/api/skills?search=${encodeURIComponent(query)}`
          : 'https://skillregistry.io/api/skills/featured'

        const response = await fetch(url)
        if (!response.ok) {
          console.error('[SkillRegistry] Search failed:', response.status)
          return []
        }

        const data = await response.json()
        return Array.isArray(data) ? data : data.skills || []
      } catch (error) {
        console.error('[SkillRegistry] Search error:', error)
        return []
      }
    }
  )

  // Fetch skill content
  ipcMain.handle(
    'skillregistry:getContent',
    async (_, skillId: string): Promise<string | null> => {
      try {
        const response = await fetch(`https://skillregistry.io/skills/${skillId}`)
        if (!response.ok) {
          console.error('[SkillRegistry] Content fetch failed:', response.status)
          return null
        }

        return await response.text()
      } catch (error) {
        console.error('[SkillRegistry] Content fetch error:', error)
        return null
      }
    }
  )
}
