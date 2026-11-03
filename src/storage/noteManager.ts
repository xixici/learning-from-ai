import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { DailyDigest } from '../types';

export class NoteManager {
  private static readonly STORAGE_KEY = 'lfai_latest_digest';

  public static async saveDigest(
    context: vscode.ExtensionContext,
    digest: DailyDigest
  ): Promise<string | null> {
    // 1. Cache to workspaceState (for latest/today)
    await context.workspaceState.update(this.STORAGE_KEY, digest);

    // 2. Write to Markdown file (.lfai/daily/YYYY-MM-DD.md)
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    const config = vscode.workspace.getConfiguration('lfai');
    const relDir = config.get<string>('notesDir', '.lfai/daily');
    const dailyDir = path.join(workspaceFolders[0].uri.fsPath, relDir);
    const rootDir = path.dirname(dailyDir);
    const historyDir = path.join(rootDir, 'history');

    await fs.mkdir(dailyDir, { recursive: true });
    await fs.mkdir(historyDir, { recursive: true });

    const filePath = path.join(dailyDir, `${digest.date}.md`);
    const mdContent = this.formatDigestToMarkdown(digest);
    await fs.writeFile(filePath, mdContent, 'utf-8');

    // 3. Save structured JSON (.lfai/history/YYYY-MM-DD.json) for lossless historical retrieval
    const jsonPath = path.join(historyDir, `${digest.date}.json`);
    try {
      await fs.writeFile(jsonPath, JSON.stringify(digest, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`LFAI: Failed to write history json for ${digest.date}:`, err);
    }

    return filePath;
  }

  /**
   * Retrieve DailyDigest for any specific date
   */
  public static async getDigestByDate(
    context: vscode.ExtensionContext,
    targetDate: string
  ): Promise<DailyDigest | null> {
    // Check cached latest if date matches
    const cached = this.getCachedDigest(context);
    if (cached && cached.date === targetDate) {
      return cached;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    const config = vscode.workspace.getConfiguration('lfai');
    const relDir = config.get<string>('notesDir', '.lfai/daily');
    const rootDir = path.dirname(path.join(workspaceFolders[0].uri.fsPath, relDir));
    const jsonPath = path.join(rootDir, 'history', `${targetDate}.json`);

    try {
      const raw = await fs.readFile(jsonPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === targetDate) {
        return parsed;
      }
    } catch {
      // File might not exist
    }

    return null;
  }

  /**
   * Get list of all available historical dates with daily digests (newest first)
   */
  public static async getAllAvailableDates(): Promise<string[]> {
    const datesSet = new Set<string>();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return [];
    }

    const config = vscode.workspace.getConfiguration('lfai');
    const relDir = config.get<string>('notesDir', '.lfai/daily');
    const dailyDir = path.join(workspaceFolders[0].uri.fsPath, relDir);
    const rootDir = path.dirname(dailyDir);
    const historyDir = path.join(rootDir, 'history');

    // Check daily markdown files
    try {
      const dailyFiles = await fs.readdir(dailyDir);
      for (const f of dailyFiles) {
        const m = f.match(/^(\d{4}-\d{2}-\d{2})\.md$/);
        if (m) {
          datesSet.add(m[1]);
        }
      }
    } catch {}

    // Check history json files
    try {
      const historyFiles = await fs.readdir(historyDir);
      for (const f of historyFiles) {
        const m = f.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
        if (m) {
          datesSet.add(m[1]);
        }
      }
    } catch {}

    return Array.from(datesSet).sort((a, b) => b.localeCompare(a));
  }

  public static async openNoteByDate(targetDate: string): Promise<boolean> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('LFAI: 请在打开的工作区中执行此操作。');
      return false;
    }

    const config = vscode.workspace.getConfiguration('lfai');
    const relDir = config.get<string>('notesDir', '.lfai/daily');
    const filePath = path.join(workspaceFolders[0].uri.fsPath, relDir, `${targetDate}.md`);

