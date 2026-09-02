import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: params.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 });
  }

  return NextResponse.json(interviewSession);
}
