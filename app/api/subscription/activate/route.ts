import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const planExpiresAt = new Date();
  planExpiresAt.setDate(planExpiresAt.getDate() + 30);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { plan: 'PRO', planExpiresAt },
  });

  return NextResponse.json({ plan: user.plan, planExpiresAt: user.planExpiresAt });
}
