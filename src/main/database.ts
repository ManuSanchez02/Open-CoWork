import { app } from 'electron'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { existsSync, copyFileSync } from 'fs'

let prisma: PrismaClient | null = null

export async function initDatabase(): Promise<PrismaClient> {
  if (prisma) return prisma

  // In development, use the local dev.db
  // In production, use the user data directory
  const isDev = !app.isPackaged
  let dbPath: string

  if (isDev) {
    // Use the project's dev.db for development
    dbPath = join(process.cwd(), 'prisma', 'dev.db')
  } else {
    // Use user data directory for production
    dbPath = join(app.getPath('userData'), 'open-cowork.db')

    // Copy the template database if it doesn't exist
    const templateDbPath = join(process.resourcesPath, 'prisma', 'dev.db')
    if (!existsSync(dbPath) && existsSync(templateDbPath)) {
      copyFileSync(templateDbPath, dbPath)
    }
  }

  // Create Prisma client
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  })

  // Connect to database
  await prisma.$connect()

  // Ensure default settings exist
  try {
    await prisma.settings.upsert({
      where: { id: 'default' },
      update: {},
      create: {
        id: 'default',
        theme: 'system',
        defaultModel: 'google/gemini-3-flash-preview',
        onboardingComplete: false
      }
    })
  } catch (error) {
    console.error('Failed to initialize settings:', error)
  }

  return prisma
}

export function getDatabase(): PrismaClient {
  if (!prisma) {
    throw new Error('Database not initialized. Call initDatabase first.')
  }
  return prisma
}

export async function closeDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}
