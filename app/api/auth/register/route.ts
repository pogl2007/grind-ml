import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }

  const { email, password, name } = body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Некорректный email', field: 'email' }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: 'Пароль должен быть не менее 8 символов', field: 'password' },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'Пользователь с таким email уже существует', field: 'email' },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name || null,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
