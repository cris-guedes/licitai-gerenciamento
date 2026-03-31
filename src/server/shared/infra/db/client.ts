import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);

const prismaClientSingleton = () => {
  const client = new PrismaClient({ 
    adapter,
  });
  return client;
};

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