    try {
      await fs.access(filePath);
      const doc = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(doc, { preview: false });
      return true;
    } catch {
      vscode.window.showInformationMessage(`LFAI: 未找到 ${targetDate} 的 Markdown 笔记文件。`);
      return false;
    }
  }

  public static getCachedDigest(context: vscode.ExtensionContext): DailyDigest | undefined {
    return context.workspaceState.get<DailyDigest>(this.STORAGE_KEY);
  }

  public static async openTodayNote(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.openNoteByDate(today);
  }

  public static formatWorkSummaryForClipboard(digest: DailyDigest): string {
    const ws = digest.workSummary;
    if (ws?.dailyReportText && ws.dailyReportText.trim()) {
      return ws.dailyReportText.trim();
    }

    const lines: string[] = [
      `### 📋 工作交付与 Standup (${digest.date})`,
    ];

    if (ws?.title) {
      lines.push(`**重点概述**：${ws.title}`);
    } else {
      lines.push(`**重点概述**：${digest.summary}`);
    }

    lines.push(``);
    lines.push(`**今日核心交付成果**：`);
    if (ws?.deliverables && ws.deliverables.length > 0) {
      ws.deliverables.forEach((item) => {
        lines.push(`- [x] ${item}`);
      });
    } else {
      lines.push(`- [x] ${digest.summary}`);
    }

    if (ws?.changedModules && ws.changedModules.length > 0) {
      lines.push(``);
      lines.push(`**涉及核心模块**：${ws.changedModules.map((m) => `\`${m}\``).join(', ')}`);
    }

    return lines.join('\n');
  }

  private static formatDigestToMarkdown(digest: DailyDigest): string {
    const lines: string[] = [
      `# 🧠 LFAI 每日代码复盘与工作交付 (${digest.date})`,
      ``,
      `> **技术内参提要**：${digest.summary}`,
      `> **提炼卡片数**：${digest.totalCards} 张 | **生成时间**：${new Date().toLocaleTimeString()}`,
      ``,
    ];

    // 1. Work Deliverables Layer (对公可汇报)
    if (digest.workSummary) {
      lines.push(`## 📋 今日工作交付 (Standup / 日报)`);
      lines.push(``);
      lines.push(`**交付亮点**：${digest.workSummary.title}`);
      lines.push(``);
      if (digest.workSummary.dailyReportText) {
        lines.push(`**日报汇报排版**：`);
        lines.push('```text');
        lines.push(digest.workSummary.dailyReportText.trim());
        lines.push('```');
        lines.push(``);
      }
      if (digest.workSummary.deliverables && digest.workSummary.deliverables.length > 0) {
        lines.push(`**完成事项清单**：`);
        digest.workSummary.deliverables.forEach((item) => {
          lines.push(`- [x] ${item}`);
        });
      }
      if (digest.workSummary.changedModules && digest.workSummary.changedModules.length > 0) {
        lines.push(``);
        lines.push(`*涉及模块：${digest.workSummary.changedModules.map((m) => `\`${m}\``).join(', ')}*`);
      }
      lines.push(``);
      lines.push(`---`);
      lines.push(``);
    }

    // 2. Deep Tech Insights Layer (对私技术资产)
    lines.push(`## 🧠 核心技术内参与深度复盘`);
    lines.push(``);

    const categoryIcons: Record<string, string> = {
      syntax: '💡 [语法与特性]',
      architecture: '🏗️ [架构与权衡]',
      gotcha: '⚠️ [踩坑与防御]',
      quiz: '❓ [每日自测问答]',
    };

    digest.cards.forEach((card, index) => {
      const icon = categoryIcons[card.type] || '📌 [知识点]';
      lines.push(`### ${index + 1}. ${icon} ${card.title}`);
      lines.push(``);
      lines.push(`**核心要点**：${card.summary}`);
      lines.push(``);

      if (card.theWhy) {
        lines.push(`> [!NOTE] 💡 机制剖析 (The Why)`);
        lines.push(`> ${card.theWhy}`);
        lines.push(``);
      }

      if (card.destructiveTest) {
        lines.push(`> [!WARNING] ⚠️ 破坏性推演 (如果不加会怎样)`);
        lines.push(`> ${card.destructiveTest}`);
        lines.push(``);
      }

      if (card.codeSnippet) {
        lines.push('```ts');
        lines.push(card.codeSnippet);
        lines.push('```');
        lines.push(``);
      }

      lines.push(`#### 深度底层机制`);
      lines.push(card.explanation);
      lines.push(``);

      if (card.bestPractice) {
        lines.push(`> [!TIP] ✨ 架构最佳实践`);
        lines.push(`> ${card.bestPractice}`);
        lines.push(``);
      }

      if (card.quiz) {
        lines.push(`> [!IMPORTANT] 💡 思考自测题`);
        lines.push(`> **题目**：${card.quiz.question}`);
        if (card.quiz.hint) {
          lines.push(`> *提示：${card.quiz.hint}*`);
        }
        lines.push(``);
        lines.push(`<details>`);
        lines.push(`<summary>👉 点击展开参考答案与解析</summary>`);
        lines.push(``);
        lines.push(`**参考答案**：${card.quiz.answer}`);
        lines.push(``);
        lines.push(`**机制解析**：${card.quiz.explanation}`);
        lines.push(`</details>`);
        lines.push(``);
      }

      if (card.sourceFile) {
        lines.push(`*关联文件：\`${card.sourceFile}\`*`);
      }

      lines.push(``);
      lines.push(`---`);
      lines.push(``);
    });

    lines.push(`*由 [Learning From AI (LFAI)](https://github.com/xixici/learning-from-ai) 自动提炼生成*`);
    return lines.join('\n');
  }
}
