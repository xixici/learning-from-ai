# Changelog

All notable changes to **LFAI — Learning From AI** will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Spaced repetition (SM-2) scheduler for daily review reminders
- Anki `.apkg` export
- Knowledge growth heatmap calendar in sidebar
- Team/workspace-shared learning card mode

---
## [0.1.8] — 2026-11-03

### Added
- **Date-Based Multi-Dimensional Archiving (按日期全方位归档机制)**:
  - Daily Markdown notes now automatically sync structured snapshots to `.lfai/history/YYYY-MM-DD.json` for lossless historical retrieval.
  - Clipboard inbox captures are now archived daily into `.lfai/inbox/YYYY-MM-DD.json` while maintaining the active unread pool.
- **Date Picker & Historical Timeline Navigation (日期选择器与历史复盘导航)**:
  - Sidebar header now integrates a responsive Date Navigator with `◀ Previous Day`, `Next Day ▶`, native date input picker, and one-click `Today` jump.
  - Switching to any historical date instantly reloads its daily deliverables, learning cards, and clipboard archive.
  - New command: `LFAI: 选择历史日期查看复盘看板` (`lfai.selectDate`).
- **Weekly & Monthly Report Engine (周报与月报自动汇总引擎)**:
  - Natural ISO week (`YYYY-Www`) and month (`YYYY-MM`) aggregator automatically merging cross-day deliverables.
  - Intelligent cross-day deduplication, grouping by client/project with unified `1, 2, 3, 4` sequential numbering and clean indentation.
  - Aggregates top-tier architecture & gotcha flashcards into periodic digests.
  - Automatically saves formatted Markdown reports to `.lfai/weekly/` and `.lfai/monthly/`.
  - Built-in preview modal in sidebar with one-click clipboard copy (`📋 复制此汇报到剪贴板`) and document viewer (`📝 查看 Markdown 报告`).
  - 6 new commands: `lfai.generateWeeklyReport`, `lfai.copyWeeklyReport`, `lfai.openWeeklyReport`, `lfai.generateMonthlyReport`, `lfai.copyMonthlyReport`, `lfai.openMonthlyReport`.

---
## [0.1.7] — 2026-11-02

### Added
- **Hierarchical Daily Report Layout (结构化日报排版与编号缩进)**:
  - Overhauled extraction prompts to produce structured `dailyReportText` split into `客户工作：` (Client Work) and `技术工作：` (Engineering).
  - Sequential numerical numbering (`1, 2, 3, 4`) for customer/project lines, with indented action items formatted for chat/email reports.
  - `📋 复制日报/PR` one-click action now directly copies clean indented plaintext ready for immediate pasting into team chats.
  - Native sidebar and Markdown note rendering for structured daily reports.
- **Dedicated LLM Output Channel & Adaptive Timeout (模型调用日志流与自适应超时控制)**:
  - Integrated `LFAI: LLM 模型调用日志` output channel (`lfai.openLLMLog`) tracking request duration, model name, HTTP status, and detailed token consumption (including `reasoning_tokens` for deep reasoning models).
  - New configuration `lfai.customApiTimeout` with default extended from 60s to 180s (3 minutes) to support long thinking chains.
  - Error notification now includes a **"查看详细日志"** button for instant troubleshooting.
  - Strict privacy sanitization and API key masking across all log streams and prompt examples.

---
## [0.1.6] — 2026-11-02

### Added
- **Visual Clipboard Monitor & History Panel (剪贴板监听与复制记录可视化面板)**:
  - Permanent, interactive clipboard inbox panel in sidebar with real-time status light (`🟢 实时监听中`), pending count badge, and collapsible view.
  - Rich card layout for every captured clipboard entry:
    - Category badges (`🤖 AI 对话`, `💻 代码块`, `📝 技术片段`)
    - Relative timestamps (`刚刚`, `X分钟前`, `HH:mm:ss`) and character count display
    - Inline full-text expander (`📖 展开全文 ▼`) to inspect long conversations directly without truncation
    - Single item quick actions: `⚡ 单独提炼`, `📋 复制`, `📄 独立窗口查看`, `✕ 删除`
  - User-friendly empty state with one-click `📥 立即将当前剪贴板收入暂存箱 (测试复制)` verification button.
