import { ipcMain, safeStorage, app } from 'electron'
import { getDatabase } from '../database'

const API_KEY_KEY = 'opencowork-api-key'

export function registerSettingsHandlers(): void {
  const prisma = getDatabase()

  // Settings from database
  ipcMain.handle('settings:get', async () => {
    return prisma.settings.findUnique({
      where: { id: 'default' }
    })
  })

  ipcMain.handle(
    'settings:update',
    async (
      _,
      data: {
        theme?: string
        defaultModel?: string
        analyticsOptIn?: boolean
        onboardingComplete?: boolean
        preferredBrowser?: string
      }
    ) => {
      return prisma.settings.update({
        where: { id: 'default' },
        data
      })
    }
  )

  // Secure storage for API key
  ipcMain.handle('settings:getApiKey', async () => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        console.warn('Encryption not available, API key storage disabled')
        return null
      }

      // Store API key in a file in userData
      const fs = await import('fs/promises')
      const path = await import('path')
      const keyPath = path.join(app.getPath('userData'), '.api-key')

      const exists = await fs
        .access(keyPath)
        .then(() => true)
        .catch(() => false)
      if (!exists) return null

      const encrypted = await fs.readFile(keyPath)
      const decrypted = safeStorage.decryptString(encrypted)
      return decrypted
    } catch (error) {
      console.error('Failed to get API key:', error)
      return null
    }
  })

  ipcMain.handle('settings:setApiKey', async (_, key: string) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption not available')
      }

      const fs = await import('fs/promises')
      const path = await import('path')
      const keyPath = path.join(app.getPath('userData'), '.api-key')

      const encrypted = safeStorage.encryptString(key)
      await fs.writeFile(keyPath, encrypted)
    } catch (error) {
      console.error('Failed to set API key:', error)
      throw error
    }
  })

  ipcMain.handle('settings:deleteApiKey', async () => {
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const keyPath = path.join(app.getPath('userData'), '.api-key')

      await fs.unlink(keyPath).catch(() => {
        // Ignore if file doesn't exist
      })
    } catch (error) {
      console.error('Failed to delete API key:', error)
      throw error
    }
  })

  // App paths
  ipcMain.handle('app:getPath', async () => {
    return app.getPath('userData')
  })

  ipcMain.handle('app:getHomePath', async () => {
    return app.getPath('home')
  })

  // Shell execution
  ipcMain.handle('shell:execute', async (_, command: string, cwd?: string) => {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    const result = await execAsync(command, {
      cwd: cwd || app.getPath('home'),
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 10 // 10MB
    })

    return {
      stdout: result.stdout,
      stderr: result.stderr
    }
  })
}
