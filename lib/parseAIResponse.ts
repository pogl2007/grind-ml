import type { FinalReport, Scores } from '@/types';

const SCORES_REGEX = /SCORES:\s*(\{[^}]*\})/;
const FINAL_REPORT_REGEX = /FINAL_REPORT:\s*(\{[\s\S]*\})\s*$/;

export interface ParsedAIResponse {
  cleanText: string;
  scores: Scores | null;
  finalReport: FinalReport | null;
}

export function parseAIResponse(raw: string): ParsedAIResponse {
  let text = raw;
  let scores: Scores | null = null;
  let finalReport: FinalReport | null = null;

  const finalMatch = text.match(FINAL_REPORT_REGEX);
  if (finalMatch) {
    try {
      finalReport = JSON.parse(finalMatch[1]) as FinalReport;
    } catch {
      finalReport = null;
    }
    text = text.slice(0, finalMatch.index).trim();
  }

  const scoresMatch = text.match(SCORES_REGEX);
  if (scoresMatch) {
    try {
      scores = JSON.parse(scoresMatch[1]) as Scores;
    } catch {
      scores = null;
    }
    text = text.replace(SCORES_REGEX, '').trim();
  }

  return { cleanText: text, scores, finalReport };
}
