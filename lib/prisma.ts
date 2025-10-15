// ==========================================
// lib/prisma.ts
// Prisma Client Singleton for MagNode
// ==========================================

import { PrismaClient } from '@prisma/client'

declare global {
  // Prevent multiple instances of Prisma Client in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma