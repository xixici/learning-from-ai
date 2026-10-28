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
    // 1. Cache to workspaceState
    await context.workspaceState.update(this.STORAGE_KEY, digest);

    // 2. Write to Markdown file
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    const config = vscode.workspace.getConfiguration('lfai');
    const relDir = config.get<string>('notesDir', '.lfai/daily');
    const targetDir = path.join(workspaceFolders[0].uri.fsPath, relDir);

    await fs.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, `${digest.date}.md`);
    const mdContent = this.formatDigestToMarkdown(digest);

    await fs.writeFile(filePath, mdContent, 'utf-8');
    return filePath;
  }

  public static getCachedDigest(context: vscode.ExtensionContext): DailyDigest | undefined {
    return context.workspaceState.get<DailyDigest>(this.STORAGE_KEY);
  }

  public static async openTodayNote(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('LFAI: 请在打开的工作区中执行此操作。');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const config = vscode.workspace.getConfiguration('lfai');
    const relDir = config.get<string>('notesDir', '.lfai/daily');
    const filePath = path.join(workspaceFolders[0].uri.fsPath, relDir, `${today}.md`);

    try {
      await fs.access(filePath);
    } catch {
      vscode.window.showInformationMessage(
        `LFAI: 今日笔记尚未生成，请先点击「提炼今日代码与 AI 考点」。`
      );
      return;
    }

    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc, { preview: false });
  }

  public static formatWorkSummaryForClipboard(digest: DailyDigest): string {
    const ws = digest.workSummary;
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
      lines.push(`## 📋 今日工作交付 (Standup / PR Ready)`);
      lines.push(``);
      lines.push(`**交付亮点**：${digest.workSummary.title}`);
      lines.push(``);
      lines.push(`**完成事项清单**：`);
      digest.workSummary.deliverables.forEach((item) => {
        lines.push(`- [x] ${item}`);
      });
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
