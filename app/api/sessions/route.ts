import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkSessionConfigAccess } from '@/lib/checkPlanAccess';
import { checkDailyLimit, incrementDailyUsage } from '@/lib/checkDailyLimit';
import { AI_MODELS } from '@/lib/openai';
import type { Plan } from '@/types';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }

  const { company, topic, level } = body as {
    company?: string;
    topic?: string;
    level?: string;
  };

  if (!company || !topic || !level) {
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const plan = user.plan as Plan;
  // Модель выбирает сервер по тарифу — пользователь её не выбирает и не видит.
  const model = plan === 'PRO' ? AI_MODELS.pro : AI_MODELS.free;

  const access = checkSessionConfigAccess(plan, { company, topic, level, model });
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason, code: 'PLAN_LIMIT' }, { status: 403 });
  }

  const limit = await checkDailyLimit(user.id, plan);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Лимит на сегодня исчерпан', code: 'DAILY_LIMIT' },
      { status: 403 }
    );
  }

  const interviewSession = await prisma.interviewSession.create({
    data: {
      userId: user.id,
      company,
      topic,
      level,
      model,
    },
  });

  await incrementDailyUsage(user.id);

  return NextResponse.json({ sessionId: interviewSession.id });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const take = user.plan === 'PRO' ? undefined : 5;

  const sessions = await prisma.interviewSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return NextResponse.json(sessions);
}
