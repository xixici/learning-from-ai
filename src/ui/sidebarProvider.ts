import * as vscode from 'vscode';
import { DailyDigest, InboxItem } from '../types';
import { NoteManager } from '../storage/noteManager';
import { InboxManager } from '../storage/inboxManager';
import { ClipboardWatcher } from '../collector/clipboardWatcher';
export class LFAISidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'lfai.sidebarView';
  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {
    _context.subscriptions.push(
      InboxManager.onDidUpdateInbox(() => {
        this.renderWebview();
      })
    );
  }

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
          await vscode.commands.executeCommand('lfai.extractTodayLearnings');
          break;
        case 'openNote':
          await vscode.commands.executeCommand('lfai.openTodayNote');
          break;
        case 'copyStandup':
          await vscode.commands.executeCommand('lfai.copyDailyStandup');
          break;
        case 'copyCode':
          await vscode.env.clipboard.writeText(data.code || '');
          vscode.window.showInformationMessage('LFAI: 代码已复制到剪贴板。');
          break;
        case 'notify':
          vscode.window.showInformationMessage(data.text);
          break;
        case 'extractInbox':
          await vscode.commands.executeCommand('lfai.extractInbox');
          break;
        case 'clearInbox':
          await InboxManager.clearInbox(this._context);
          vscode.window.showInformationMessage('LFAI: 暂存箱已清空。');
          break;
        case 'removeInboxItem':
          if (data.id) {
            await InboxManager.removeItem(this._context, data.id);
          }
          break;
        case 'captureClipboard':
          await vscode.commands.executeCommand('lfai.captureClipboardNow');
          break;
        case 'extractSingleInboxItem':
          if (data.id) {
            await vscode.commands.executeCommand('lfai.extractSingleInboxItem', data.id);
          }
          break;
        case 'openClipboardLog':
          await vscode.commands.executeCommand('lfai.openClipboardLog');
          break;
        case 'openInboxItemDoc':
          if (data.id) {
            await vscode.commands.executeCommand('lfai.openInboxItemDoc', data.id);
          }
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

  private async renderWebview(): Promise<void> {
    if (!this._view) {
      return;
    }

    const digest = NoteManager.getCachedDigest(this._context);
    const inboxItems = await InboxManager.getItems(this._context);
    const watcher = ClipboardWatcher.getInstance(this._context);
    const watcherInfo = {
      isRunning: watcher.isRunning,
      lastCheckTime: watcher.lastCheckTime,
      lastCapturedTime: watcher.lastCapturedTime,
      lastCapturedPreview: watcher.lastCapturedPreview,
    };

    this._view.webview.html = this.getHtmlForWebview(digest, inboxItems, watcherInfo);
  }

  private getHtmlForWebview(
    digest?: DailyDigest,
    inboxItems: InboxItem[] = [],
    watcherInfo: { isRunning: boolean; lastCheckTime: number; lastCapturedTime: number; lastCapturedPreview?: string } = {
      isRunning: true,
      lastCheckTime: 0,
      lastCapturedTime: 0,
    }
  ): string {
    const todayStr = new Date().toISOString().split('T')[0];
    const inboxItemsJson = JSON.stringify(inboxItems).replace(/</g, '\\u003c');
    const watcherInfoJson = JSON.stringify(watcherInfo).replace(/</g, '\\u003c');

    const cardsJson = JSON.stringify(digest?.cards || []).replace(/</g, '\\u003c');
    const workSummaryJson = JSON.stringify(digest?.workSummary || null).replace(/</g, '\\u003c');
    const summaryText = digest?.summary || '暂无提炼数据，点击下方按钮开始分析今日代码。';
    const totalCount = digest?.cards?.length || 0;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learning From AI (LFAI)</title>
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
      margin-bottom: 6px;
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

    /* Work Summary Box */
    .work-summary-box {
      background: rgba(0, 122, 204, 0.08);
      border: 1px solid rgba(0, 122, 204, 0.25);
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 12px;
    }
    .work-summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-size: 12px;
      user-select: none;
    }
    .work-summary-body {
      margin-top: 8px;
      font-size: 11px;
      line-height: 1.5;
    }
    .work-summary-list {
      padding-left: 16px;
      margin-top: 4px;
    }
    .work-summary-list li {
      margin-bottom: 3px;
    }
    .work-summary-report {
      white-space: pre-wrap;
      font-family: inherit;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border, rgba(255, 255, 255, 0.1));
      border-radius: 4px;
      padding: 8px 10px;
      margin-top: 6px;
      line-height: 1.6;
      font-size: 11px;
      user-select: text;
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
      padding: 12px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .card-type-tag {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .tag-syntax { background: rgba(78, 201, 176, 0.15); color: var(--badge-syntax); border: 1px solid var(--badge-syntax); }
    .tag-architecture { background: rgba(86, 156, 214, 0.15); color: var(--badge-arch); border: 1px solid var(--badge-arch); }
    .tag-gotcha { background: rgba(206, 145, 120, 0.15); color: var(--badge-gotcha); border: 1px solid var(--badge-gotcha); }
    .tag-quiz { background: rgba(220, 220, 170, 0.15); color: var(--badge-quiz); border: 1px solid var(--badge-quiz); }

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
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed var(--card-border);
      font-size: 12px;
      line-height: 1.45;
    }

    .deep-dive-section {
      margin-bottom: 8px;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 11px;
      line-height: 1.45;
    }
    .deep-dive-section.the-why {
      background: rgba(78, 201, 176, 0.08);
      border-left: 3px solid var(--badge-syntax);
    }
    .deep-dive-section.destructive-test {
      background: rgba(206, 145, 120, 0.08);
      border-left: 3px solid var(--badge-gotcha);
    }
    .deep-dive-section.best-practice {
      background: rgba(86, 156, 214, 0.08);
      border-left: 3px solid var(--badge-arch);
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
    .inbox-box {
      margin-top: 12px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .inbox-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--card-border);
    }
    .inbox-title {
      font-weight: 600;
      color: var(--fg);
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }
    .inbox-status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #4ec9b0;
      box-shadow: 0 0 6px #4ec9b0;
    }
    .inbox-status-bar {
      font-size: 11px;
      color: var(--fg);
      opacity: 0.75;
      margin: 6px 0 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .inbox-status-bar a {
      color: var(--accent);
      text-decoration: none;
      cursor: pointer;
    }
    .inbox-status-bar a:hover {
      text-decoration: underline;
    }
    .inbox-empty-view {
      text-align: center;
      padding: 16px 8px;
      background: var(--code-bg);
      border-radius: 4px;
      border: 1px dashed var(--card-border);
      margin-bottom: 8px;
    }
    .inbox-empty-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }
    .inbox-empty-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--fg);
      margin-bottom: 4px;
    }
    .inbox-empty-desc {
      font-size: 10px;
      color: var(--fg);
      opacity: 0.7;
      line-height: 1.4;
      margin-bottom: 8px;
    }
    .inbox-card {
      background: var(--code-bg);
      border-radius: 4px;
      padding: 8px;
      margin-bottom: 8px;
      border: 1px solid var(--card-border);
      border-left: 3px solid var(--accent);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .inbox-card.newly-captured {
      border-color: #4ec9b0;
      box-shadow: 0 0 8px rgba(78, 201, 176, 0.4);
    }
    .inbox-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 10px;
    }
    .inbox-meta-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .inbox-badge {
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 600;
    }
    .badge-chat {
      background: rgba(156, 120, 240, 0.25);
      color: #c586c0;
      border: 1px solid rgba(156, 120, 240, 0.4);
    }
    .badge-code {
      background: rgba(78, 201, 176, 0.2);
      color: #4ec9b0;
      border: 1px solid rgba(78, 201, 176, 0.4);
    }
    .badge-snippet {
      background: rgba(220, 220, 170, 0.2);
      color: #dcdcaa;
      border: 1px solid rgba(220, 220, 170, 0.4);
    }
    .inbox-time {
      opacity: 0.65;
    }
    .inbox-chars {
      opacity: 0.65;
    }
    .inbox-card-del {
      cursor: pointer;
      opacity: 0.6;
      font-size: 12px;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .inbox-card-del:hover {
      opacity: 1;
      color: #f48771;
      background: rgba(244, 135, 113, 0.15);
    }
    .inbox-preview-text {
      font-size: 11px;
      line-height: 1.4;
      color: var(--fg);
      margin-bottom: 6px;
      word-break: break-all;
    }
    .inbox-full-box {
      display: none;
      margin: 6px 0;
      background: #111;
      border: 1px solid var(--card-border);
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
      padding: 6px;
    }
    .inbox-full-pre {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      white-space: pre-wrap;
      word-break: break-all;
      color: #d4d4d4;
    }
    .inbox-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .inbox-card-actions {
      display: flex;
      gap: 6px;
    }
    .inbox-btn-sm {
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--fg);
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 10px;
      cursor: pointer;
    }
    .inbox-btn-sm:hover {
      background: var(--card-bg);
      color: #fff;
    }
    .inbox-btn-extract-single {
      background: var(--accent);
      color: var(--accent-fg);
      border: none;
    }
    .inbox-btn-extract-single:hover {
      background: var(--accent-hover);
    }
    .inbox-actions-bar {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    .inbox-btn-batch {
      flex: 2;
      background: var(--accent);
      color: var(--accent-fg);
      border: none;
      border-radius: 4px;
      padding: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .inbox-btn-clear-all {
      flex: 1;
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--fg);
      border-radius: 4px;
      padding: 6px;
      font-size: 11px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="title-row">
      <span class="title-main">🧠 LFAI 学习与交付</span>
      <span class="date-badge">${todayStr} (${totalCount} 张卡片)</span>
    </div>
    <div class="summary-text" id="summaryBox">${summaryText}</div>
    <div class="actions-grid">
      <button id="btnExtract">⚡ 提炼今日考点</button>
      <button class="secondary" id="btnStandup">📋 复制日报/PR</button>
    </div>
    <div style="display: flex; gap: 6px; margin-top: 6px;">
      <button class="secondary" style="flex: 1;" id="btnCapture">📥 捕获剪贴板</button>
      <button class="secondary" style="flex: 2;" id="btnNote">📝 打开 Markdown 复盘笔记</button>
    </div>
  </div>

  <div id="inboxBox" class="inbox-box">
    <div class="inbox-header" id="inboxHeader">
      <span class="inbox-title">
        <span class="inbox-status-indicator" id="inboxIndicator"></span>
        <span>📋 剪贴板监听与暂存箱</span>
      </span>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 11px; opacity: 0.8; font-weight: 600;" id="inboxCountBadge">0 条</span>
        <span id="inboxArrow" style="font-size: 10px;">▼</span>
      </div>
    </div>
    <div id="inboxBody">
      <div class="inbox-status-bar">
        <span id="inboxStatusText">🟢 实时监听中（在 ChatGPT/Gemini 复制即自动入库）</span>
        <a id="btnOpenLog">查看日志</a>
      </div>
      <div id="inboxList"></div>
      <div class="inbox-actions-bar" id="inboxActionsBar" style="display: none;">
        <button class="inbox-btn-batch" id="btnExtractInbox">🧠 批量提炼全部暂存</button>
        <button class="inbox-btn-clear-all" id="btnClearInbox">清空</button>
      </div>
    </div>
  </div>

  <div id="workSummaryBox" class="work-summary-box" style="display: none;">
    <div class="work-summary-header" id="workSummaryHeader">
      <span>📋 <b>今日工作交付 (Standup / PR)</b></span>
      <span id="workSummaryArrow" style="font-size: 10px;">▼</span>
    </div>
    <div id="workSummaryBody" class="work-summary-body">
      <div id="workSummaryTitle" style="font-weight: 600; margin-bottom: 4px; color: var(--accent);"></div>
      <div id="workSummaryReport" class="work-summary-report" style="display: none;"></div>
      <ul id="workSummaryList" class="work-summary-list"></ul>
    </div>
  </div>
  <div class="filter-tabs">
    <button class="tab-btn active" data-filter="all">全部 (${totalCount})</button>
    <button class="tab-btn" data-filter="gotcha">⚠️ 避坑</button>
    <button class="tab-btn" data-filter="architecture">🏗️ 架构</button>
    <button class="tab-btn" data-filter="syntax">💡 语法</button>
    <button class="tab-btn" data-filter="quiz">❓ 自测</button>
  </div>

  <div class="card-list" id="cardList"></div>

  <script>
    const vscode = acquireVsCodeApi();
    let cardsData = ${cardsJson};
    let workSummaryData = ${workSummaryJson};
    let inboxData = ${inboxItemsJson};
    let watcherData = ${watcherInfoJson};
    let currentFilter = 'all';
    let isInboxCollapsed = false;
    document.getElementById('btnExtract').addEventListener('click', () => {
      vscode.postMessage({ type: 'extractToday' });
    });

    document.getElementById('btnStandup').addEventListener('click', () => {
      vscode.postMessage({ type: 'copyStandup' });
    });

    document.getElementById('btnNote').addEventListener('click', () => {
      vscode.postMessage({ type: 'openNote' });
    });

    document.getElementById('btnCapture').addEventListener('click', () => {
      vscode.postMessage({ type: 'captureClipboard' });
    });

    document.getElementById('btnExtractInbox').addEventListener('click', () => {
      vscode.postMessage({ type: 'extractInbox' });
    });

    document.getElementById('btnClearInbox').addEventListener('click', () => {
      vscode.postMessage({ type: 'clearInbox' });
    });

    document.getElementById('inboxHeader').addEventListener('click', () => {
      const body = document.getElementById('inboxBody');
      const arrow = document.getElementById('inboxArrow');
      isInboxCollapsed = !isInboxCollapsed;
      body.style.display = isInboxCollapsed ? 'none' : 'block';
      arrow.innerText = isInboxCollapsed ? '▲' : '▼';
    });

    document.getElementById('btnOpenLog').addEventListener('click', (e) => {
      e.stopPropagation();
      vscode.postMessage({ type: 'openClipboardLog' });
    });

    document.getElementById('workSummaryHeader').addEventListener('click', () => {
      const body = document.getElementById('workSummaryBody');
      const arrow = document.getElementById('workSummaryArrow');
      const isHidden = body.style.display === 'none';
      body.style.display = isHidden ? 'block' : 'none';
      arrow.innerText = isHidden ? '▼' : '▲';
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
        workSummaryData = msg.digest.workSummary || null;
        document.getElementById('summaryBox').innerText = msg.digest.summary || '提炼完成';
        renderWorkSummary();
        renderCards();
      }
      if (msg.type === 'updateInbox' && msg.items) {
        inboxData = msg.items;
        renderInbox();
      }
    });

    function renderWorkSummary() {
      const box = document.getElementById('workSummaryBox');
      const titleEl = document.getElementById('workSummaryTitle');
      const reportEl = document.getElementById('workSummaryReport');
      const listEl = document.getElementById('workSummaryList');

      if (!workSummaryData) {
        box.style.display = 'none';
        return;
      }

      box.style.display = 'block';
      titleEl.innerText = workSummaryData.title || '今日工作完成摘要';

      if (workSummaryData.dailyReportText && workSummaryData.dailyReportText.trim()) {
        reportEl.innerText = workSummaryData.dailyReportText.trim();
        reportEl.style.display = 'block';
        listEl.style.display = 'none';
      } else {
        reportEl.style.display = 'none';
        listEl.style.display = 'block';
        listEl.innerHTML = '';

        const items = workSummaryData.deliverables || [];
        items.forEach(item => {
          const li = document.createElement('li');
          li.innerText = item;
          listEl.appendChild(li);
        });
      }
    }

    function renderCards() {
      const container = document.getElementById('cardList');
      container.innerHTML = '';

      const filtered = cardsData.filter(c => currentFilter === 'all' || c.type === currentFilter);

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <div class="icon">🚀</div>
            <div>暂无满足条件的学习卡片</div>
            <div style="font-size:11px; margin-top:6px; opacity:0.6;">点击「提炼今日考点」从 Git 代码与 AI 交互中获取</div>
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
              <div class="quiz-q">❓ 实战自测：\${escapeHtml(card.quiz.question)}</div>
              \${card.quiz.hint ? \`<div style="font-size:11px; opacity:0.8; margin-bottom:4px;">💡 提示：\${escapeHtml(card.quiz.hint)}</div>\` : ''}
              <button class="quiz-reveal-btn" onclick="toggleQuizAnswer(\${idx})">👉 显示答案与深度解析</button>
              <div class="quiz-answer" id="quiz-ans-\${idx}">
                <div style="font-weight:600; color:var(--badge-syntax); margin-bottom:2px;">【核心答案】\${escapeHtml(card.quiz.answer)}</div>
                <div style="opacity:0.85; line-height:1.4;">\${escapeHtml(card.quiz.explanation)}</div>
              </div>
            </div>
          \`;
        }

        let deepDiveSections = '';
        if (card.theWhy) {
          deepDiveSections += \`<div class="deep-dive-section the-why"><strong>💡 机制剖析 (The Why)：</strong><br/>\${escapeHtml(card.theWhy)}</div>\`;
        }
        if (card.destructiveTest) {
          deepDiveSections += \`<div class="deep-dive-section destructive-test"><strong>⚠️ 破坏性推演 (如果不加会怎样)：</strong><br/>\${escapeHtml(card.destructiveTest)}</div>\`;
        }
        deepDiveSections += \`<div class="deep-dive-section"><strong>📖 底层机制详解：</strong><br/>\${escapeHtml(card.explanation)}</div>\`;
        if (card.bestPractice) {
          deepDiveSections += \`<div class="deep-dive-section best-practice"><strong>✨ 最佳实践建议：</strong><br/>\${escapeHtml(card.bestPractice)}</div>\`;
        }

        cardEl.innerHTML = \`
          <div class="card-header">
            <span class="card-type-tag \${tagClass}">\${tagLabel}</span>
            \${card.sourceFile ? \`<span style="font-size:10px; opacity:0.6;">\${escapeHtml(card.sourceFile)}</span>\` : ''}
          </div>
          <div class="card-title">\${escapeHtml(card.title)}</div>
          <div class="card-summary">\${escapeHtml(card.summary)}</div>
          \${codeHtml}
          <div class="details-toggle" onclick="toggleDeepDive(\${idx})">📖 展开底层原理与破坏性推演 ▼</div>
          <div class="deep-dive" id="deep-dive-\${idx}">
            \${deepDiveSections}
          </div>
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


    function renderInbox() {
      const listEl = document.getElementById('inboxList');
      const badgeEl = document.getElementById('inboxCountBadge');
      const actionsBar = document.getElementById('inboxActionsBar');
      const statusText = document.getElementById('inboxStatusText');

      const count = (inboxData && inboxData.length) || 0;
      badgeEl.innerText = count > 0 ? (count + ' 条待提炼') : '暂存箱空';

      if (statusText) {
        const runningStatus = watcherData && watcherData.isRunning ? '🟢 实时监听中' : '⏸️ 监听已暂停';
        statusText.innerText = runningStatus + '（ChatGPT/Gemini 复制自动入库）';
      }

      listEl.innerHTML = '';

      if (count === 0) {
        actionsBar.style.display = 'none';
        listEl.innerHTML = \`
          <div class="inbox-empty-view">
            <div class="inbox-empty-icon">📋</div>
            <div class="inbox-empty-title">剪贴板后台实时监听中</div>
            <div class="inbox-empty-desc">
              在 ChatGPT、Gemini 等网页复制任意技术对话或代码，LFAI 会像 Ditto 一样自动在此捕获并记录。
            </div>
            <button class="inbox-btn-sm" id="btnTestCapture" style="padding: 4px 10px; font-weight: 600;">
              📥 立即将当前剪贴板收入暂存箱 (测试复制)
            </button>
          </div>
        \`;
        const testBtn = document.getElementById('btnTestCapture');
        if (testBtn) {
          testBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'captureClipboard' });
          });
        }
        return;
      }

      actionsBar.style.display = 'flex';

      inboxData.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'inbox-card' + (index === 0 ? ' newly-captured' : '');

        let typeBadgeClass = 'badge-chat';
        let typeName = '🤖 AI 对话';
        if (item.detectedType === 'code') {
          typeBadgeClass = 'badge-code';
          typeName = '💻 代码块';
        } else if (item.detectedType === 'snippet') {
          typeBadgeClass = 'badge-snippet';
          typeName = '📝 技术片段';
        }

        const timeDisplay = formatRelativeTime(item.timestamp);
        const charsDisplay = (item.charCount || item.content.length) + ' 字符';

        card.innerHTML = \`
          <div class="inbox-card-header">
            <div class="inbox-meta-left">
              <span class="inbox-badge \${typeBadgeClass}">\${typeName}</span>
              <span class="inbox-time">🕒 \${timeDisplay}</span>
              <span class="inbox-chars">(\${charsDisplay})</span>
            </div>
            <span class="inbox-card-del" title="删除此条记录">✕</span>
          </div>
          <div class="inbox-preview-text">\${escapeHtml(item.preview)}</div>
          <div class="inbox-full-box" id="full-box-\${item.id}">
            <pre class="inbox-full-pre">\${escapeHtml(item.content)}</pre>
          </div>
          <div class="inbox-card-footer">
            <div class="inbox-card-actions">
              <button class="inbox-btn-sm toggle-full-btn" data-id="\${item.id}">📖 展开全文 ▼</button>
              <button class="inbox-btn-sm copy-btn" title="重新复制回剪贴板">📋 复制</button>
              <button class="inbox-btn-sm open-doc-btn" title="在 VS Code 编辑器中查看">📄 查看</button>
            </div>
            <button class="inbox-btn-sm inbox-btn-extract-single extract-single-btn" data-id="\${item.id}">⚡ 单独提炼</button>
          </div>
        \`;

        // Event: Delete single item
        card.querySelector('.inbox-card-del').addEventListener('click', (e) => {
          e.stopPropagation();
          vscode.postMessage({ type: 'removeInboxItem', id: item.id });
        });

        // Event: Toggle full text
        const toggleBtn = card.querySelector('.toggle-full-btn');
        const fullBox = card.querySelector('#full-box-' + item.id);
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = fullBox.style.display === 'none' || !fullBox.style.display;
          fullBox.style.display = isHidden ? 'block' : 'none';
          toggleBtn.innerText = isHidden ? '收起全文 ▲' : '📖 展开全文 ▼';
        });

        // Event: Copy content
        card.querySelector('.copy-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          vscode.postMessage({ type: 'copyCode', code: item.content });
        });

        // Event: Open in doc
        card.querySelector('.open-doc-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          vscode.postMessage({ type: 'openInboxItemDoc', id: item.id });
        });

        // Event: Extract single item
        card.querySelector('.extract-single-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          vscode.postMessage({ type: 'extractSingleInboxItem', id: item.id });
        });

        listEl.appendChild(card);
      });
    }

    function formatRelativeTime(ts) {
      if (!ts) return '未知时间';
      const diff = Math.floor((Date.now() - ts) / 1000);
      if (diff < 10) return '刚刚';
      if (diff < 60) return diff + '秒前';
      if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    renderInbox();
    renderWorkSummary();
    renderCards();
  </script>
</body>
</html>`;
  }
}
