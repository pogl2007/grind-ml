import type { Company, Level, Plan, Topic } from '@/types';
import { FREE_LIMITS } from '@/types';
import { AI_MODELS } from '@/lib/openai';

export function canAccessCompany(plan: Plan, company: string): boolean {
  if (plan === 'PRO') return true;
  return FREE_LIMITS.companies.includes(company as Company);
}

export function canAccessTopic(plan: Plan, topic: string): boolean {
  if (plan === 'PRO') return true;
  return FREE_LIMITS.topics.includes(topic as Topic);
}

export function canAccessLevel(plan: Plan, level: string): boolean {
  if (plan === 'PRO') return true;
  return FREE_LIMITS.levels.includes(level as Level);
}

export function canAccessModel(plan: Plan, model: string): boolean {
  if (model === AI_MODELS.pro) return plan === 'PRO';
  return true;
}

export function checkSessionConfigAccess(
  plan: Plan,
  config: { company: string; topic: string; level: string; model: string }
): { allowed: boolean; reason?: string } {
  if (!canAccessCompany(plan, config.company)) {
    return { allowed: false, reason: 'Эта компания доступна в PRO' };
  }
  if (!canAccessTopic(plan, config.topic)) {
    return { allowed: false, reason: 'Эта тема доступна в PRO' };
  }
  if (!canAccessLevel(plan, config.level)) {
    return { allowed: false, reason: 'Этот уровень доступен в PRO' };
  }
  if (!canAccessModel(plan, config.model)) {
    return { allowed: false, reason: 'Улучшенная модель ИИ доступна в PRO' };
  }
  return { allowed: true };
}
