<p align="center">
  <img src="resources/banner.png" alt="L4AI — Learning from AI Era" width="640"/>
</p>

<h1 align="center">🧠 L4AI</h1>

<p align="center">
  <b>Learning from AI Era</b>
</p>

<p align="center">
  Ship faster with AI. But actually learn from what AI writes.
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=l4ai-community.learning-from-ai">
    <img src="https://img.shields.io/visual-studio-marketplace/v/l4ai-community.learning-from-ai?style=flat-square&label=VS%20Marketplace&logo=visual-studio-code&color=007ACC" alt="VS Marketplace Version"/>
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=l4ai-community.learning-from-ai">
    <img src="https://img.shields.io/visual-studio-marketplace/d/l4ai-community.learning-from-ai?style=flat-square&color=007ACC&label=Installs" alt="VS Marketplace Downloads"/>
  </a>
  <a href="https://github.com/l4ai/learning-for-the-ai-era/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/l4ai/learning-for-the-ai-era?style=flat-square&color=brightgreen" alt="License: MIT"/>
  </a>
  <a href="https://github.com/l4ai/learning-for-the-ai-era/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/l4ai/learning-for-the-ai-era/ci.yml?branch=main&style=flat-square&label=CI&logo=github-actions" alt="CI Status"/>
  </a>
  <a href="https://github.com/l4ai/learning-for-the-ai-era/releases">
    <img src="https://img.shields.io/github/v/release/l4ai/learning-for-the-ai-era?style=flat-square&color=blueviolet&logo=github" alt="GitHub Release"/>
  </a>
</p>

<p align="center">
  <a href="README.zh-CN.md">🇨🇳 中文文档</a> | <strong>🇺🇸 English</strong>
</p>

<p align="center">
  <a href="#-the-problem">The Problem</a> •
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-configuration">Configuration</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="./CHANGELOG.md">Changelog</a>
</p>

---

> **L4AI** = **L**earning **4**[from] the **AI** era (Learning from AI Era)
>
> *“4” 在口语和网络极简命名中巧妙融合了“for/from”的双重意涵：既是 Learn FROM AI（向 AI 产出的代码学习），又是 Learn FOR the AI Era（为了 AI 时代自我成长而学）。*

---

## The Problem

AI coding tools (GitHub Copilot, Cursor, Claude Code) have created a silent paradox:

> **You ship faster. But you learn slower.**

Every day, AI writes thousands of lines you accept without truly understanding — complex async patterns, architecture decisions, subtle edge guards. Three days later, you can't reproduce or debug them independently.

This isn't laziness. **It's a structural gap in the AI-era workflow.** There's no natural moment where understanding is required before code gets merged.

**L4AI closes that gap.** It automatically turns your daily AI-assisted code into a personalized 5-minute learning session — not generic tutorials, but knowledge extracted from *your own work*.

---

## ✨ Features

### 🔍 Automatic Daily Code Digest
Scans today's Git incremental changes, filters noise (lockfiles, build artifacts, formatting-only diffs), and surfaces the real learning signal.

### 🧩 4-Dimensional Learning Cards

| Card Type | What it captures |
|-----------|-----------------|
| 💡 **Syntax & Idioms** | Language features, advanced APIs, and patterns you used but might not fully grasp |
| 🏗️ **Architecture & Trade-offs** | Why the code is structured this way — decisions and their consequences |
| ⚠️ **Gotchas & Edge Cases** | Hidden guard clauses, race conditions, and silent risks in AI-generated code |
| ❓ **Active Recall Quiz** | Anki-style Q&A with hints and detailed explanations — so you verify you actually know it |

### 🖥️ Native VS Code Sidebar Panel

<p align="center">
  <img src="resources/screenshot-sidebar.png" alt="L4AI Sidebar Screenshot" width="380"/>
</p>

- Filter cards by category with one click
- Expand/collapse deep-dive explanations on demand
- Interactive quiz mode with reveal-on-demand answers
- Copy code snippets directly to clipboard

### 📝 Markdown Knowledge Base
Every daily digest auto-saves to `.l4ai/daily/YYYY-MM-DD.md` — plain Markdown, compatible with **Obsidian**, **Logseq**, **Notion**, and any note-taking tool.

### 🤖 Zero-Config LLM Support
- **VS Code LM API** (default): Uses your existing GitHub Copilot subscription — no API key needed
- **Custom LLM**: DeepSeek, OpenAI, Claude, or any local Ollama endpoint

### ✂️ Selection-Based Instant Learning
Right-click any code selection → **"L4AI: Extract Learning from Selection"** — on-demand deep analysis of any snippet.

---

## 🚀 Quick Start

