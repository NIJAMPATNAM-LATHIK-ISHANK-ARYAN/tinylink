// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow global var in dev to avoid hot-reload creating new clients
  // eslint-disable-next-line
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV === "development") global.prisma = prisma;
