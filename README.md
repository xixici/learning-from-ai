<p align="center">
  <img src="resources/banner.png" alt="LFAI — Learning From AI" width="100%"/>
</p>

<h1 align="center">🧠 LFAI</h1>

<p align="center">
  <b>Learning From AI</b>
</p>

<p align="center">
  Ship faster with AI. But actually learn from every line it writes.
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=xixici.lfai">
    <img src="https://img.shields.io/badge/VS_Marketplace-v0.1.5-007ACC?style=flat-square&logo=visual-studio-code" alt="VS Marketplace Version"/>
  </a>
  <a href="https://github.com/xixici/learning-from-ai/releases">
    <img src="https://img.shields.io/github/v/release/xixici/learning-from-ai?style=flat-square&color=blueviolet&logo=github" alt="GitHub Release"/>
  </a>
  <a href="https://github.com/xixici/learning-from-ai/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/xixici/learning-from-ai/ci.yml?branch=main&style=flat-square&label=CI&logo=github-actions" alt="CI Status"/>
  </a>
  <a href="https://github.com/xixici/learning-from-ai/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square" alt="License: MIT"/>
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

> **LFAI** = **L**earning **F**rom **AI**
>
> *Direct. Clear. Meaningful. Let AI write the boilerplate, but make sure YOU learn the craft.*

<p align="center">
  <img src="resources/screenshot-main.png" alt="LFAI Daily Review & Sidebar Interface" width="100%"/>
</p>

---

## The Problem

AI coding tools (GitHub Copilot, Cursor, Claude Code) have created a silent paradox:

> **You ship faster. But you learn slower.**

Every day, AI writes thousands of lines you accept without truly understanding — complex async patterns, architecture decisions, subtle edge guards. Three days later, you can't reproduce or debug them independently.

**LFAI closes that gap.** It automatically turns your daily AI-assisted code into a personalized 5-minute learning session — not generic tutorials, but knowledge extracted from *your own work*.

---

## ✨ Features

### ⚡ Dual-Engine Workflow: Work Delivery + Tech Growth
LFAI recognizes that developers don't need another chore at 6 PM. It bridges work and learning seamlessly:
- **For Work (Public Standup & PR)**: Automatically distills today's engineering changes into 3-5 high-signal bullet points. One click on **"📋 Copy Standup/PR"** copies a clean markdown summary ready for your daily standup, team report, or GitHub PR description.
- **For Growth (Private Knowledge Base)**: Drops all boilerplate and filters out boring CRUD to extract high-density technical cards into your personal knowledge base.

### 🎯 Staff-Level Deep Probing Pillars
Unlike generic code commentators that parrot what the code literally does, LFAI enforces negative filters (no basic syntax, no CRUD storytelling) and applies 4 probing dimensions:
- 💡 **The Why (机制剖析)**: Behind-the-scenes architectural intent — why choose this specific pattern or data flow over naive approaches?
- ⚠️ **Destructive Test (破坏性推演)**: What breaks if you delete this line of defensive code? Under what extreme concurrency, race conditions, or unexpected inputs will it silently crash?
- 📖 **Deep Mechanics (底层原理)**: Event loop microtasks, V8 optimizations, buffer overflow limits, and framework internals.
- ✨ **Best Practices (生产级实践)**: Production trade-offs and modern modern language idioms.
- ❓ **Active Recall Quiz (实战拷问)**: Interactive Anki-style quiz testing real mental models with reveal-on-demand explanations.

### 🔍 Automatic Daily Code Digest
Scans today's Git incremental changes, filters noise (lockfiles, build artifacts, formatting-only diffs), and surfaces the real learning signal.

### 🖥️ Native VS Code Sidebar Panel
- Filter cards by category with one click (Gotchas, Architecture, Syntax, Quiz)
- One-click copy for daily standup / PR deliverables
- Expandable deep-dive blocks (The Why, Destructive Test, Best Practices)
- Interactive quiz mode with reveal-on-demand answers
- Copy code snippets directly to clipboard

### 📝 Markdown Knowledge Base
Every daily digest auto-saves to `.lfai/daily/YYYY-MM-DD.md` — cleanly organized with a **Work Deliverables** section and a **Technical Deep Dive** section. Compatible with **Obsidian**, **Logseq**, **Notion**, and any markdown note-taking tool.

### 🤖 Zero-Config LLM Support
- **VS Code LM API** (default): Uses your existing GitHub Copilot subscription — zero API key required
- **Custom LLM**: DeepSeek, OpenAI, Claude, or any local Ollama endpoint

### ✂️ Selection-Based Instant Learning
Right-click any code selection → **"LFAI: Extract Learning from Selection"** — on-demand deep analysis of any snippet.

---

## 🚀 Quick Start

### Install from VS Marketplace *(Recommended)*
1. Open VS Code
2. Press `Ctrl+Shift+X`
3. Search for **"LFAI"**
4. Click **Install**

### Install from VSIX (Manual)
```bash
code --install-extension lfai-0.1.5.vsix
```

### First Use
1. Open any project with code changes
2. Press `Ctrl+Shift+P` → **`LFAI: Extract Today's Learnings`**
3. Click **"📋 Copy Standup/PR"** to paste your daily report in 5 seconds
4. Check the sidebar (brain icon in Activity Bar) for today's deep-dive learning cards
5. Find your Markdown notes in `.lfai/daily/`

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

Open VS Code Settings (`Ctrl+,`) and search for `@ext:xixici.lfai`:

<p align="center">
  <img src="resources/screenshot-settings.png" alt="LFAI Extension Settings" width="100%"/>
</p>

| Setting | Default | Description |
|---------|---------|-------------|
| `lfai.llmProvider` | `vscode.lm` | LLM backend: `vscode.lm` (Copilot) or `custom` |
| `lfai.customApiBaseUrl` | `https://api.deepseek.com/v1` | Base URL for custom OpenAI-compatible API |
| `lfai.customApiKey` | `""` | API key for custom provider |
| `lfai.customModel` | `deepseek-chat` | Model name for custom provider |
| `lfai.notesDir` | `.lfai/daily` | Directory for Markdown notes (relative to workspace root) |

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `LFAI: Extract Today's Learnings` | Analyze today's git diff and generate learning cards & standup |
| `LFAI: Copy Today's Work Summary & Standup` | Copy formatted daily standup / PR description to clipboard |
| `LFAI: Extract Learning from Selection` | Deep-dive analysis of selected code snippet |
| `LFAI: Open Today's Note` | Open today's Markdown digest file |
| `LFAI: Refresh Sidebar` | Reload the sidebar panel |

---

## 🗺️ Roadmap

- [x] **v0.1.0** — Core extraction engine, sidebar UI, Markdown export
- [x] **v0.1.2** — Dual-engine work delivery & standup copy, Staff-level deep probing prompt architecture, destructive test analysis
- [ ] **v0.2.0** — Spaced repetition (SM-2) scheduler, daily micro-quiz reminders
- [ ] **v0.3.0** — Anki `.apkg` export, Obsidian plugin sync
- [ ] **v0.4.0** — Knowledge growth heatmap calendar
- [ ] **v0.5.0** — Team mode: share learning cards across a shared workspace

---

## 📈 Star History

<p align="center">
  <a href="https://star-history.com/#xixici/learning-from-ai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=xixici/learning-from-ai&type=Date&theme=dark" />
      <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=xixici/learning-from-ai&type=Date" />
      <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=xixici/learning-from-ai&type=Date" width="100%" />
    </picture>
  </a>
</p>

---

## 📄 License

MIT © [LFAI Community](https://github.com/xixici/learning-from-ai)
