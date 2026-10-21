import * as fs from 'fs';
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

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, `${digest.date}.md`);
    const mdContent = this.formatDigestToMarkdown(digest);

    fs.writeFileSync(filePath, mdContent, 'utf-8');
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

    if (!fs.existsSync(filePath)) {
      vscode.window.showInformationMessage(
        `LFAI: 今日笔记尚未生成，请先点击「提炼今日代码与 AI 考点」。`
      );
      return;
    }

    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc, { preview: false });
  }

  private static formatDigestToMarkdown(digest: DailyDigest): string {
    const lines: string[] = [
      `# 🧠 LFAI 每日代码学习复盘 (${digest.date})`,
      ``,
      `> **当日总结**：${digest.summary}`,
      `> **提炼卡片数**：${digest.totalCards} 张 | **生成时间**：${new Date().toLocaleTimeString()}`,
      ``,
      `---`,
      ``,
    ];

    const categoryIcons: Record<string, string> = {
      syntax: '💡 [语法与特性]',
      architecture: '🏗️ [架构与权衡]',
      gotcha: '⚠️ [踩坑与防御]',
      quiz: '❓ [每日自测问答]',
    };

    digest.cards.forEach((card, index) => {
      const icon = categoryIcons[card.type] || '📌 [知识点]';
      lines.push(`## ${index + 1}. ${icon} ${card.title}`);
      lines.push(``);
      lines.push(`**核心要点**：${card.summary}`);
      lines.push(``);

      if (card.codeSnippet) {
        lines.push('```ts');
        lines.push(card.codeSnippet);
        lines.push('```');
        lines.push(``);
      }

      lines.push(`### 深度剖析与最佳实践`);
      lines.push(card.explanation);
      lines.push(``);

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

    lines.push(`*由 [Learning From AI (LFAI)](https://github.com/lfai/learning-from-ai) 自动提炼生成*`);
    return lines.join('\n');
  }
}
