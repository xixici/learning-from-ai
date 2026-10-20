import * as vscode from 'vscode';
import { DailyDigest } from '../types';
import { NoteManager } from '../storage/noteManager';

export class L4AISidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'l4ai.sidebarView';
  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    };

    this.renderWebview();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'extractToday':
          await vscode.commands.executeCommand('l4ai.extractTodayLearnings');
          break;
        case 'openNote':
          await vscode.commands.executeCommand('l4ai.openTodayNote');
          break;
        case 'copyCode':
          await vscode.env.clipboard.writeText(data.code || '');
          vscode.window.showInformationMessage('L4AI: 代码已复制到剪贴板。');
          break;
        case 'notify':
          vscode.window.showInformationMessage(data.text);
          break;
      }
    });
  }

  public updateDigest(digest: DailyDigest): void {
    if (this._view) {
      this._view.webview.postMessage({ type: 'updateDigest', digest });
    }
  }

  public refresh(): void {
    this.renderWebview();
  }

  private renderWebview(): void {
    if (!this._view) {
      return;
    }

    const digest = NoteManager.getCachedDigest(this._context);
    this._view.webview.html = this.getHtmlForWebview(digest);
  }

  private getHtmlForWebview(digest?: DailyDigest): string {
    const todayStr = new Date().toISOString().split('T')[0];

    const cardsJson = JSON.stringify(digest?.cards || []);
    const summaryText = digest?.summary || '暂无提炼数据，点击下方按钮开始分析今日代码。';
    const totalCount = digest?.cards?.length || 0;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learning from AI</title>
  <style>
    :root {
      --bg: var(--vscode-sideBar-background, #1e1e1e);
      --fg: var(--vscode-foreground, #cccccc);
      --card-bg: var(--vscode-editor-background, #252526);
      --card-border: var(--vscode-panel-border, #333333);
      --accent: var(--vscode-button-background, #007acc);
      --accent-hover: var(--vscode-button-hoverBackground, #0062a3);
      --accent-fg: var(--vscode-button-foreground, #ffffff);
      --badge-syntax: #4ec9b0;
      --badge-arch: #569cd6;
      --badge-gotcha: #ce9178;
      --badge-quiz: #dcdcaa;
      --code-bg: var(--vscode-textCodeBlock-background, #181818);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--fg);
      background-color: var(--bg);
      padding: 12px;
      line-height: 1.5;
    }

    .header-box {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .title-main {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .date-badge {
      font-size: 11px;
      opacity: 0.7;
    }

    .summary-text {
      font-size: 12px;
      opacity: 0.85;
      margin-bottom: 10px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    button {
      background: var(--accent);
      color: var(--accent-fg);
      border: none;
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: background 0.15s ease;
    }

    button:hover { background: var(--accent-hover); }

    button.secondary {
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--fg);
    }
    button.secondary:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .filter-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .tab-btn {
      font-size: 11px;
      padding: 4px 8px;
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--fg);
      border-radius: 12px;
      cursor: pointer;
      white-space: nowrap;
    }

    .tab-btn.active {
      background: var(--accent);
      color: var(--accent-fg);
      border-color: var(--accent);
    }

    .card-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 10px;
      transition: border-color 0.15s ease;
    }
    .card:hover {
      border-color: var(--accent);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .card-type-tag {
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 10px;
      text-transform: uppercase;
    }

    .tag-syntax { background: rgba(78, 201, 176, 0.2); color: var(--badge-syntax); border: 1px solid var(--badge-syntax); }
    .tag-architecture { background: rgba(86, 156, 214, 0.2); color: var(--badge-arch); border: 1px solid var(--badge-arch); }
    .tag-gotcha { background: rgba(206, 145, 120, 0.2); color: var(--badge-gotcha); border: 1px solid var(--badge-gotcha); }
    .tag-quiz { background: rgba(220, 220, 170, 0.2); color: var(--badge-quiz); border: 1px solid var(--badge-quiz); }

    .card-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--fg);
    }

    .card-summary {
      font-size: 12px;
      opacity: 0.85;
      margin-bottom: 8px;
    }

    .code-box {
      background: var(--code-bg);
      border-radius: 4px;
      padding: 8px;
      margin: 8px 0;
      position: relative;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      overflow-x: auto;
    }

    .copy-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      font-size: 10px;
      padding: 2px 5px;
      background: rgba(255, 255, 255, 0.1);
      color: var(--fg);
      border: none;
      border-radius: 3px;
    }

    .details-toggle {
      font-size: 11px;
      cursor: pointer;
      color: var(--accent);
      margin-top: 6px;
      display: inline-block;
      user-select: none;
    }

    .deep-dive {
      display: none;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px dashed var(--card-border);
      font-size: 12px;
      line-height: 1.4;
      opacity: 0.9;
    }

    .quiz-box {
      background: rgba(220, 220, 170, 0.08);
      border: 1px solid rgba(220, 220, 170, 0.3);
      border-radius: 4px;
      padding: 8px;
      margin-top: 8px;
    }

    .quiz-q {
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .quiz-reveal-btn {
      background: var(--accent);
      font-size: 11px;
      padding: 3px 8px;
      margin-top: 4px;
    }

    .quiz-answer {
      display: none;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid var(--card-border);
      font-size: 11px;
    }

    .empty-state {
      text-align: center;
      padding: 30px 10px;
      color: var(--fg);
      opacity: 0.8;
    }

    .empty-state .icon {
      font-size: 36px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="title-row">
      <span class="title-main">🧠 L4AI 学习复盘</span>
      <span class="date-badge">${todayStr} (${totalCount} 张卡片)</span>
    </div>
    <div class="summary-text" id="summaryBox">${summaryText}</div>
    <div class="actions-grid">
      <button id="btnExtract">⚡ 提炼今日考点</button>
      <button class="secondary" id="btnNote">📝 查看 Markdown</button>
    </div>
  </div>

  <div class="filter-tabs">
    <button class="tab-btn active" data-filter="all">全部 (${totalCount})</button>
    <button class="tab-btn" data-filter="syntax">💡 语法</button>
    <button class="tab-btn" data-filter="architecture">🏗️ 架构</button>
    <button class="tab-btn" data-filter="gotcha">⚠️ 避坑</button>
    <button class="tab-btn" data-filter="quiz">❓ 自测</button>
  </div>

  <div class="card-list" id="cardList"></div>

  <script>
    const vscode = acquireVsCodeApi();
    let cardsData = ${cardsJson};
    let currentFilter = 'all';

    document.getElementById('btnExtract').addEventListener('click', () => {
      vscode.postMessage({ type: 'extractToday' });
    });

    document.getElementById('btnNote').addEventListener('click', () => {
      vscode.postMessage({ type: 'openNote' });
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderCards();
      });
    });

    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.type === 'updateDigest' && msg.digest) {
        cardsData = msg.digest.cards || [];
        document.getElementById('summaryBox').innerText = msg.digest.summary || '提炼完成';
        renderCards();
      }
    });

    function renderCards() {
      const container = document.getElementById('cardList');
      container.innerHTML = '';

      const filtered = cardsData.filter(c => currentFilter === 'all' || c.type === currentFilter);

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <div class="icon">🚀</div>
            <div>暂无满足条件的学习卡片</div>
            <div style="font-size:11px; margin-top:6px; opacity:0.6;">点击「提炼今日考点」从 Git 代码与 Codex 交互中获取</div>
          </div>
        \`;
        return;
      }

      const typeLabels = {
        syntax: '💡 语法特性',
        architecture: '🏗️ 架构权衡',
        gotcha: '⚠️ 潜在避坑',
        quiz: '❓ 深度自测'
      };

      filtered.forEach((card, idx) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';

        const tagClass = 'tag-' + (card.type || 'syntax');
        const tagLabel = typeLabels[card.type] || card.type;

        let codeHtml = '';
        if (card.codeSnippet) {
          codeHtml = \`
            <div class="code-box">
              <button class="copy-btn" onclick="copySnippet(\${idx})">复制</button>
              <pre><code>\${escapeHtml(card.codeSnippet)}</code></pre>
            </div>
          \`;
        }

        let quizHtml = '';
        if (card.quiz) {
          quizHtml = \`
            <div class="quiz-box">
              <div class="quiz-q">❓ 自测：\${escapeHtml(card.quiz.question)}</div>
              \${card.quiz.hint ? \`<div style="font-size:11px; opacity:0.8; margin-bottom:4px;">💡 提示：\${escapeHtml(card.quiz.hint)}</div>\` : ''}
              <button class="quiz-reveal-btn" onclick="toggleQuizAnswer(\${idx})">👉 显示答案与深度解析</button>
              <div class="quiz-answer" id="quiz-ans-\${idx}">
                <div style="font-weight:600; color:var(--badge-syntax);">【答案】\${escapeHtml(card.quiz.answer)}</div>
                <div style="margin-top:4px; opacity:0.85;">\${escapeHtml(card.quiz.explanation)}</div>
              </div>
            </div>
          \`;
        }

        cardEl.innerHTML = \`
          <div class="card-header">
            <span class="card-type-tag \${tagClass}">\${tagLabel}</span>
            \${card.sourceFile ? \`<span style="font-size:10px; opacity:0.6;">\${escapeHtml(card.sourceFile)}</span>\` : ''}
          </div>
          <div class="card-title">\${escapeHtml(card.title)}</div>
          <div class="card-summary">\${escapeHtml(card.summary)}</div>
          \${codeHtml}
          <div class="details-toggle" onclick="toggleDeepDive(\${idx})">📖 展开原理剖析 ▼</div>
          <div class="deep-dive" id="deep-dive-\${idx}">\${escapeHtml(card.explanation)}</div>
          \${quizHtml}
        \`;

        container.appendChild(cardEl);
      });
    }

    function toggleDeepDive(idx) {
      const el = document.getElementById('deep-dive-' + idx);
      if (el) {
        el.style.display = el.style.display === 'block' ? 'none' : 'block';
      }
    }

    function toggleQuizAnswer(idx) {
      const el = document.getElementById('quiz-ans-' + idx);
      if (el) {
        el.style.display = el.style.display === 'block' ? 'none' : 'block';
      }
    }

    function copySnippet(idx) {
      const card = cardsData[idx];
      if (card && card.codeSnippet) {
        vscode.postMessage({ type: 'copyCode', code: card.codeSnippet });
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    renderCards();
  </script>
</body>
</html>`;
  }
}
