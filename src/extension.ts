import * as vscode from 'vscode';
import { collectTodayGitDiff } from './collector/gitCollector';
import { collectActiveSelection } from './collector/selectionCollector';
import { LLMClient } from './engine/llmClient';
import { NoteManager } from './storage/noteManager';
import { L4AISidebarProvider } from './ui/sidebarProvider';
import { DailyDigest } from './types';

export function activate(context: vscode.ExtensionContext) {
  // 1. Register Sidebar Webview Provider
  const sidebarProvider = new L4AISidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      L4AISidebarProvider.viewType,
      sidebarProvider
    )
  );

  // 2. Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'l4ai.extractTodayLearnings';
  statusBarItem.text = '$(brain) L4AI: 今日知识';
  statusBarItem.tooltip = '点击提炼今日代码与 Codex 考点卡片';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Update status bar with cached digest if exists
  const cached = NoteManager.getCachedDigest(context);
  if (cached) {
    statusBarItem.text = `$(brain) L4AI: ${cached.totalCards}张卡片`;
  }

  // 3. Command: Extract Today's Learnings
  const extractTodayCommand = vscode.commands.registerCommand(
    'l4ai.extractTodayLearnings',
    async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'L4AI: 正在分析今日代码与 Codex 交互，提炼核心考点...',
          cancellable: true,
        },
        async (progress, token) => {
          progress.report({ increment: 20, message: '正在提取 Git 增量与工作区变更...' });

          let extractionRequest = await collectTodayGitDiff();

          if (!extractionRequest || !extractionRequest.codeContext.trim()) {
            const answer = await vscode.window.showInformationMessage(
              'L4AI: 今日暂未检测到明显的 Git 提交或文件修改。是否生成智能示范复盘卡片？',
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
            vscode.window.showErrorMessage(`L4AI 提炼失败: ${msg}`);
            return;
          }

          progress.report({ increment: 30, message: '正在生成结构化笔记与闪卡...' });

          const savedPath = await NoteManager.saveDigest(context, digest);
          sidebarProvider.updateDigest(digest);

          statusBarItem.text = `$(brain) L4AI: ${digest.totalCards}张卡片`;

          progress.report({ increment: 10, message: '提炼完成！' });

          const action = await vscode.window.showInformationMessage(
            `🎉 L4AI: 今日成功提炼 ${digest.totalCards} 张学习卡片！`,
            '查看 Markdown 笔记',
            '在侧边栏复习'
          );

          if (action === '查看 Markdown 笔记' && savedPath) {
            const doc = await vscode.workspace.openTextDocument(savedPath);
            await vscode.window.showTextDocument(doc, { preview: false });
          } else if (action === '在侧边栏复习') {
            await vscode.commands.executeCommand('l4ai.sidebarView.focus');
          }
        }
      );
    }
  );
  context.subscriptions.push(extractTodayCommand);

  // 4. Command: Extract from Selected Code
  const extractSelectionCommand = vscode.commands.registerCommand(
    'l4ai.extractSelection',
    async () => {
      const req = collectActiveSelection();
      if (!req) {
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'L4AI: 正在提炼选中代码考点与底层原理...',
          cancellable: true,
        },
        async (progress, token) => {
          progress.report({ increment: 40, message: '正在深度解析代码片段...' });

          const digest = await LLMClient.extractLearnings(
            req.codeContext,
            req.fileHints,
            token
          );

          await NoteManager.saveDigest(context, digest);
          sidebarProvider.updateDigest(digest);
          statusBarItem.text = `$(brain) L4AI: ${digest.totalCards}张卡片`;

          vscode.window.showInformationMessage(
            `L4AI: 已为选中代码提炼 ${digest.totalCards} 张原理卡片，已同步至侧边栏！`
          );
        }
      );
    }
  );
  context.subscriptions.push(extractSelectionCommand);

  // 5. Command: Open Today's Markdown Note
  const openNoteCommand = vscode.commands.registerCommand(
    'l4ai.openTodayNote',
    async () => {
      await NoteManager.openTodayNote();
    }
  );
  context.subscriptions.push(openNoteCommand);

  // 6. Command: Refresh Sidebar
  const refreshSidebarCommand = vscode.commands.registerCommand(
    'l4ai.refreshSidebar',
    () => {
      sidebarProvider.refresh();
    }
  );
  context.subscriptions.push(refreshSidebarCommand);
}

export function deactivate() {}
