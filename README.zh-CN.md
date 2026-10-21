<p align="center">
  <img src="resources/banner.png" alt="L4AI — 为 AI 时代而学习" width="640"/>
</p>

<h1 align="center">🧠 L4AI</h1>

<p align="center">
  <b>Learning for the AI Era · 为 AI 时代而学习</b>
</p>

<p align="center">
  用 AI 更快地交付，同时真正学到东西。
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=l4ai-community.learning-from-ai">
    <img src="https://img.shields.io/visual-studio-marketplace/v/l4ai-community.learning-from-ai?style=flat-square&label=VS%20Marketplace&logo=visual-studio-code&color=007ACC" alt="VS Marketplace 版本"/>
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=l4ai-community.learning-from-ai">
    <img src="https://img.shields.io/visual-studio-marketplace/d/l4ai-community.learning-from-ai?style=flat-square&color=007ACC&label=安装量" alt="安装量"/>
  </a>
  <a href="https://github.com/l4ai/learning-for-the-ai-era/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/l4ai/learning-for-the-ai-era?style=flat-square&color=brightgreen" alt="License: MIT"/>
  </a>
  <a href="https://github.com/l4ai/learning-for-the-ai-era/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/l4ai/learning-for-the-ai-era/ci.yml?branch=main&style=flat-square&label=CI&logo=github-actions" alt="CI 状态"/>
  </a>
  <a href="https://github.com/l4ai/learning-for-the-ai-era/releases">
    <img src="https://img.shields.io/github/v/release/l4ai/learning-for-the-ai-era?style=flat-square&color=blueviolet&logo=github" alt="最新发布"/>
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
  <a href="#参与贡献">参与贡献</a> •
  <a href="./CHANGELOG.md">更新日志</a>
</p>

---

> **L4AI** = **L**earning **4**[for] the **AI** era — 为 AI 时代而学习
>
> *「4」不是笔误，是一种表态。就像 `i18n`、`a11y`、`w3c`，它是一种意图的压缩：我们在为与 AI 并肩编程、同时依然渴望持续成长的开发者而构建。*

---

## 核心问题

AI 编程工具（GitHub Copilot、Cursor、Claude Code 等）的普及带来了一个无声的悖论：

> **你交付得更快了，但你成长得更慢了。**

每一天，AI 帮你写下数以千行的代码——复杂的异步模式、精妙的架构决策、隐藏的边界防护——而你只是按下"接受"。三天后面对类似的场景，你依然无从下手，无法独立复现，更无法深度调试。

这不是懒惰。**这是 AI 时代工作流中的一个结构性缺口**——在代码被合并之前，没有任何环节强制要求你真正理解它。

**L4AI 填补这个缺口。** 它把你每天 AI 辅助写出的代码，自动转化为一个个属于你的 5 分钟微学习——不是千篇一律的教程，而是从你自己每天的工作中提炼出的活知识。

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

<p align="center">
  <img src="resources/screenshot-sidebar.png" alt="L4AI 侧边栏截图" width="380"/>
</p>

- 按分类一键过滤卡片
- 折叠/展开深度原理剖析，按需获取
- 交互式问答模式，答案按需揭示
- 直接复制代码切片至剪贴板

### 📝 Markdown 知识库沉淀
每日复盘记录自动保存为 `.l4ai/daily/YYYY-MM-DD.md` 标准 Markdown 文件，天然兼容 **Obsidian**、**Logseq**、**Notion** 等任意笔记工具。

### 🤖 零门槛双通道模型接入
- **VS Code LM API**（默认）：直接复用已有的 GitHub Copilot 订阅，无需任何额外配置
- **自定义 LLM**：DeepSeek、OpenAI、Claude，或任何本地 Ollama 端点

### ✂️ 划词即时提炼
右键选中任意代码片段 → **「L4AI: 提炼当前选中代码深度原理」** — 随时获取任意代码的即时深度剖析。

---

## 🚀 快速开始

### 从 VS Marketplace 安装（推荐）
1. 打开 VS Code
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 **"L4AI"**
4. 点击 **安装**

### 手动 VSIX 安装
```bash
code --install-extension learning-from-ai-0.1.0.vsix
```

### 第一次使用
1. 打开任意有代码变更的项目
2. 按 `Ctrl+Shift+P` → **`L4AI: 提炼今日代码与 Codex 考点`**
3. 在侧边栏（活动栏大脑图标）查看今日卡片
4. 在 `.l4ai/daily/` 目录下找到自动生成的 Markdown 笔记

---

## 🔧 工作原理

```
你的代码变更（Git Diff / 选区）
         │
         ▼
   ┌─────────────────┐
   │   数据收集层    │  ← 过滤噪声，构建上下文
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │   LLM 分析引擎  │  ← 四维认知提炼 Prompt
   │  (vscode.lm /   │
   │   自定义 API)   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │   知识库存储    │  ← Markdown 文件 + 工作区缓存
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │   侧边栏 UI     │  ← 交互式卡片 & 自测模式
   └─────────────────┘
```

---

## ⚙️ 配置说明

