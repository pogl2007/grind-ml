import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Доступ только для администратора' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      planExpiresAt: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { sessions: true } },
    },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Доступ только для администратора' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }

  const { userId, plan, isAdmin } = body as {
    userId?: string;
    plan?: 'FREE' | 'PRO';
    isAdmin?: boolean;
  };

  if (!userId) {
    return NextResponse.json({ error: 'userId обязателен' }, { status: 400 });
  }

  if (plan && plan !== 'FREE' && plan !== 'PRO') {
    return NextResponse.json({ error: 'Некорректный план' }, { status: 400 });
  }

  if (userId === admin.id && isAdmin === false) {
    return NextResponse.json({ error: 'Нельзя снять админку с самого себя' }, { status: 400 });
  }

  const data: { plan?: 'FREE' | 'PRO'; isAdmin?: boolean } = {};
  if (plan) data.plan = plan;
  if (typeof isAdmin === 'boolean') data.isAdmin = isAdmin;

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, plan: true, isAdmin: true },
  });

  return NextResponse.json(updated);
}