- **Broadened Heuristic Filtering & Force Capture (智能特征扩充与强制收录模式)**:
  - Greatly expanded technical keyword library and programming syntax detectors, eliminating silent drops on valid technical discussions.
  - Manual capture command `lfai.captureClipboardNow` now runs in forced mode, guaranteeing capture of user-selected clipboard text.
- **Dedicated Clipboard Logger & Output Channel (剪贴板监听实时日志流)**:
  - Integrated `LFAI: 剪贴板监听日志` output channel tracking every clipboard change event, capture status, and filter reason in real time.
  - New commands: `lfai.showClipboardRecords`, `lfai.openClipboardLog`, `lfai.openInboxItemDoc`, `lfai.extractSingleInboxItem`.

---

## [0.1.5] — 2026-10-28

### Added
- **Ditto-Style Background Clipboard Watcher (剪贴板智能常驻监听与暂存)**:
  - Background daemon automatically listens for OS clipboard updates without blocking or manual pasting.
  - Captures high-value technical discussions and Q&A from ChatGPT, Gemini, and Claude directly into local inbox (`.lfai/inbox/items.json`).
  - Window focus sensing: automatically sniffs clipboard immediately upon returning to VS Code.
- **AI Dialog & Heuristic Content Filter (智能特征过滤与敏感数据防护)**:
  - Automatically filters out passwords, private keys, API tokens (`ghp_`, `sk-`, `AKIA`, SSH keys), and short noise.
  - Detects code blocks, AI role markers (`ChatGPT:`, `User:`, `Assistant:`), and deep-dive technical keywords in Chinese and English.
- **Inbox Knowledge Buffer & Batch Extraction (知识暂存箱与批量提炼)**:
  - Dedicated **📥 AI 知识暂存箱** component in the VS Code sidebar with live count, preview list, and one-click deletion.
  - One-click batch extraction command `LFAI: 批量提炼暂存箱中的技术对话` (`lfai.extractInbox`), digesting multiple external AI chats into Staff-level learning cards.
  - Status bar indicator dynamically displays pending inbox items count alongside daily cards.
  - New manual capture command `LFAI: 立即捕获当前剪贴板入暂存箱` (`lfai.captureClipboardNow`).

---

## [0.1.4] — 2026-10-28

### Security
- Escape JSON embedded in webview script tag to eliminate potential XSS risk.
- Fix `CancellationTokenSource` leak in `callVsCodeLM`.
- Switch synchronous `fs` methods to non-blocking `fs/promises` in `noteManager`.

### Reliability
- Robust LLM JSON response extraction using regex matching instead of prefix checking.
- Add error boundary with user notification to `extractSelection` command.
- Add 60-second fetch timeout for custom OpenAI-compatible API requests.
- Add `isExtracting` state mutex guard to prevent overlapping concurrent extraction operations.
- Add detailed error logging for Git command failures.

### Performance
- Retrieve Git diff and commit log concurrently with `Promise.all`.
- Optimize diff filtering to eliminate redundant array/set conversions.
- Remove redundant directory existence check before recursive `mkdir`.

### Engineering
- Streamline extension package bundle by excluding documentation assets in `.vscodeignore`.
- Configure empty `activationEvents` array for modern VS Code lazy activation.

---


## [0.1.3] — 2026-10-21

### Fixed
- Fixed release naming convention in CI/CD pipeline to strictly use `🧠 LFAI <tag>`.
- Corrected all community issue templates, conduct guidelines, and license references from legacy `l4ai` to official `LFAI`.
- Streamlined GitHub Actions release packaging workflow to ensure automatic `.vsix` bundling and artifact attachment.

---

## [0.1.2] — 2026-10-21

