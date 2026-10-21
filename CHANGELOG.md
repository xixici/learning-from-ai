# Changelog

All notable changes to **Learning from AI (L4AI)** will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Spaced repetition (SM-2) scheduler for daily review reminders
- Anki `.apkg` export
- Knowledge growth heatmap calendar in sidebar
- Team/workspace-shared learning card mode

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

[Unreleased]: https://github.com/l4ai/learning-from-ai/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/l4ai/learning-from-ai/releases/tag/v0.1.0
