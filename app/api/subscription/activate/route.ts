import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';

// ВАЖНО: это тестовый режим оплаты (см. PaymentModal — реальные платежи не
// проводятся, номер карты никуда не отправляется). Эндпоинт не проверяет
// реальную оплату, поэтому любой залогиненный может активировать PRO напрямую.
// Прежде чем подключать настоящие деньги, сюда нужно добавить верификацию
// платежа от платёжного провайдера.
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  if (!checkRateLimit(`subscribe:${session.user.id}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много попыток, попробуйте позже' }, { status: 429 });
  }

  const planExpiresAt = new Date();
  planExpiresAt.setDate(planExpiresAt.getDate() + 30);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { plan: 'PRO', planExpiresAt },
  });

  return NextResponse.json({ plan: user.plan, planExpiresAt: user.planExpiresAt });
}
