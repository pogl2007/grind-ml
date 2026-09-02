import { prisma } from '@/lib/prisma';
import type { Plan } from '@/types';
import { FREE_LIMITS } from '@/types';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkDailyLimit(
  userId: string,
  plan: Plan
): Promise<{ allowed: boolean; used: number; limit: number | null }> {
  if (plan === 'PRO') {
    return { allowed: true, used: 0, limit: null };
  }

  const date = todayString();
  const usage = await prisma.dailyUsage.findUnique({
    where: { userId_date: { userId, date } },
  });

  const used = usage?.sessions ?? 0;
  return {
    allowed: used < FREE_LIMITS.maxSessionsPerDay,
    used,
    limit: FREE_LIMITS.maxSessionsPerDay,
  };
}

export async function incrementDailyUsage(userId: string): Promise<void> {
  const date = todayString();
  await prisma.dailyUsage.upsert({
    where: { userId_date: { userId, date } },
    update: { sessions: { increment: 1 } },
    create: { userId, date, sessions: 1 },
  });
}
