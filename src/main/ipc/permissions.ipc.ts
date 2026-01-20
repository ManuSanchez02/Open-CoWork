import { ipcMain } from 'electron'
import { getDatabase } from '../database'

// Session-only permissions (not persisted)
const sessionPermissions = new Map<string, boolean>()

function permissionKey(path: string, operation: string): string {
  return `${path}:${operation}`
}

export function registerPermissionHandlers(): void {
  const prisma = getDatabase()

  ipcMain.handle('permissions:check', async (_, path: string, operation: string) => {
    const key = permissionKey(path, operation)

    // Check session permissions first
    if (sessionPermissions.has(key)) {
      return { scope: 'session', path, operation }
    }

    // Check persisted "always" permissions
    const permission = await prisma.permission.findUnique({
      where: { path_operation: { path, operation } }
    })

    return permission
  })

  ipcMain.handle(
    'permissions:grant',
    async (_, path: string, operation: string, scope: string) => {
      const key = permissionKey(path, operation)

      if (scope === 'session') {
        sessionPermissions.set(key, true)
        return { id: key, path, operation, scope, createdAt: new Date() }
      }

      // Persist "always" permissions
      return prisma.permission.upsert({
        where: { path_operation: { path, operation } },
        update: { scope },
        create: { path, operation, scope }
      })
    }
  )

  ipcMain.handle('permissions:revoke', async (_, path: string, operation: string) => {
    const key = permissionKey(path, operation)
    sessionPermissions.delete(key)

    await prisma.permission
      .delete({
        where: { path_operation: { path, operation } }
      })
      .catch(() => {
        // Ignore if not found
      })
  })

  ipcMain.handle('permissions:list', async () => {
    const persisted = await prisma.permission.findMany()
    const session = Array.from(sessionPermissions.keys()).map((key) => {
      const [path, operation] = key.split(':')
      return { id: key, path, operation, scope: 'session', createdAt: new Date() }
    })
    return [...persisted, ...session]
  })

  ipcMain.handle('permissions:clearSession', async () => {
    sessionPermissions.clear()
  })
}
