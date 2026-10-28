export type CardCategory = 'syntax' | 'architecture' | 'gotcha' | 'quiz';

export interface QuizItem {
  question: string;
  hint?: string;
  answer: string;
  explanation: string;
}

export interface WorkSummary {
  title: string;              // 今日交付与工作亮点 (可直接作为 Standup / 日报 / PR 标题)
  deliverables: string[];     // 今日完成的核心功能与重构项 (3-5 条清单)
  changedModules?: string[];  // 涉及的核心模块/技术领域
}

export interface LearningCard {
  id: string;
  type: CardCategory;
  title: string;
  summary: string;
  codeSnippet?: string;
  explanation: string;
  theWhy?: string;            // 为什么这么设计 / 冰山之下的机制
  destructiveTest?: string;   // 破坏性推演：如果删掉这行代码在何种极端情况下会暴雷
  bestPractice?: string;      // 现代最佳实践建议或架构权衡
  quiz?: QuizItem;
  sourceFile?: string;
  timestamp: number;
}

export interface DailyDigest {
  date: string;
  summary: string;
  workSummary?: WorkSummary;   // 工作交付层 (对公/日报/PR)
  totalCards: number;
  cards: LearningCard[];       // 认知深度层 (对私/技术卡片)
  rawSourceCount?: number;
}

export type ExtractionSourceType = 'git_diff' | 'selection' | 'manual' | 'inbox' | 'clipboard';

export interface ExtractionRequest {
  sourceType: ExtractionSourceType;
  codeContext: string;
  fileHints?: string[];
}

export interface InboxItem {
  id: string;
  timestamp: number;
  preview: string;
  content: string;
  source: 'clipboard' | 'manual';
  detectedType: 'chat' | 'code' | 'snippet';
}
