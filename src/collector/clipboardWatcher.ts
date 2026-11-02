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
  private outputChannel: vscode.OutputChannel;

  public lastCheckTime: number = 0;
  public lastCapturedTime: number = 0;
  public lastCapturedPreview: string = '';
  public isRunning: boolean = false;

  private constructor(private readonly context: vscode.ExtensionContext) {
    this.outputChannel = vscode.window.createOutputChannel('LFAI: 剪贴板监听日志');
    this.context.subscriptions.push(this.outputChannel);
    this.init();
  }

  public static getInstance(context: vscode.ExtensionContext): ClipboardWatcher {
    if (!this.instance) {
      this.instance = new ClipboardWatcher(context);
    }
    return this.instance;
  }

  public log(message: string) {
    const timeStr = new Date().toLocaleTimeString();
    this.outputChannel.appendLine(`[${timeStr}] ${message}`);
  }

  public showLog() {
    this.outputChannel.show(true);
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
        if (
          e.affectsConfiguration('lfai.enableClipboardWatcher') ||
          e.affectsConfiguration('lfai.clipboardCheckInterval')
        ) {
          const isEnabled = vscode.workspace
            .getConfiguration('lfai')
            .get<boolean>('enableClipboardWatcher', true);
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
          this.log('VS Code 窗口获得焦点，立即嗅探剪贴板...');
          this.checkClipboardNow();
        }
      })
    );
  }

  public start() {
    this.stop();

    const config = vscode.workspace.getConfiguration('lfai');
    const intervalMs = config.get<number>('clipboardCheckInterval', 2000);

    this.isRunning = true;
    this.log(`剪贴板后台监听已启动 (检测频率: ${Math.max(1000, intervalMs)}ms)`);

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
    this.isRunning = false;
    this.log('剪贴板后台监听已停止');
  }

  /**
   * Checks current clipboard content and stores in Inbox if valid.
   * @param force When true (e.g. user manually clicked Capture), bypasses strict pattern filtering as long as it's safe.
   */
  public async checkClipboardNow(force: boolean = false): Promise<InboxItem | null> {
    if (this.isProcessing) {
      return null;
    }

    this.isProcessing = true;
    this.lastCheckTime = Date.now();
    try {
      const text = await vscode.env.clipboard.readText();
      if (!text || !text.trim()) {
        if (force) {
          vscode.window.showInformationMessage('LFAI: 系统剪贴板为空，未发现可捕获的内容。');
        }
        return null;
      }

      const trimmed = text.trim();
      const currentHash = crypto.createHash('md5').update(trimmed).digest('hex');

      // Skip if unchanged since last check (unless forced)
      if (!force && currentHash === this.lastHash) {
        return null;
      }

      // Filter: check if matches tech / AI chat pattern and passes safety
      const evaluation = this.evaluateContent(trimmed, force);
      if (!evaluation.isAccepted) {
        if (force) {
          vscode.window.showWarningMessage('LFAI: 当前剪贴板包含敏感私钥/凭据，出于安全防护已被拦截。');
        } else {
          this.log(`剪贴板已变动但被过滤 (长度: ${trimmed.length}字符, 未识别为高价值AI/技术对话)`);
        }
        this.lastHash = currentHash;
        return null;
      }

      // Add to Inbox
      const item = await InboxManager.addItem(
        this.context,
        trimmed,
        force ? 'manual' : 'clipboard',
        evaluation.detectedType
      );

      this.lastHash = currentHash;

      if (item) {
        this.lastCapturedTime = Date.now();
        this.lastCapturedPreview = item.preview;
        this.log(`✅ 成功捕获剪贴板内容 -> 类型: [${item.detectedType}], 长度: ${item.charCount}字符, 预览: "${item.preview}"`);

        const config = vscode.workspace.getConfiguration('lfai');
        const notify = config.get<boolean>('notifyOnClipboardCapture', true);
        if (notify) {
          vscode.window
            .showInformationMessage(
              `🧠 LFAI: 已捕获剪贴板对话 (${item.charCount}字符)，已暂存！`,
              '查看记录'
            )
            .then((action) => {
              if (action === '查看记录') {
                vscode.commands.executeCommand('workbench.view.extension.lfai-container');
              }
            });
        }
      } else if (force) {
        vscode.window.showInformationMessage('LFAI: 该剪贴板内容已存在于暂存箱中，无需重复收录。');
      }

      return item;
    } catch (err) {
      this.log(`读取剪贴板异常: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Evaluates text to ensure it's high-value technical/AI chat content
   * and contains no sensitive private credentials.
   */
  private evaluateContent(
    text: string,
    force: boolean = false
  ): { isAccepted: boolean; detectedType: 'chat' | 'code' | 'snippet' } {
    // 1. Absolute sensitive data guard: exclude private tokens, passwords, private keys
    if (
      /(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{60}|sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN\s+(?:RSA|OPENSSH)?\s*PRIVATE\s+KEY)/i.test(
        text
      )
    ) {
      return { isAccepted: false, detectedType: 'snippet' };
    }

    // If forced manual capture, accept any non-empty text up to 100k chars
    if (force) {
      const hasCode = /```[\s\S]*?```/.test(text) || /(?:function|class|const|import|def|fn)\s+/.test(text);
      const hasChat = /(?:ChatGPT|Gemini|Claude|User|Assistant|Human|Prompt):/i.test(text);
      return {
        isAccepted: text.length >= 10 && text.length <= 100000,
        detectedType: hasChat ? 'chat' : hasCode ? 'code' : 'snippet',
      };
    }

    // Normal automatic background check: length between 30 and 80,000 chars
    if (text.length < 30 || text.length > 80000) {
      return { isAccepted: false, detectedType: 'snippet' };
    }

    // 2. Check for Code Block pattern
    const hasCodeBlock = /```[a-zA-Z0-9_-]*\r?\n[\s\S]*?```/.test(text);

    // 3. Check for AI Chat / QA format markers
    const hasChatMarkers =
      /(?:ChatGPT|Gemini|Claude|Copilot|User|Assistant|Human|Prompt|Question|Answer|Q&A|提问|回答):/i.test(
        text
      ) || /^(User|Assistant|Human|AI)\s*[\n:]/im.test(text);

    // 4. Check for Programming Syntax markers
    const hasCodeSyntax =
      /\b(import|export|function|const|let|var|class|interface|type|return|async|await|struct|impl|pub\s+fn|def|package|public\s+class|throw|catch)\b/.test(
        text
      );

    // 5. Check for Technical keywords in Chinese and English
    const hasTechKeywords =
      /(架构|底层原理|机制|并发|锁|竞争|内存泄漏|竞态|死锁|性能|优化|重构|缓存|组件|状态|路由|模型|数据流|微服务|接口|配置|算法|异常|trade-off|best practice|gotcha|destructive test|goroutine|event loop|async\/await|boundary|invariant|pipeline|middleware|database|query|thread|mutex)/i.test(
        text
      );

    // 6. Check for structured Markdown explanation
    const hasMarkdownStructure = /^(#{1,6}\s+|-\s+|\*\s+|\d+\.\s+|>\s+)/m.test(text);

    // Decision Logic:
    // A: Has explicit AI chat marker
    if (hasChatMarkers) {
      return { isAccepted: true, detectedType: 'chat' };
    }

    // B: Has formatted code block and reasonable size
    if (hasCodeBlock && text.length >= 60) {
      return { isAccepted: true, detectedType: 'code' };
    }

    // C: Has programming syntax and markdown structure or technical discussion
    if (hasCodeSyntax && (hasMarkdownStructure || hasTechKeywords || text.length >= 80)) {
      return { isAccepted: true, detectedType: 'code' };
    }

    // D: Medium-to-long text with engineering keywords
    if (hasTechKeywords && (hasMarkdownStructure || text.length >= 100)) {
      return { isAccepted: true, detectedType: 'snippet' };
    }

    // E: Multi-paragraph technical text (> 200 chars with code or markdown)
    if (text.length >= 200 && (hasCodeSyntax || hasMarkdownStructure)) {
      return { isAccepted: true, detectedType: 'snippet' };
    }

    return { isAccepted: false, detectedType: 'snippet' };
  }

  public dispose() {
    this.stop();
    this.disposables.forEach((d) => d.dispose());
  }
}
