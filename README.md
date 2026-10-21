<p align="center">
  <img src="resources/banner.png" alt="Learning from AI (L4AI) Banner" width="640"/>
</p>

<h1 align="center">🧠 Learning from AI — L4AI</h1>

<p align="center">
  <strong>Stop letting AI write your knowledge gap. Start learning from every line it writes.</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=l4ai-community.learning-from-ai">
    <img src="https://img.shields.io/visual-studio-marketplace/v/l4ai-community.learning-from-ai?style=flat-square&label=VS%20Marketplace&logo=visual-studio-code&color=007ACC" alt="VS Marketplace Version"/>
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=l4ai-community.learning-from-ai">
    <img src="https://img.shields.io/visual-studio-marketplace/d/l4ai-community.learning-from-ai?style=flat-square&color=007ACC&label=Installs" alt="VS Marketplace Downloads"/>
  </a>
  <a href="https://github.com/l4ai/learning-from-ai/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/l4ai/learning-from-ai?style=flat-square&color=brightgreen" alt="License: MIT"/>
  </a>
  <a href="https://github.com/l4ai/learning-from-ai/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/l4ai/learning-from-ai/ci.yml?branch=main&style=flat-square&label=CI&logo=github-actions" alt="CI Status"/>
  </a>
  <a href="https://github.com/l4ai/learning-from-ai/releases">
    <img src="https://img.shields.io/github/v/release/l4ai/learning-from-ai?style=flat-square&color=blueviolet&logo=github" alt="GitHub Release"/>
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-configuration">Configuration</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="./CHANGELOG.md">Changelog</a>
</p>

---

## The Problem

The rise of AI coding tools (GitHub Copilot, Cursor, Claude Code) has created a paradox:

> **You ship faster, but learn slower.**

Every day, AI writes thousands of lines you accept without truly understanding — complex async patterns, architecture decisions, subtle gotchas. Three days later, you can't reproduce or debug them. The **skill erosion is silent and cumulative.**

## The Solution

**L4AI** is a VS Code extension that automatically turns your daily AI-assisted code into personalized learning cards. It hooks into your Git diff and workspace context, then uses LLM reasoning to extract exactly what *you* should learn from *today's* code — not generic tutorials, but knowledge from *your own work*.

---

## ✨ Features

### 🔍 Automatic Daily Code Digest
L4AI scans your today's Git incremental changes and workspace context, filters out noise (lockfiles, build artifacts, formatting), and surfaces the real learning signal.

### 🧩 4-Dimensional Learning Cards

| Card Type | What it extracts |
|-----------|-----------------|
| 💡 **Syntax & Idioms** | Language features, advanced APIs, and patterns you used but might not fully grasp |
| 🏗️ **Architecture & Trade-offs** | Why the code is structured this way — design decisions and their consequences |
| ⚠️ **Gotchas & Edge Cases** | Hidden guard clauses, race conditions, and edge handling in AI-generated code |
| ❓ **Active Recall Quiz** | Anki-style Q&A cards with hints and detailed explanations for self-testing |

### 🖥️ Native VS Code Sidebar Panel

<p align="center">
  <img src="resources/screenshot-sidebar.png" alt="L4AI Sidebar Screenshot" width="380"/>
</p>

- Filter cards by category with one click
- Expand/collapse deep-dive explanations
- Interactive quiz mode with reveal-on-demand answers
- Copy code snippets directly to clipboard

### 📝 Markdown Knowledge Base
Every daily digest is automatically saved to `.l4ai/daily/YYYY-MM-DD.md` — plain Markdown files that work natively with **Obsidian**, **Logseq**, **Notion**, and any note-taking tool.

### 🤖 Zero-Config LLM Support
- **VS Code LM API** (default): Uses your existing GitHub Copilot subscription — no API key needed
- **Custom LLM**: DeepSeek, OpenAI, Claude, or any local Ollama endpoint

### ✂️ Selection-Based Instant Learning
Right-click any code selection → **"L4AI: Extract Learning from Selection"** — get instant deep-dive analysis of any snippet.

---

## 🚀 Quick Start

### Install from VS Marketplace *(Recommended)*
1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for **"Learning from AI"**
4. Click **Install**

### Install from VSIX (Manual)
```bash
code --install-extension learning-from-ai-0.1.0.vsix
```

### First Use
1. Open any project with code changes
2. Press `Ctrl+Shift+P` → **`L4AI: Extract Today's Learnings`**
3. Check your sidebar (brain icon in Activity Bar) for today's cards
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
| `l4ai.notesDir` | `.l4ai/daily` | Directory for Markdown notes (relative to workspace) |

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
# Clone the repo
git clone https://github.com/l4ai/learning-from-ai.git
cd learning-from-ai

# Install dependencies
npm install

# Build (development mode with source maps)
npm run build

# Build for production
npm run package

# Package as VSIX
npm run package:vsix

# Watch mode for development
npm run build -- --watch
```

### Project Structure

```
learning-from-ai/
├── src/
│   ├── extension.ts              # Extension entry point & command registration
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
│   ├── ISSUE_TEMPLATE/           # Bug report & feature request templates
│   └── PULL_REQUEST_TEMPLATE.md  # PR checklist
├── package.json                  # Extension manifest & npm scripts
├── tsconfig.json                 # TypeScript config
├── esbuild.js                    # Build bundler config
└── CHANGELOG.md                  # Version history
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

- [x] **v0.1** — Core extraction, sidebar UI, Markdown export
- [ ] **v0.2** — Spaced repetition scheduler (SM-2), daily quiz reminders
- [ ] **v0.3** — Anki `.apkg` export, Obsidian plugin sync
- [ ] **v0.4** — Knowledge growth heatmap calendar
- [ ] **v0.5** — Team mode: share learning cards across workspace

---

## 📄 License

MIT © [L4AI Community](https://github.com/l4ai)

---

<p align="center">
  Made with ❤️ for developers who want to grow faster in the AI era
</p>
