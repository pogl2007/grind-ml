import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SAMPLE_SESSIONS = [
  {
    company: 'Яндекс',
    topic: 'classical_ml',
    level: 'junior',
    model: 'openai/gpt-5.6-luna',
    status: 'COMPLETED' as const,
    verdict: 'hire',
    overallScore: 88,
    summary: 'Уверенно ответил на вопросы про регуляризацию и переобучение.',
    strongSides: ['Понимание bias-variance tradeoff', 'Хорошее знание метрик', 'Чёткие объяснения'],
    weakSides: ['Слабое знание ансамблевых методов'],
    studyTopics: [
      { topic: 'Gradient Boosting', url: 'https://scikit-learn.org/stable/modules/ensemble.html' },
      { topic: 'Регуляризация L1/L2', url: 'https://en.wikipedia.org/wiki/Regularization_(mathematics)' },
    ],
    daysAgo: 1,
  },
  {
    company: 'Сбер',
    topic: 'deep_learning',
    level: 'middle',
    model: 'openai/gpt-5.6-luna-pro',
    status: 'COMPLETED' as const,
    verdict: 'reservations',
    overallScore: 71,
    summary: 'Хорошая теоретическая база, но не хватает продакшн опыта с деплоем моделей.',
    strongSides: ['Знание архитектур CNN', 'Понимание backpropagation'],
    weakSides: ['Нет опыта с ONNX/TorchServe', 'Слабое понимание масштабирования инференса'],
    studyTopics: [
      { topic: 'Model Serving', url: 'https://pytorch.org/serve/' },
      { topic: 'ONNX Runtime', url: 'https://onnxruntime.ai/' },
    ],
    daysAgo: 4,
  },
  {
    company: 'VK',
    topic: 'system_design',
    level: 'senior',
    model: 'openai/gpt-5.6-luna-pro',
    status: 'COMPLETED' as const,
    verdict: 'hire',
    overallScore: 92,
    summary: 'Отличное понимание highload систем и latency оптимизаций для рекомендательных систем.',
    strongSides: ['Глубокое знание latency budgets', 'Опыт с ANN-индексами', 'Системное мышление'],
    weakSides: ['Можно глубже раскрыть шардирование'],
    studyTopics: [{ topic: 'Vector Search at Scale', url: 'https://github.com/facebookresearch/faiss/wiki' }],
    daysAgo: 7,
  },
  {
    company: 'Тинькофф',
    topic: 'stats',
    level: 'middle',
    model: 'openai/gpt-5.6-luna',
    status: 'COMPLETED' as const,
    verdict: 'not_yet',
    overallScore: 54,
    summary: 'Базовое понимание статистики есть, но метрики бизнеса объяснял неуверенно.',
    strongSides: ['Знание базовых распределений'],
    weakSides: ['Слабое понимание ROI-метрик', 'Путается в доверительных интервалах', 'Нет связи с бизнес-задачами'],
    studyTopics: [
      { topic: 'Доверительные интервалы', url: 'https://en.wikipedia.org/wiki/Confidence_interval' },
      { topic: 'Business Metrics for ML', url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/' },
    ],
    daysAgo: 10,
  },
  {
    company: 'Озон',
    topic: 'sql',
    level: 'junior',
    model: 'openai/gpt-5.6-luna',
    status: 'COMPLETED' as const,
    verdict: 'hire',
    overallScore: 81,
    summary: 'Уверенное владение SQL и понимание A/B тестирования на базовом уровне.',
    strongSides: ['Чистые JOIN-запросы', 'Понимание оконных функций'],
    weakSides: ['Нужно подтянуть проверку гипотез'],
    studyTopics: [{ topic: 'A/B Testing Statistics', url: 'https://exp-platform.com/' }],
    daysAgo: 13,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('test12345', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@grindml.ru' },
    update: {},
    create: {
      email: 'test@grindml.ru',
      passwordHash,
      name: 'Тестовый пользователь',
      plan: 'PRO',
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  for (const s of SAMPLE_SESSIONS) {
    const createdAt = new Date(Date.now() - s.daysAgo * 24 * 60 * 60 * 1000);
    const completedAt = new Date(createdAt.getTime() + 18 * 60 * 1000);

    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        company: s.company,
        topic: s.topic,
        level: s.level,
        model: s.model,
        status: s.status,
        verdict: s.verdict,
        overallScore: s.overallScore,
        summary: s.summary,
        strongSides: s.strongSides,
        weakSides: s.weakSides,
        studyTopics: s.studyTopics,
        createdAt,
        completedAt,
      },
    });

    await prisma.message.create({
      data: {
        sessionId: interviewSession.id,
        role: 'assistant',
        content: `Привет! Сегодня поговорим про ${s.topic}. Расскажи, как ты понимаешь ключевые концепции этой темы?`,
        scores: { accuracy: s.overallScore, depth: s.overallScore - 5, clarity: s.overallScore + 3, confidence: s.overallScore - 2 },
        createdAt,
      },
    });
  }

  console.log('Сид завершён. Тестовый пользователь: test@grindml.ru / test12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
