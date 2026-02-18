import path from "path"

const dbUrl = process.env.DATABASE_URL
if (dbUrl && dbUrl.startsWith("file:")) {
  const filePath = dbUrl.replace(/^file:/, "")
  if (!path.isAbsolute(filePath)) {
    process.env.DATABASE_URL = "file:" + path.resolve(process.cwd(), filePath)
  }
}

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