### Install from VS Marketplace *(Recommended)*
1. Open VS Code
2. Press `Ctrl+Shift+X`
3. Search for **"L4AI"**
4. Click **Install**

### Install from VSIX (Manual)
```bash
code --install-extension learning-from-ai-0.1.0.vsix
```

### First Use
1. Open any project with code changes
2. Press `Ctrl+Shift+P` → **`L4AI: Extract Today's Learnings`**
3. Check the sidebar (brain icon in Activity Bar) for today's cards
4. Find your Markdown notes in `.l4ai/daily/`

---

## 🔧 How It Works

```
Your Code Changes (Git Diff / Selection)
         │
         ▼
   ┌─────────────────┐
   │  Data Collector  │  ← filters noise, builds context
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  LLM Engine     │  ← 4-dimensional extraction prompt
   │  (vscode.lm /   │
   │   Custom API)   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  Knowledge Base │  ← Markdown files + workspace cache
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  Sidebar UI     │  ← Interactive cards & quiz mode
   └─────────────────┘
```

---

## ⚙️ Configuration

Open VS Code Settings (`Ctrl+,`) and search for `l4ai`:

| Setting | Default | Description |
|---------|---------|-------------|
| `l4ai.llmProvider` | `vscode.lm` | LLM backend: `vscode.lm` (Copilot) or `custom` |
| `l4ai.customApiBaseUrl` | `https://api.deepseek.com/v1` | Base URL for custom OpenAI-compatible API |
| `l4ai.customApiKey` | `""` | API key for custom provider |
| `l4ai.customModel` | `deepseek-chat` | Model name for custom provider |
| `l4ai.notesDir` | `.l4ai/daily` | Directory for Markdown notes (relative to workspace root) |

### Example: Using DeepSeek

```json
{
  "l4ai.llmProvider": "custom",
  "l4ai.customApiBaseUrl": "https://api.deepseek.com/v1",
  "l4ai.customApiKey": "sk-your-key-here",
  "l4ai.customModel": "deepseek-chat"
}
```

### Example: Using Local Ollama

```json
{
  "l4ai.llmProvider": "custom",
  "l4ai.customApiBaseUrl": "http://localhost:11434/v1",
  "l4ai.customApiKey": "ollama",
  "l4ai.customModel": "llama3.1:8b"
}
```

---

## 🤝 Contributing

Contributions are very welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

### Development Setup

```bash
git clone https://github.com/l4ai/learning-for-the-ai-era.git
cd learning-for-the-ai-era
npm install
npm run build          # dev build with source maps
npm run package        # production build
npm run package:vsix   # package as installable VSIX
npm run build -- --watch  # watch mode
```

### Project Structure

```
l4ai/
├── src/
│   ├── extension.ts              # Entry point & command registration
│   ├── types.ts                  # Shared TypeScript types
│   ├── collector/
│   │   ├── gitCollector.ts       # Git diff & workspace code collector
│   │   └── selectionCollector.ts # Active editor selection collector
│   ├── engine/
│   │   ├── llmClient.ts          # Dual-channel LLM client (vscode.lm + custom)
│   │   └── prompt.ts             # 4-dimensional extraction prompt engineering
│   ├── storage/
│   │   └── noteManager.ts        # Markdown persistence & workspace state cache
│   └── ui/
│       └── sidebarProvider.ts    # Webview sidebar panel & interactive UI
├── resources/                    # Icons and static assets
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # CI: build, typecheck, lint on every PR
│   │   └── release.yml           # Release: auto-package & publish on version tag
│   └── ISSUE_TEMPLATE/
├── package.json
├── tsconfig.json
├── esbuild.js
└── CHANGELOG.md
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Anki export support
fix: handle empty git diff gracefully
docs: update configuration examples
chore: bump esbuild to 0.24
```

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `L4AI: Extract Today's Learnings` | Analyze today's git diff and generate learning cards |
| `L4AI: Extract Learning from Selection` | Deep-dive analysis of selected code snippet |
| `L4AI: Open Today's Note` | Open today's Markdown digest file |
| `L4AI: Refresh Sidebar` | Reload the sidebar panel |

---

## 🗺️ Roadmap

- [x] **v0.1** — Core extraction engine, sidebar UI, Markdown export
- [ ] **v0.2** — Spaced repetition (SM-2) scheduler, daily review reminders
- [ ] **v0.3** — Anki `.apkg` export, Obsidian plugin sync
- [ ] **v0.4** — Knowledge growth heatmap calendar
- [ ] **v0.5** — Team mode: share learning cards across a shared workspace

---

## 📄 License

MIT © [L4AI Community](https://github.com/l4ai)

---

<p align="center">
  Built for developers who ship with AI — and still want to grow.
</p>
