import * as vscode from 'vscode';
import { collectTodayGitDiff } from './collector/gitCollector';
import { collectActiveSelection } from './collector/selectionCollector';
import { LLMClient } from './engine/llmClient';
import { NoteManager } from './storage/noteManager';
import { LFAISidebarProvider } from './ui/sidebarProvider';
import { ClipboardWatcher } from './collector/clipboardWatcher';
import { InboxManager } from './storage/inboxManager';
import type { DailyDigest } from './types';
let isExtracting = false;

export function activate(context: vscode.ExtensionContext) {
  // 1. Register Sidebar Webview Provider
  const sidebarProvider = new LFAISidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      LFAISidebarProvider.viewType,
      sidebarProvider
    )
  );

  // 2. Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'lfai.extractTodayLearnings';
  statusBarItem.text = '$(brain) LFAI: 今日知识';
  statusBarItem.tooltip = '点击提炼今日代码与 AI 考点卡片';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const updateStatusBar = async () => {
    const cached = NoteManager.getCachedDigest(context);
    const inboxItems = await InboxManager.getItems(context);
    const cardPart = cached ? `${cached.totalCards}张卡片` : '今日知识';
    const inboxPart = inboxItems.length > 0 ? ` (📥 ${inboxItems.length}条暂存)` : '';
    statusBarItem.text = `$(brain) LFAI: ${cardPart}${inboxPart}`;
  };
  updateStatusBar();

  // Start background clipboard watcher (Ditto-style)
  const clipboardWatcher = ClipboardWatcher.getInstance(context);
  context.subscriptions.push(clipboardWatcher);

  // Listen to inbox updates to keep status bar synchronized
  context.subscriptions.push(
    InboxManager.onDidUpdateInbox(() => {
      updateStatusBar();
    })
  );
  // 3. Command: Extract Today's Learnings
  const extractTodayCommand = vscode.commands.registerCommand(
    'lfai.extractTodayLearnings',
    async () => {
      if (isExtracting) { return; }
      isExtracting = true;
      try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'LFAI: 正在分析今日代码与 AI 交互，提炼核心考点...',
          cancellable: true,
        },
        async (progress, token) => {
          progress.report({ increment: 20, message: '正在提取 Git 增量与工作区变更...' });

          let extractionRequest = await collectTodayGitDiff();

          if (!extractionRequest || !extractionRequest.codeContext.trim()) {
            const answer = await vscode.window.showInformationMessage(
              'LFAI: 今日暂未检测到明显的 Git 提交或文件修改。是否生成智能示范复盘卡片？',
              '生成示范卡片',
              '取消'
            );

            if (answer !== '生成示范卡片') {
              return;
            }

            extractionRequest = {
              sourceType: 'manual',
              codeContext: '// Demo workspace code',
              fileHints: ['src/core/engine.ts'],
            };
          }

          progress.report({ increment: 40, message: '正在调用认知分析引擎提炼知识卡片...' });

          let digest: DailyDigest;
          try {
            digest = await LLMClient.extractLearnings(
              extractionRequest.codeContext,
              extractionRequest.fileHints,
              token
            );
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`LFAI 提炼失败: ${msg}`);
            return;
          }

          progress.report({ increment: 30, message: '正在生成结构化笔记与闪卡...' });

          const savedPath = await NoteManager.saveDigest(context, digest);
          sidebarProvider.updateDigest(digest);

          statusBarItem.text = `$(brain) LFAI: ${digest.totalCards}张卡片`;

          progress.report({ increment: 10, message: '提炼完成！' });

          const action = await vscode.window.showInformationMessage(
            `🎉 LFAI: 今日成功提炼 ${digest.totalCards} 张高维学习卡片！`,
            '📋 复制日报/Standup',
            '查看 Markdown 笔记',
            '在侧边栏复习'
          );

          if (action === '📋 复制日报/Standup') {
            await vscode.commands.executeCommand('lfai.copyDailyStandup');
          } else if (action === '查看 Markdown 笔记' && savedPath) {
            const doc = await vscode.workspace.openTextDocument(savedPath);
            await vscode.window.showTextDocument(doc, { preview: false });
          } else if (action === '在侧边栏复习') {
            await vscode.commands.executeCommand('lfai.sidebarView.focus');
          }
        }
      );
      } finally {
        isExtracting = false;
      }
    }
  );
  context.subscriptions.push(extractTodayCommand);

  // 4. Command: Extract from Selected Code
  const extractSelectionCommand = vscode.commands.registerCommand(
    'lfai.extractSelection',
    async () => {
      if (isExtracting) { return; }
      isExtracting = true;
      try {
      const req = collectActiveSelection();
      if (!req) {
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'LFAI: 正在提炼选中代码考点与底层原理...',
          cancellable: true,
        },
        async (progress, token) => {
          progress.report({ increment: 40, message: '正在深度解析代码片段...' });

          let digest: DailyDigest;
          try {
            digest = await LLMClient.extractLearnings(
              req.codeContext,
              req.fileHints,
              token
            );
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`LFAI 提炼失败: ${msg}`);
            return;
          }

          await NoteManager.saveDigest(context, digest);
          sidebarProvider.updateDigest(digest);
          statusBarItem.text = `$(brain) LFAI: ${digest.totalCards}张卡片`;

          vscode.window.showInformationMessage(
            `LFAI: 已为选中代码提炼 ${digest.totalCards} 张原理卡片，已同步至侧边栏！`
          );
        }
      );
      } finally {
        isExtracting = false;
      }
    }
  );
  context.subscriptions.push(extractSelectionCommand);

  // 5. Command: Open Today's Markdown Note
  const openNoteCommand = vscode.commands.registerCommand(
    'lfai.openTodayNote',
    async () => {
      await NoteManager.openTodayNote();
    }
  );
  context.subscriptions.push(openNoteCommand);

  // 6. Command: Copy Today's Work Summary & Standup
  const copyStandupCommand = vscode.commands.registerCommand(
    'lfai.copyDailyStandup',
    async () => {
      const digest = NoteManager.getCachedDigest(context);
      if (!digest) {
        vscode.window.showInformationMessage('LFAI: 今日尚未提炼内容，请先执行「提炼今日代码与 AI 考点」。');
        return;
      }
      const text = NoteManager.formatWorkSummaryForClipboard(digest);
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage('🎉 LFAI: 今日工作交付与 Standup 已复制到剪贴板，可直接粘贴！');
    }
  );
  context.subscriptions.push(copyStandupCommand);

  // 7. Command: Refresh Sidebar
  const refreshSidebarCommand = vscode.commands.registerCommand(
    'lfai.refreshSidebar',
    () => {
      sidebarProvider.refresh();
    }
  );
  context.subscriptions.push(refreshSidebarCommand);

  // 8. Command: Capture Current Clipboard to Inbox
  const captureClipboardCommand = vscode.commands.registerCommand(
    'lfai.captureClipboardNow',
    async () => {
      const watcher = ClipboardWatcher.getInstance(context);
      const item = await watcher.checkClipboardNow();
      if (item) {
        vscode.window.showInformationMessage('LFAI: 已成功捕获当前剪贴板并存入暂存箱！');
      } else {
        vscode.window.showInformationMessage('LFAI: 剪贴板未检测到新的 AI 对话或技术内容。');
      }
    }
  );
  context.subscriptions.push(captureClipboardCommand);

  // 9. Command: Extract Inbox Items
  const extractInboxCommand = vscode.commands.registerCommand(
    'lfai.extractInbox',
    async () => {
      if (isExtracting) {
        vscode.window.showInformationMessage('LFAI: 正在提炼中，请稍候...');
        return;
      }
      const items = await InboxManager.getItems(context);
      if (!items || items.length === 0) {
        vscode.window.showInformationMessage('LFAI: 知识暂存箱为空，请先在 ChatGPT / Gemini 中复制技术对话。');
        return;
      }

      isExtracting = true;
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: `LFAI: 正在批量分析暂存箱中的 ${items.length} 段技术对话...`,
            cancellable: true,
          },
          async (progress, token) => {
            progress.report({ increment: 30, message: '正在调用 LLM 提炼对话内参与架构要点...' });
            const contents = items.map((it) => it.content);
            const digest = await LLMClient.extractInboxLearnings(contents, token);

            progress.report({ increment: 40, message: '正在合并归档至今日 Markdown 笔记...' });

            // Merge with existing digest if today already has cards
            const existing = NoteManager.getCachedDigest(context);
            if (existing && existing.cards && existing.cards.length > 0) {
              digest.cards = [...digest.cards, ...existing.cards];
              digest.totalCards = digest.cards.length;
            }

            await NoteManager.saveDigest(context, digest);
            await InboxManager.clearInbox(context);

            sidebarProvider.updateDigest(digest);
            sidebarProvider.refresh();
            await updateStatusBar();

            vscode.window.showInformationMessage(
              `🎉 LFAI: 暂存箱提炼完成！已生成 ${digest.cards.length} 张原理卡片，已清空暂存箱。`
            );
          }
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`LFAI 暂存箱提炼失败: ${errorMsg}`);
      } finally {
        isExtracting = false;
      }
    }
  );
  context.subscriptions.push(extractInboxCommand);

  // 10. Command: Clear Inbox
  const clearInboxCommand = vscode.commands.registerCommand(
    'lfai.clearInbox',
    async () => {
      await InboxManager.clearInbox(context);
      vscode.window.showInformationMessage('LFAI: 知识暂存箱已清空。');
    }
  );
  context.subscriptions.push(clearInboxCommand);
}

export function deactivate() {}
