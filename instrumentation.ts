export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Node 24+ по умолчанию завершает процесс на unhandledRejection/uncaughtException —
  // один неотловленный сбой (например, в БД-записи внутри стрима) роняет весь dev-сервер
  // и рвёт соединение у всех, кто в этот момент в интервью. Логируем вместо падения.
  process.on('unhandledRejection', (reason) => {
    console.error('[process] unhandledRejection (процесс НЕ упадёт):', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[process] uncaughtException (процесс НЕ упадёт):', err);
  });
}
