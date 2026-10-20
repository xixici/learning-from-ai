export type CardCategory = 'syntax' | 'architecture' | 'gotcha' | 'quiz';

export interface QuizItem {
  question: string;
  hint?: string;
  answer: string;
  explanation: string;
}

export interface LearningCard {
  id: string;
  type: CardCategory;
  title: string;
  summary: string;
  codeSnippet?: string;
  explanation: string;
  quiz?: QuizItem;
  sourceFile?: string;
  timestamp: number;
}

export interface DailyDigest {
  date: string;
  summary: string;
  totalCards: number;
  cards: LearningCard[];
  rawSourceCount?: number;
}

export interface ExtractionRequest {
  sourceType: 'git_diff' | 'selection' | 'manual';
  codeContext: string;
  fileHints?: string[];
}
