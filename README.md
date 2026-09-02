# GRIND ML

AI-симулятор технических интервью для ML и Data Science. Next.js 14 (App Router) + PostgreSQL/Prisma + NextAuth v5 + OpenAI (стриминг через Vercel AI SDK).

## Стек

- Next.js 14, TypeScript strict, Tailwind CSS
- PostgreSQL + Prisma ORM
- NextAuth.js v5 (Credentials: email + пароль, JWT-сессии)
- OpenAI SDK (`gpt-4o-mini` по умолчанию, `gpt-4o` для PRO, `gpt-image-1` для описания изображений)
- Vercel AI SDK (`streamText`) для потоковых ответов
- bcryptjs (хеширование паролей, 12 rounds)
- Recharts (график прогресса)

## Быстрый старт

1. Установите зависимости:

   ```bash
   npm install
   ```

2. Скопируйте `.env.example` в `.env.local` и заполните переменные:

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL` — строка подключения к вашей PostgreSQL базе.
   - `NEXTAUTH_SECRET` — случайная строка (например, `openssl rand -base64 32`).
   - `NEXTAUTH_URL` — `http://localhost:3000` для локальной разработки.
   - `OPENAI_API_KEY` — ваш ключ OpenAI API.

3. Примените схему БД:

   ```bash
   npm run db:push
   ```

4. Засейдите тестовые данные (создаст пользователя `test@grindml.ru` / `test12345` на плане PRO с 5 тестовыми сессиями):

   ```bash
   npm run db:seed
   ```

5. Запустите dev-сервер:

   ```bash
   npm run dev
   ```

   Приложение будет доступно на [http://localhost:3000](http://localhost:3000).

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Продакшн-сборка |
| `npm run start` | Запуск продакшн-сборки |
| `npm run lint` | ESLint |
| `npm run db:push` | Применить `prisma/schema.prisma` к БД |
| `npm run db:seed` | Заполнить БД тестовыми данными |

## Структура проекта

```
/app            — страницы и API-роуты (App Router)
/components     — UI-компоненты по доменам (ui, auth, layout, landing, setup, session, history, subscription)
/lib            — серверные хелперы (prisma, auth, openai, промпты, парсинг, проверка плана/лимитов)
/hooks          — клиентские хуки (сессия, стриминг, текущий пользователь)
/types          — общие TypeScript-типы
/prisma         — схема БД и сид-скрипт
```

## План FREE vs PRO

| | FREE | PRO (199 ₽/мес) |
|---|---|---|
| Уровень | Junior | Junior / Middle / Senior |
| Темы | Classical ML, SQL | + Deep Learning, System Design, Stats |
| Компании | Яндекс | + Сбер, VK, Тинькофф, Озон |
| Модель | gpt-4o-mini | gpt-4o-mini / gpt-4o |
| Сессий в день | 2 | Без лимита |
| История | 5 последних | Полная |

Проверка плана всегда выполняется на сервере (`lib/checkPlanAccess.ts`, `lib/checkDailyLimit.ts`) — клиентские заглушки в UI служат только для UX (замочки 🔒 и тултипы).

## Оплата

Раздел `/subscription` — визуальный мок-ап оплаты. Реальные платежи не проводятся: `POST /api/subscription/activate` напрямую переключает план пользователя на PRO на 30 дней. Интеграция со Stripe отсутствует по требованиям задания.

## Важное про gpt-image-1

По ТЗ обработка прикреплённых изображений идёт через модель `gpt-image-1` (`lib/openai.ts`): изображение описывается текстом, который затем добавляется в контекст основного чата. На момент публикации `gpt-image-1` в OpenAI API — генеративная модель изображений; если у вашего ключа нет доступа к vision-запросам через эту модель, замените идентификатор модели в `lib/openai.ts` на актуальную vision-модель (например, `gpt-4o`) без изменения остальной логики.

## Деплой

Стандартный процесс для Next.js (например, Vercel):

1. Создайте PostgreSQL-инстанс (Vercel Postgres, Neon, Supabase и т.д.).
2. Задайте переменные окружения из `.env.example` в настройках проекта.
3. Выполните `npm run db:push` (или подключите как часть build-пайплайна).
4. Задеплойте — `next build` уже настроен как build-команда.
