import { ipcMain, dialog } from 'electron'
import { readFile, writeFile, readdir, stat, access } from 'fs/promises'
import { join, resolve } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import fg from 'fast-glob'

const execAsync = promisify(exec)

// Dangerous command patterns that should be blocked
const BLOCKED_PATTERNS = [
  /\brm\s+(-[a-zA-Z]*f|-[a-zA-Z]*r|--force|--recursive)/i,
  /\brm\s+-rf\b/i,
  /\brm\s+-fr\b/i,
  /\bsudo\s+rm\b/i,
  /\bmkfs\b/i,
  /\bdd\s+.*\bof=/i,
  /\b:.*\(\).*\{.*:\|.*\}/i, // Fork bomb pattern
  /\bchmod\s+(-[a-zA-Z]*)?\s*(000|777|a-rwx)/i,
  /\bchown\s+.*\//i,
  />\s*\/dev\/(sda|hda|null)/i
]

export function registerFileSystemHandlers(): void {
  ipcMain.handle('fs:readFile', async (_, path: string) => {
    const content = await readFile(path, 'utf-8')
    return content
  })

  // Read file as base64 (for binary files like images)
  ipcMain.handle('fs:readFileBase64', async (_, path: string) => {
    const buffer = await readFile(path)
    const base64 = buffer.toString('base64')

    // Determine MIME type from extension
    const ext = path.split('.').pop()?.toLowerCase() || ''
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
      ico: 'image/x-icon',
      pdf: 'application/pdf'
    }
    const mimeType = mimeTypes[ext] || 'application/octet-stream'

    return {
      base64,
      mimeType,
      dataUrl: `data:${mimeType};base64,${base64}`
    }
  })

  ipcMain.handle('fs:writeFile', async (_, path: string, content: string) => {
    await writeFile(path, content, 'utf-8')
  })

  ipcMain.handle('fs:readDirectory', async (_, path: string) => {
    const entries = await readdir(path, { withFileTypes: true })
    const results = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = join(path, entry.name)
        const stats = await stat(fullPath).catch(() => null)
        return {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size: stats?.size,
          modifiedAt: stats?.mtime
        }
      })
    )
    return results
  })

  ipcMain.handle('fs:exists', async (_, path: string) => {
    try {
      await access(path)
      return true
    } catch {
      return false
    }
  })

  // Glob - find files matching a pattern
  ipcMain.handle('fs:glob', async (_, pattern: string, cwd?: string) => {
    const basePath = cwd || process.cwd()
    const matches = await fg(pattern, {
      cwd: basePath,
      onlyFiles: false,
      dot: false, // Skip hidden files by default
      absolute: true,
      stats: true,
      suppressErrors: true
    })

    return matches.map((entry) => ({
      name: entry.name,
      path: entry.path,
      isDirectory: entry.stats?.isDirectory() || false,
      size: entry.stats?.size,
      modifiedAt: entry.stats?.mtime
    }))
  })

  // Grep - search file contents for a pattern
  ipcMain.handle('fs:grep', async (_, pattern: string, searchPath: string, options?: { maxResults?: number }) => {
    const maxResults = options?.maxResults || 100
    const results: Array<{
      file: string
      line: number
      content: string
      match: string
    }> = []

    // Get all text files in the path
    const resolvedPath = resolve(searchPath)
    const pathStat = await stat(resolvedPath).catch(() => null)

    if (!pathStat) {
      throw new Error(`Path not found: ${searchPath}`)
    }

    // Build regex from pattern (escape special chars for literal search)
    let regex: RegExp
    try {
      regex = new RegExp(pattern, 'gi')
    } catch {
      // If invalid regex, escape and treat as literal
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      regex = new RegExp(escaped, 'gi')
    }

    // Get files to search
    let filesToSearch: string[] = []
    if (pathStat.isDirectory()) {
      // Find all text files in directory (returns strings when stats is false)
      filesToSearch = await fg(['**/*'], {
        cwd: resolvedPath,
        onlyFiles: true,
        absolute: true,
        dot: false,
        suppressErrors: true,
        ignore: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/*.min.js',
          '**/*.map'
        ]
      })
    } else {
      filesToSearch = [resolvedPath]
    }

    // Search each file
    for (const filePath of filesToSearch) {
      if (results.length >= maxResults) break

      try {
        const content = await readFile(filePath, 'utf-8')
        const lines = content.split('\n')

        for (let i = 0; i < lines.length; i++) {
          if (results.length >= maxResults) break

          const line = lines[i]
          const matches = line.match(regex)
          if (matches) {
            results.push({
              file: filePath,
              line: i + 1,
              content: line.trim().substring(0, 200), // Limit line length
              match: matches[0]
            })
          }
        }
      } catch {
        // Skip files that can't be read (binary, permissions, etc.)
      }
    }

    return results
  })

  // Bash - execute shell commands (with safety checks)
  ipcMain.handle('fs:bash', async (_, command: string, options?: { cwd?: string; timeout?: number }) => {
    // Check for dangerous patterns
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(command)) {
        throw new Error(
          `This command has been blocked for safety. The pattern "${pattern.toString()}" is not allowed. ` +
          'Destructive commands like rm -rf, sudo rm, mkfs, dd, etc. are not permitted.'
        )
      }
    }

    const cwd = options?.cwd || process.cwd()
    const timeout = options?.timeout || 30000 // 30 second default timeout

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        encoding: 'utf-8'
      })

      return {
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: 0
      }
    } catch (error: unknown) {
      const err = error as { code?: string; killed?: boolean; stdout?: string; stderr?: string }
      if (err.killed) {
        throw new Error(`Command timed out after ${timeout / 1000} seconds`)
      }
      // Return stdout/stderr even on error
      return {
        stdout: err.stdout || '',
        stderr: err.stderr || (error instanceof Error ? error.message : 'Command failed'),
        exitCode: err.code || 1
      }
    }
  })

  // Dialog handlers
  ipcMain.handle('dialog:open', async (_, options: Electron.OpenDialogOptions) => {
    return dialog.showOpenDialog(options)
  })

  ipcMain.handle('dialog:save', async (_, options: Electron.SaveDialogOptions) => {
    return dialog.showSaveDialog(options)
  })
}
