import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { InboxManager } from '../storage/inboxManager';
import { InboxItem } from '../types';

export class ClipboardWatcher implements vscode.Disposable {
  private static instance?: ClipboardWatcher;
  private intervalTimer?: NodeJS.Timeout;
  private lastHash: string = '';
  private isProcessing: boolean = false;
  private disposables: vscode.Disposable[] = [];

  private constructor(private readonly context: vscode.ExtensionContext) {
    this.init();
  }

  public static getInstance(context: vscode.ExtensionContext): ClipboardWatcher {
    if (!this.instance) {
      this.instance = new ClipboardWatcher(context);
    }
    return this.instance;
  }

  private init() {
    const config = vscode.workspace.getConfiguration('lfai');
    const enabled = config.get<boolean>('enableClipboardWatcher', true);

    if (enabled) {
      this.start();
    }

    // Listen to configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('lfai.enableClipboardWatcher') || e.affectsConfiguration('lfai.clipboardCheckInterval')) {
          const isEnabled = vscode.workspace.getConfiguration('lfai').get<boolean>('enableClipboardWatcher', true);
          if (isEnabled) {
            this.start();
          } else {
            this.stop();
          }
        }
      })
    );

    // Listen to window focus change: when user switches back to VS Code, immediately check
    this.disposables.push(
      vscode.window.onDidChangeWindowState((state) => {
        if (state.focused) {
          this.checkClipboardNow();
        }
      })
    );
  }

  public start() {
    this.stop();

    const config = vscode.workspace.getConfiguration('lfai');
    const intervalMs = config.get<number>('clipboardCheckInterval', 2000);

    // Start background watcher loop
    this.intervalTimer = setInterval(() => {
      this.checkClipboardNow();
    }, Math.max(1000, intervalMs));
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = undefined;
    }
  }

  public async checkClipboardNow(): Promise<InboxItem | null> {
    if (this.isProcessing) {
      return null;
    }

    this.isProcessing = true;
    try {
      const text = await vscode.env.clipboard.readText();
      if (!text || !text.trim()) {
        return null;
      }

      const trimmed = text.trim();
      const currentHash = crypto.createHash('md5').update(trimmed).digest('hex');

      // Skip if unchanged since last check
      if (currentHash === this.lastHash) {
        return null;
      }
      this.lastHash = currentHash;

      // Filter: check if matches tech / AI chat pattern and passes safety
      const evaluation = this.evaluateContent(trimmed);
      if (!evaluation.isAccepted) {
        return null;
      }

      // Add to Inbox
      const item = await InboxManager.addItem(
        this.context,
        trimmed,
        'clipboard',
        evaluation.detectedType
      );

      if (item) {
        const config = vscode.workspace.getConfiguration('lfai');
        const notify = config.get<boolean>('notifyOnClipboardCapture', true);
        if (notify) {
          vscode.window.showInformationMessage(
            `🧠 LFAI: 检测到高价值技术对话，已暂存至 Inbox（共存入暂存箱）`,
            '查看暂存箱'
          ).then((action) => {
            if (action === '查看暂存箱') {
              vscode.commands.executeCommand('workbench.view.extension.lfai-container');
            }
          });
        }
      }

      return item;
    } catch (err) {
      // Fail silently to avoid interrupting the user
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Evaluates text to ensure it's high-value technical/AI chat content
   * and contains no sensitive private credentials.
   */
  private evaluateContent(text: string): { isAccepted: boolean; detectedType: 'chat' | 'code' | 'snippet' } {
    // 1. Length check: between 40 chars and 80,000 chars
    if (text.length < 40 || text.length > 80000) {
      return { isAccepted: false, detectedType: 'snippet' };
    }

    // 2. Sensitive data guard: exclude private tokens, passwords, private keys
    if (
      /(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{60}|sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN\s+(?:RSA|OPENSSH)?\s*PRIVATE\s+KEY)/i.test(text)
    ) {
      return { isAccepted: false, detectedType: 'snippet' };
    }

    // 3. Check for Code Block pattern
    const hasCodeBlock = /```[a-zA-Z0-9_-]*\r?\n[\s\S]*?```/.test(text);

    // 4. Check for AI Chat / QA format markers
    const hasChatMarkers = /(?:ChatGPT|Gemini|Claude|Copilot|User|Assistant|Human|Prompt|Question|Answer):/i.test(text);

    // 5. Check for Technical keywords in Chinese and English
    const hasTechKeywords = /(架构|底层原理|机制|并发|锁|竞争|内存泄漏|竞态|死锁|trade-off|best practice|gotcha|destructive test|goroutine|event loop|async\/await|boundary|invariant)/i.test(text);

    // Accept if it looks like an AI chat, structured code block with explanation, or deep technical discussion
    if (hasChatMarkers || (hasCodeBlock && text.length > 100) || (hasTechKeywords && text.length > 80)) {
      const detectedType = hasChatMarkers ? 'chat' : hasCodeBlock ? 'code' : 'snippet';
      return { isAccepted: true, detectedType };
    }

    return { isAccepted: false, detectedType: 'snippet' };
  }

  public dispose() {
    this.stop();
    this.disposables.forEach((d) => d.dispose());
  }
}