### Added
- **Dual-Engine Work & Learning Paradigm (双轨驱动工作流)**:
  - **Work Deliverables (Standup & PR Ready)**: Automatically summarizes today's completed engineering milestones into 3-5 bullet points ready for daily standups, team reports, or PR descriptions.
  - **New Command**: `LFAI: 复制今日工作交付与 Standup 到剪贴板` (`lfai.copyDailyStandup`).
  - **Quick Action**: Added `📋 复制日报/PR` button directly inside the VS Code sidebar header.
- **Deep Probing Prompt Architecture (深水区架构级探针)**:
  - Completely overhauled LLM extraction prompt with Staff Engineer quality rubrics and strict negative constraints (discarding trivial CRUD and basic syntax explanations).
  - Every card now extracts **💡 机制剖析 (The Why)**, **⚠️ 破坏性推演 (Destructive Test / What if removed)**, and **✨ 最佳实践建议 (Best Practice)**.
  - Enhanced Active Recall Quiz with real-world failure mode reasoning and architectural trade-offs.
- **Interactive UI & Dual-Track Markdown**:
  - Collapsible **Work Deliverables** block in the sidebar.
  - Multi-section deep-dive toggle revealing The Why, Destructive Test, and Best Practices.
  - Clean separation in Markdown notes between public work deliverables and private personal learning assets.

### Changed
- Refined badge endpoints and added official extension screenshots in documentation.
- Defaulted sub-process execution buffer to 10MB to handle large repository diffs reliably.

---

## [0.1.1] — 2026-10-21

### Added
- Official 512x512 neural brain icon extracted from banner design (`resources/icon.png`, `resources/icon.svg`).
- Interactive Star History trend chart added to both English and Chinese READMEs.
- High-resolution rendered banner asset for Marketplace compatibility.

### Changed
- Configured official publisher as `xixici`.
- Updated all repository references and documentation to `xixici/learning-from-ai`.

---

## [0.1.0] — 2026-10-21

### Added
- **Git Diff Collector**: Automatically collects today's incremental code changes from the current workspace Git repository. Intelligently filters lockfiles, build artifacts, and formatting-only diffs.
- **Selection Collector**: Right-click any code selection → instant deep-dive extraction of core concepts, patterns, and gotchas.
- **4-Dimensional LLM Extraction Engine**:
  - 💡 **Syntax & Idioms** — language features and advanced API patterns
  - 🏗️ **Architecture & Trade-offs** — design decisions and their consequences
  - ⚠️ **Gotchas & Edge Cases** — hidden guards and subtle risks in AI-generated code
  - ❓ **Active Recall Quiz** — Anki-style Q&A with hints and explanations
- **Dual-Channel LLM Client**:
  - Primary: VS Code Language Model API (`vscode.lm`) — zero config, uses existing Copilot subscription
  - Fallback: Custom OpenAI-compatible endpoint (DeepSeek, Claude, Ollama, etc.)
  - Intelligent graceful degradation with rich demo cards when no LLM is available
- **Native Sidebar Webview Panel**: Interactive knowledge card browser with category filters, collapsible deep-dives, and quiz mode.
- **Markdown Knowledge Base**: Auto-saves daily digest to `.l4ai/daily/YYYY-MM-DD.md` — compatible with Obsidian, Logseq, and Notion.
- **Status Bar Indicator**: Shows today's card count; click to trigger extraction.
- **4 Commands registered**:
  - `L4AI: Extract Today's Learnings`
  - `L4AI: Extract Learning from Selection`
  - `L4AI: Open Today's Note`
  - `L4AI: Refresh Sidebar`
- **Configuration options**: LLM provider, custom API base URL, API key, model name, notes directory.
- **Context menu integration**: Right-click editor selection to extract learning instantly.

---

[Unreleased]: https://github.com/xixici/learning-from-ai/compare/v0.1.8...HEAD
[0.1.8]: https://github.com/xixici/learning-from-ai/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/xixici/learning-from-ai/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/xixici/learning-from-ai/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/xixici/learning-from-ai/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/xixici/learning-from-ai/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/xixici/learning-from-ai/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/xixici/learning-from-ai/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/xixici/learning-from-ai/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/xixici/learning-from-ai/releases/tag/v0.1.0