打开 VS Code 设置（`Ctrl+,`），搜索 `l4ai`：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `l4ai.llmProvider` | `vscode.lm` | LLM 后端：`vscode.lm`（Copilot）或 `custom`（自定义） |
| `l4ai.customApiBaseUrl` | `https://api.deepseek.com/v1` | 自定义 OpenAI 兼容 API 的基础 URL |
| `l4ai.customApiKey` | `""` | 自定义 LLM 提供方的 API Key |
| `l4ai.customModel` | `deepseek-chat` | 自定义模型名称 |
| `l4ai.notesDir` | `.l4ai/daily` | Markdown 笔记保存目录（相对工作区根目录） |

### 示例：使用 DeepSeek

```json
{
  "l4ai.llmProvider": "custom",
  "l4ai.customApiBaseUrl": "https://api.deepseek.com/v1",
  "l4ai.customApiKey": "sk-your-key-here",
  "l4ai.customModel": "deepseek-chat"
}
```

### 示例：使用本地 Ollama

```json
{
  "l4ai.llmProvider": "custom",
  "l4ai.customApiBaseUrl": "http://localhost:11434/v1",
  "l4ai.customApiKey": "ollama",
  "l4ai.customModel": "llama3.1:8b"
}
```

---

## 🤝 参与贡献

我们非常欢迎社区贡献！请先阅读 [贡献指南](CONTRIBUTING.md)。

### 本地开发环境搭建

```bash
git clone https://github.com/l4ai/learning-for-the-ai-era.git
cd learning-for-the-ai-era
npm install
npm run build          # 开发构建（含 Source Map）
npm run package        # 生产构建（压缩，无 Source Map）
npm run package:vsix   # 打包为 VSIX
npm run build -- --watch  # 监听模式
```

### 项目结构

```
l4ai/
├── src/
│   ├── extension.ts              # 插件入口 & 命令注册
│   ├── types.ts                  # 共享 TypeScript 类型定义
│   ├── collector/
│   │   ├── gitCollector.ts       # Git 变更 & 工作区代码收集器
│   │   └── selectionCollector.ts # 编辑器选区收集器
│   ├── engine/
│   │   ├── llmClient.ts          # 双通道 LLM 客户端（vscode.lm + 自定义）
│   │   └── prompt.ts             # 四维认知提炼 Prompt 工程
│   ├── storage/
│   │   └── noteManager.ts        # Markdown 持久化 & 工作区状态缓存
│   └── ui/
│       └── sidebarProvider.ts    # Webview 侧边栏面板 & 交互 UI
├── resources/                    # 图标与静态资源
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # CI：每次 PR 触发构建、类型检查、lint
│   │   └── release.yml           # Release：版本标签触发自动打包与发布
│   └── ISSUE_TEMPLATE/
├── package.json
├── tsconfig.json
├── esbuild.js
└── CHANGELOG.md
```

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：

```
feat: 新增 Anki 导出功能
fix: 修复 git diff 为空时的异常处理
docs: 补充 Ollama 配置示例
chore: 升级 esbuild 至 0.24
```

---

## 📋 命令列表

| 命令 | 说明 |
|------|------|
| `L4AI: 提炼今日代码与 Codex 考点` | 分析今日 Git 变更并生成学习卡片 |
| `L4AI: 提炼当前选中代码深度原理` | 对选中代码片段进行即时深度剖析 |
| `L4AI: 打开今日学习笔记` | 打开今日自动生成的 Markdown 复盘文件 |
| `L4AI: 刷新今日学习看板` | 重新加载侧边栏面板 |

---

## 🗺️ 开发路线图

- [x] **v0.1** — 核心提炼引擎、侧边栏交互看板、Markdown 自动归档
- [ ] **v0.2** — 间隔重复调度器（SM-2 算法）、每日复习提醒
- [ ] **v0.3** — Anki `.apkg` 导出、Obsidian 插件双向同步
- [ ] **v0.4** — 知识成长热力图日历
- [ ] **v0.5** — 团队模式：在工作区内共享学习卡片

---

## 常见问题

**Q: 名字里的「4」是什么意思？**
A: `L4AI` = **L**earning **4**[for] the **AI** era。`4` 读作 "for"，与 `i18n`（internationalization）、`a11y`（accessibility）的命名风格相同，是一种技术圈的意图压缩表达。

**Q: 没有 GitHub Copilot 也可以用吗？**
A: 可以。在设置中将 `l4ai.llmProvider` 切换为 `custom`，配置 DeepSeek、Ollama 或任意 OpenAI 兼容 API 即可。

**Q: 代码上下文会被发送给第三方吗？**
A: 仅在你主动触发提炼命令时，代码片段才会发送至你所配置的 LLM 提供方。L4AI 本身不收集或上传任何数据。

**Q: 生成的 Markdown 文件放在哪里？**
A: 默认保存在工作区根目录的 `.l4ai/daily/YYYY-MM-DD.md`，可通过 `l4ai.notesDir` 自定义路径。

---

## 📄 许可证

MIT © [L4AI Community](https://github.com/l4ai)

---

<p align="center">
  为那些用 AI 快速交付、同时依然渴望持续成长的开发者而构建
</p>
