import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { DailyDigest, LearningCard, PeriodicReport } from '../types';
import { NoteManager } from './noteManager';

export interface PeriodDateRange {
  id: string; // e.g. "2026-W45" or "2026-11"
  label: string; // e.g. "2026年第45周 (11/02 ~ 11/08)" or "2026年11月"
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  dates: string[]; // List of all dates in period
}

export class ReportManager {
  /**
   * Calculate current or specified week info (Monday to Sunday)
   */
  public static getWeekRange(refDate: Date = new Date()): PeriodDateRange {
    const d = new Date(refDate);
    // Align to Monday as start of week (0 is Sunday in JS, so convert to 7)
    const day = d.getDay() || 7;
    // Monday
    const monday = new Date(d);
    monday.setDate(d.getDate() - day + 1);
    // Sunday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Calculate ISO Week Number
    const target = new Date(monday.valueOf());
    const dayNr = (monday.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    const weekStr = String(weekNumber).padStart(2, '0');
    const year = monday.getFullYear();
    const id = `${year}-W${weekStr}`;

    const dates: string[] = [];
    const cur = new Date(monday);
    while (cur <= sunday) {
      dates.push(this.formatDate(cur));
      cur.setDate(cur.getDate() + 1);
    }

    const startStr = this.formatDate(monday);
    const endStr = this.formatDate(sunday);
    const label = `${year}年第${weekNumber}周 (${startStr.slice(5)} ~ ${endStr.slice(5)})`;

    return { id, label, startDate: startStr, endDate: endStr, dates };
  }

  /**
   * Calculate current or specified month info
   */
  public static getMonthRange(refDate: Date = new Date()): PeriodDateRange {
    const year = refDate.getFullYear();
    const month = refDate.getMonth(); // 0-based
    const monthStr = String(month + 1).padStart(2, '0');
    const id = `${year}-${monthStr}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dates: string[] = [];
    const cur = new Date(firstDay);
    while (cur <= lastDay) {
      dates.push(this.formatDate(cur));
      cur.setDate(cur.getDate() + 1);
    }

    const startStr = this.formatDate(firstDay);
    const endStr = this.formatDate(lastDay);
    const label = `${year}年${month + 1}月 (${startStr} ~ ${endStr})`;

    return { id, label, startDate: startStr, endDate: endStr, dates };
  }

  private static formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Generate weekly report aggregating all daily digests in the week
   */
  public static async generateWeeklyReport(
    context: vscode.ExtensionContext,
    targetDate: Date = new Date()
  ): Promise<PeriodicReport> {
    const range = this.getWeekRange(targetDate);
    return this.aggregateDigests(context, 'weekly', range);
  }

  /**
   * Generate monthly report aggregating all daily digests in the month
   */
  public static async generateMonthlyReport(
    context: vscode.ExtensionContext,
    targetDate: Date = new Date()
  ): Promise<PeriodicReport> {
    const range = this.getMonthRange(targetDate);
    return this.aggregateDigests(context, 'monthly', range);
  }

  /**
   * Core aggregation engine: combines multiple DailyDigests into structured periodic report
   */
  private static async aggregateDigests(
    context: vscode.ExtensionContext,
    type: 'weekly' | 'monthly',
    range: PeriodDateRange
  ): Promise<PeriodicReport> {
    const digests: DailyDigest[] = [];
    const includedDates: string[] = [];

    for (const d of range.dates) {
      const digest = await NoteManager.getDigestByDate(context, d);
      if (digest) {
        digests.push(digest);
        includedDates.push(d);
      }
    }

    const typeName = type === 'weekly' ? '周报' : '月报';
    const title = `LFAI ${typeName}总结 (${range.label})`;

    if (digests.length === 0) {
      // Empty state report
      return {
        type,
        periodId: range.id,
        startDate: range.startDate,
        endDate: range.endDate,
        title,
        overview: `本周期 (${range.startDate} ~ ${range.endDate}) 暂未记录每日工作复盘与技术卡片。`,
        dailyReportText: `客户工作：\n（暂无记录）\n\n技术工作：\n（暂无记录）`,
        keyDeliverables: [],
        topCards: [],
        includedDates: [],
      };
    }

    // 1. Aggregate deliverables
    const allDeliverables: string[] = [];
    digests.forEach((d) => {
      const items = d.workSummary?.deliverables || [];
      items.forEach((it) => {
        if (!allDeliverables.includes(it)) {
          allDeliverables.push(it);
        }
      });
    });

    // 2. Parse and merge structured dailyReportText (Client Work & Tech Work)
    const { clientMap, techMap } = this.parseAndMergeReports(digests);
    const structuredReportText = this.formatMergedReportText(clientMap, techMap);

    // 3. Aggregate learning cards (prioritize gotcha and architecture, deduplicate by title)
    const cardMap = new Map<string, LearningCard>();
    digests.forEach((d) => {
      d.cards.forEach((c) => {
        if (!cardMap.has(c.title)) {
          cardMap.set(c.title, c);
        }
      });
    });

    // Sort cards: gotcha first, architecture next, then syntax
    const typeWeight: Record<string, number> = { gotcha: 1, architecture: 2, quiz: 3, syntax: 4 };
    const sortedCards = Array.from(cardMap.values()).sort(
      (a, b) => (typeWeight[a.type] || 5) - (typeWeight[b.type] || 5)
    );

    const totalDays = includedDates.length;
    const totalCardsCount = sortedCards.length;
    const overview = `本${type === 'weekly' ? '周' : '月'}共沉淀 ${totalDays} 个有效工作日复盘，完成 ${allDeliverables.length} 项核心交付，提炼 ${totalCardsCount} 张高维认知技术闪卡。`;

    const report: PeriodicReport = {
      type,
      periodId: range.id,
      startDate: range.startDate,
      endDate: range.endDate,
      title,
      overview,
      dailyReportText: structuredReportText,
      keyDeliverables: allDeliverables,
      topCards: sortedCards.slice(0, 10), // Top 10 cards
      includedDates,
    };

    // Save Markdown file
    await this.saveReportToMarkdown(report);

    return report;
  }

  /**
   * Parse dailyReportText from each digest and merge items under each project/client
   */
  private static parseAndMergeReports(digests: DailyDigest[]): {
    clientMap: Map<string, Set<string>>;
    techMap: Map<string, Set<string>>;
  } {
    const clientMap = new Map<string, Set<string>>();
    const techMap = new Map<string, Set<string>>();

    for (const d of digests) {
      const rawText = d.workSummary?.dailyReportText;
      if (!rawText) {
        // Fallback to deliverables under a generic project
        const items = d.workSummary?.deliverables || [];
        if (items.length > 0) {
          const target = techMap.get('核心功能与系统研发') || new Set<string>();
          items.forEach((it) => target.add(it));
          techMap.set('核心功能与系统研发', target);
        }
        continue;
      }

      this.parseSingleReportText(rawText, clientMap, techMap);
    }

    return { clientMap, techMap };
  }

  private static parseSingleReportText(
    text: string,
    clientMap: Map<string, Set<string>>,
    techMap: Map<string, Set<string>>
  ): void {
    const lines = text.split(/\r?\n/).map((l) => l.trimEnd());
    let currentSection: 'client' | 'tech' | null = null;
    let currentProject: string | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }

      if (line.includes('客户工作')) {
        currentSection = 'client';
        currentProject = null;
        continue;
      }
      if (line.includes('技术工作')) {
        currentSection = 'tech';
        currentProject = null;
        continue;
      }

      if (!currentSection) {
        continue;
      }

      const map = currentSection === 'client' ? clientMap : techMap;

      // Check if this line is a numbered project/client header (e.g. "1. 某车企客户" or "2. 智能体平台")
      const headerMatch = line.match(/^(\d+[\.、\s]+)(.+)$/);
      // Or if it starts at column 0 without indentation in rawLine
      const isIndented = rawLine.startsWith('   ') || rawLine.startsWith('\t') || rawLine.startsWith('  ');

      if (headerMatch && !isIndented) {
        currentProject = headerMatch[2].trim();
        if (!map.has(currentProject)) {
          map.set(currentProject, new Set<string>());
        }
      } else if (!isIndented && !currentProject) {
        currentProject = line;
        if (!map.has(currentProject)) {
          map.set(currentProject, new Set<string>());
        }
      } else {
        // It's a task item under currentProject
        const taskText = line.replace(/^[-*•\s]+/, '').trim();
        if (taskText) {
          const proj = currentProject || '重点项目研发';
          if (!map.has(proj)) {
            map.set(proj, new Set<string>());
          }
          map.get(proj)!.add(taskText);
        }
      }
    }
  }

  /**
   * Format merged client and tech maps into hierarchical 1,2,3,4 plaintext layout
   */
  public static formatMergedReportText(
    clientMap: Map<string, Set<string>>,
    techMap: Map<string, Set<string>>
  ): string {
    const lines: string[] = ['客户工作：'];

    if (clientMap.size === 0) {
      lines.push('（暂无外部客户工作）');
    } else {
      let idx = 1;
      clientMap.forEach((tasks, proj) => {
        lines.push(`${idx}. ${proj}`);
        if (tasks.size === 0) {
          lines.push(`   项目跟进`);
        } else {
          tasks.forEach((t) => lines.push(`   ${t}`));
        }
        idx++;
      });
    }

    lines.push('');
    lines.push('技术工作：');

    if (techMap.size === 0) {
      lines.push('（暂无技术研发工作）');
    } else {
      let idx = 1;
      techMap.forEach((tasks, proj) => {
        lines.push(`${idx}. ${proj}`);
        if (tasks.size === 0) {
          lines.push(`   架构设计与研发推进`);
        } else {
          tasks.forEach((t) => lines.push(`   ${t}`));
        }
        idx++;
      });
    }

    return lines.join('\n');
  }

  /**
   * Format periodic report into clean plaintext suitable for copying to chat / email
   */
  public static formatReportForClipboard(report: PeriodicReport): string {
    const lines: string[] = [
      `### 📊 ${report.title}`,
      `> **周期概述**：${report.overview}`,
      ``,
      `---`,
      report.dailyReportText,
      ``,
    ];

    if (report.keyDeliverables.length > 0) {
      lines.push(`---`);
      lines.push(`🎯 关键里程碑清单：`);
      report.keyDeliverables.forEach((item) => {
        lines.push(`- [x] ${item}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Save report as Markdown file in .lfai/weekly/ or .lfai/monthly/
   */
  public static async saveReportToMarkdown(report: PeriodicReport): Promise<string | null> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return null;
    }

    const config = vscode.workspace.getConfiguration('lfai');
    const relDir = config.get<string>('notesDir', '.lfai/daily');
    const rootDir = path.dirname(path.join(folders[0].uri.fsPath, relDir));
    const targetDir = path.join(rootDir, report.type); // .lfai/weekly or .lfai/monthly

    await fs.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, `${report.periodId}.md`);
    const mdContent = this.formatReportToMarkdown(report);

    await fs.writeFile(filePath, mdContent, 'utf-8');
    return filePath;
  }

  public static formatReportToMarkdown(report: PeriodicReport): string {
    const typeLabel = report.type === 'weekly' ? '周报' : '月报';
    const lines: string[] = [
      `# 📊 ${report.title}`,
      ``,
      `> **周期区间**：${report.startDate} ~ ${report.endDate}`,
      `> **包含工作日**：${report.includedDates.length > 0 ? report.includedDates.join(', ') : '无'}`,
      `> **周期概述**：${report.overview}`,
      ``,
      `---`,
      ``,
      `## 📋 结构化工作交付汇报 (${typeLabel} Ready)`,
      ``,
      '```text',
      report.dailyReportText,
      '```',
      ``,
    ];

    if (report.keyDeliverables.length > 0) {
      lines.push(`## 🎯 关键交付里程碑`);
      lines.push(``);
      report.keyDeliverables.forEach((item) => {
        lines.push(`- [x] ${item}`);
      });
      lines.push(``);
    }

    if (report.topCards.length > 0) {
      lines.push(`## 🧠 周期技术内参与高价值考点 Top ${report.topCards.length}`);
      lines.push(``);
      report.topCards.forEach((c, i) => {
        lines.push(`### ${i + 1}. [${c.type.toUpperCase()}] ${c.title}`);
        lines.push(`**要点**：${c.summary}`);
        lines.push(``);
        if (c.theWhy) {
          lines.push(`> 💡 **机制剖析**：${c.theWhy}`);
          lines.push(``);
        }
        if (c.destructiveTest) {
          lines.push(`> ⚠️ **破坏性推演**：${c.destructiveTest}`);
          lines.push(``);
        }
      });
    }

    return lines.join('\n');
  }

  /**
   * Open the report markdown file in VS Code editor
   */
  public static async openReportDoc(report: PeriodicReport): Promise<boolean> {
    const filePath = await this.saveReportToMarkdown(report);
    if (!filePath) {
      return false;
    }
    try {
      const doc = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(doc, { preview: false });
      return true;
    } catch {
      return false;
    }
  }
}
