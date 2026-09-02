import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const sessions = await prisma.interviewSession.findMany({
    where: { userId: user.id, overallScore: { not: null } },
  });

  const totalSessions = await prisma.interviewSession.count({ where: { userId: user.id } });
  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / sessions.length)
      : 0;

  const best = sessions.reduce<(typeof sessions)[number] | null>((acc, s) => {
    if (!acc || (s.overallScore ?? 0) > (acc.overallScore ?? 0)) return s;
    return acc;
  }, null);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    planExpiresAt: user.planExpiresAt,
    stats: {
      totalSessions,
      avgScore,
      best: best
        ? { score: best.overallScore, company: best.company, topic: best.topic }
        : null,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }

  const { name, oldPassword, newPassword } = body as {
    name?: string;
    oldPassword?: string;
    newPassword?: string;
  };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const data: { name?: string; passwordHash?: string } = {};

  if (typeof name === 'string') {
    data.name = name;
  }

  if (newPassword) {
    if (!oldPassword) {
      return NextResponse.json({ error: 'Введите текущий пароль' }, { status: 400 });
    }
    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Новый пароль должен быть не менее 8 символов' }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json({ id: updated.id, name: updated.name });
}
