import { registerDatabaseHandlers } from './database.ipc'
import { registerFileSystemHandlers } from './file-system.ipc'
import { registerPermissionHandlers } from './permissions.ipc'
import { registerSettingsHandlers } from './settings.ipc'
import { registerBrowserHandlers, cleanupBrowser } from './browser.ipc'
import { registerSkillRegistryHandlers } from './skillregistry.ipc'

export function registerIpcHandlers(): void {
  registerDatabaseHandlers()
  registerFileSystemHandlers()
  registerPermissionHandlers()
  registerSettingsHandlers()
  registerBrowserHandlers()
  registerSkillRegistryHandlers()
}

export { cleanupBrowser }
