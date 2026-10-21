<p align="center">
  <img src="resources/banner.png" alt="LFAI — 从 AI 中学习 (Learning From AI)" width="640"/>
</p>

<h1 align="center">🧠 LFAI</h1>

<p align="center">
  <b>Learning From AI · 从 AI 中学习</b>
</p>

<p align="center">
  别让 AI 替你写走了你的技术成长。从 AI 写的每一行代码中真正吸收知识。
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=lfai-community.lfai">
    <img src="https://img.shields.io/visual-studio-marketplace/v/lfai-community.lfai?style=flat-square&label=VS%20Marketplace&logo=visual-studio-code&color=007ACC" alt="VS Marketplace 版本"/>
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=lfai-community.lfai">
    <img src="https://img.shields.io/visual-studio-marketplace/d/lfai-community.lfai?style=flat-square&color=007ACC&label=安装量" alt="安装量"/>
  </a>
  <a href="https://github.com/xixici/learning-from-ai/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/xixici/learning-from-ai?style=flat-square&color=brightgreen" alt="License: MIT"/>
  </a>
  <a href="https://github.com/xixici/learning-from-ai/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/xixici/learning-from-ai/ci.yml?branch=main&style=flat-square&label=CI&logo=github-actions" alt="CI Status"/>
  </a>
  <a href="https://github.com/xixici/learning-from-ai/releases">
    <img src="https://img.shields.io/github/v/release/xixici/learning-from-ai?style=flat-square&color=blueviolet&logo=github" alt="最新发布"/>
  </a>
</p>

<p align="center">
  <strong>🇨🇳 中文文档</strong> | <a href="README.md">🇺🇸 English</a>
</p>

<p align="center">
  <a href="#核心问题">核心问题</a> •
  <a href="#核心功能">核心功能</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#工作原理">工作原理</a> •
  <a href="#配置说明">配置说明</a> •
  <a href="./CHANGELOG.md">更新日志</a>
</p>

---

> **LFAI** = **L**earning **F**rom **AI**（从 AI 中学习）
>
> *直白、自然、纯粹。让 AI 负责生成代码，但确保你真正学懂背后的知识。*

---

## 核心问题

AI 编程工具（GitHub Copilot、Cursor、Claude Code 等）的普及带来了一个无声的悖论：

> **你交付得更快了，但你成长得更慢了。**

每一天，AI 帮你写下数以千行的代码——复杂的异步模式、精妙的架构决策、隐藏的边界防护——而你只是按下"接受"。三天后面对类似场景，你依然无从下手，无法独立复现，更无法深度调试。

**LFAI 填补这个缺口。** 它把你每天由 AI 辅助写出的代码，自动转化为属于你自己的 5 分钟微学习——不是千篇一律的教程，而是从你自己每天的工作中提炼出的活知识。

---

## ✨ 核心功能

### 🔍 今日代码自动收集
自动扫描当天 Git 增量变更，智能过滤锁文件、构建产物、纯格式化提交等噪声，只提取真正有学习价值的代码信号。

### 🧩 四维立体学习卡片

| 卡片类型 | 提炼内容 |
|---------|---------|
| 💡 **语法与惯用法** | 你用了但可能没真正吃透的语言特性、高级 API 与编程模式 |
| 🏗️ **架构与权衡** | 代码为什么这样组织——设计决策背后的逻辑与代价 |
| ⚠️ **踩坑与边界防护** | AI 生成代码中隐藏的竞态条件、异常防护与遗漏的边界处理 |
| ❓ **主动回忆自测** | Anki 风格的问答卡片，含提示与深度解析，用于检验真实掌握程度 |

### 🖥️ 原生 VS Code 侧边栏看板

- 按分类一键过滤卡片
- 折叠/展开深度原理剖析，按需获取
- 交互式问答模式，答案按需揭示
- 直接复制代码切片至剪贴板

### 📝 Markdown 知识库沉淀
每日复盘记录自动保存为 `.lfai/daily/YYYY-MM-DD.md` 标准 Markdown 文件，天然兼容 **Obsidian**、**Logseq**、**Notion** 等任意笔记工具。

### 🤖 零门槛双通道模型接入
- **VS Code LM API**（默认）：直接复用已有的 GitHub Copilot 订阅，无需任何额外配置
- **自定义 LLM**：DeepSeek、OpenAI、Claude，或任何本地 Ollama 端点

### ✂️ 划词即时提炼
右键选中任意代码片段 → **「LFAI: 提炼当前选中代码深度原理」** — 随时获取任意代码的即时深度剖析。

---

## 🚀 快速开始

### 手动 VSIX 安装
```bash
code --install-extension lfai-0.1.0.vsix
```

### 第一次使用
1. 打开任意有代码变更的项目
2. 按 `Ctrl+Shift+P` → **`LFAI: 提炼今日代码与 AI 考点`**
3. 在侧边栏（活动栏大脑图标）查看今日卡片
4. 在 `.lfai/daily/` 目录下找到自动生成的 Markdown 笔记

---

## ⚙️ 配置说明

打开 VS Code 设置（`Ctrl+,`），搜索 `lfai`：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `lfai.llmProvider` | `vscode.lm` | LLM 后端：`vscode.lm`（Copilot）或 `custom`（自定义） |
| `lfai.customApiBaseUrl` | `https://api.deepseek.com/v1` | 自定义 OpenAI 兼容 API 的基础 URL |
| `lfai.customApiKey` | `""` | 自定义 LLM 提供方的 API Key |
| `lfai.customModel` | `deepseek-chat` | 自定义模型名称 |
| `lfai.notesDir` | `.lfai/daily` | Markdown 笔记保存目录（相对工作区根目录） |

---

## 📋 命令列表

| 命令 | 说明 |
|------|------|
| `LFAI: 提炼今日代码与 AI 考点` | 分析今日 Git 变更并生成学习卡片 |
| `LFAI: 提炼当前选中代码深度原理` | 对选中代码片段进行即时深度剖析 |
| `LFAI: 打开今日学习笔记` | 打开今日自动生成的 Markdown 复盘文件 |
| `LFAI: 刷新今日学习看板` | 重新加载侧边栏面板 |

---

## 📄 许可证

MIT © [LFAI Community](https://github.com/xixici/learning-from-ai)
