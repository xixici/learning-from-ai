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

[Unreleased]: https://github.com/xixici/learning-from-ai/compare/v0.1.5...HEAD
[0.1.5]: https://github.com/xixici/learning-from-ai/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/xixici/learning-from-ai/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/xixici/learning-from-ai/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/xixici/learning-from-ai/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/xixici/learning-from-ai/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/xixici/learning-from-ai/releases/tag/v0.1.0
