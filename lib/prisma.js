// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Esta é uma boa prática para evitar criar múltiplas instâncias do PrismaClient
// durante o desenvolvimento devido ao hot-reloading do Next.js.
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;