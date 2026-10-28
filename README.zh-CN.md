<p align="center">
  <img src="resources/banner.png" alt="LFAI — 从 AI 中学习 (Learning From AI)" width="100%"/>
</p>

<h1 align="center">🧠 LFAI</h1>

<p align="center">
  <b>Learning From AI · 从 AI 中学习</b>
</p>

<p align="center">
  别让 AI 替你写走了你的技术成长。从 AI 写的每一行代码中真正吸收知识。
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=xixici.lfai">
    <img src="https://img.shields.io/badge/VS_Marketplace-v0.1.4-007ACC?style=flat-square&logo=visual-studio-code" alt="VS Marketplace 版本"/>
  </a>
  <a href="https://github.com/xixici/learning-from-ai/releases">
    <img src="https://img.shields.io/github/v/release/xixici/learning-from-ai?style=flat-square&color=blueviolet&logo=github" alt="最新发布"/>
  </a>
  <a href="https://github.com/xixici/learning-from-ai/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/xixici/learning-from-ai/ci.yml?branch=main&style=flat-square&label=CI&logo=github-actions" alt="CI Status"/>
  </a>
  <a href="https://github.com/xixici/learning-from-ai/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square" alt="开源协议: MIT"/>
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

<p align="center">
  <img src="resources/screenshot-main.png" alt="LFAI 每日代码学习复盘与侧边栏界面" width="100%"/>
</p>

---

## 核心问题

AI 编程工具（GitHub Copilot、Cursor、Claude Code 等）的普及带来了一个无声的悖论：

> **你交付得更快了，但你成长得更慢了。**

每一天，AI 帮你写下数以千行的代码——复杂的异步模式、精妙的架构决策、隐藏的边界防护——而你只是按下"接受"。三天后面对类似场景，你依然无从下手，无法独立复现，更无法深度调试。

**LFAI 填补这个缺口。** 它把你每天由 AI 辅助写出的代码，自动转化为属于你自己的 5 分钟微学习——不是千篇一律的教程，而是从你自己每天的工作中提炼出的活知识。

---

## ✨ 核心功能

### ⚡ 双轨驱动工作流：对公交付 + 对私成长
学习不该成为下班后的额外负担。LFAI 通过双轨输出打破“反人性”的学习困境：
- **对公交付（Standup & PR Ready）**：自动提炼出今日完成的 3~5 项高密度工程交付事项。点击侧边栏 **`📋 复制日报/PR`**，即可直接粘贴到团队每日站会群、工作日报或 GitHub PR 描述中，秒省 15 分钟写总结的时间。
- **对私成长（个人技术资产）**：严格过滤平庸的业务 CRUD，专注于捕获冰山底层的机制剖析与防御性推演。

### 🎯 架构师级深水区探针（拒斥流水账）
普通的 AI 解说往往只是“把代码字面意思复述一遍”。LFAI 设立严格负向过滤红线，并采用三大认知探针进行提炼：
- 💡 **机制剖析 (The Why)**：AI 为什么选用这一模式或数据流？与直觉/传统写法相比，消除了哪些隐式状态或并发锁隐患？
- ⚠️ **破坏性推演 (Destructive Test)**：如果把这行防御性代码或配置删掉，系统会在何种极端高并发、边界输入或时序竞态下静默崩溃？
- 📖 **深度底层机制**：解析事件循环微任务、V8 优化原理、子进程缓冲机制与框架内部实现。
- ✨ **现代最佳实践**：生产环境中的架构权衡方案与语言现代惯用法。
- ❓ **实战自测拷问 (Active Recall)**：包含思考提示与按需折叠标准答案的 Anki 风格互动考题。

### 🔍 今日代码自动收集
自动扫描当天 Git 增量变更，智能过滤锁文件、构建产物、纯格式化提交等噪声，只提取真正有学习价值的代码信号。

### 🖥️ 原生 VS Code 侧边栏看板
- 按分类一键过滤卡片（避坑、架构、语法、自测）
- 顶部集成今日工作交付折叠卡与 **`📋 复制日报/PR`** 快捷操作
- 折叠/展开深度原理剖析与破坏性推演
- 交互式问答模式，答案按需揭示
- 直接复制代码切片至剪贴板

### 📝 Markdown 知识库沉淀
每日复盘记录自动保存为 `.lfai/daily/YYYY-MM-DD.md` 标准 Markdown 文件，分为**「今日工作交付」**与**「核心技术内参」**两大板块，天然兼容 **Obsidian**、**Logseq**、**Notion** 等任意笔记工具。

### 🤖 零门槛双通道模型接入
- **VS Code LM API**（默认）：直接复用已有的 GitHub Copilot 订阅，无需任何额外配置
- **自定义 LLM**：DeepSeek、OpenAI、Claude，或任何本地 Ollama 端点

### ✂️ 划词即时提炼
右键选中任意代码片段 → **「LFAI: 提炼当前选中代码深度原理」** — 随时获取任意代码的即时深度剖析。

---

## 🚀 快速开始

### 手动 VSIX 安装
```bash
code --install-extension lfai-0.1.4.vsix
```

### 第一次使用
1. 打开任意有代码变更的项目
2. 按 `Ctrl+Shift+P` → **`LFAI: 提炼今日代码与 AI 考点`**
3. 点击 **`📋 复制日报/Standup`**，5 秒完成今日工作汇报
4. 在侧边栏（活动栏大脑图标）查看今日深度原理卡片
5. 在 `.lfai/daily/` 目录下找到自动生成的 Markdown 复盘文件

---

## ⚙️ 配置说明

打开 VS Code 设置（`Ctrl+,`），搜索 `@ext:xixici.lfai` 或 `lfai`：

<p align="center">
  <img src="resources/screenshot-settings.png" alt="LFAI 扩展设置界面" width="100%"/>
</p>

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
| `LFAI: 提炼今日代码与 AI 考点` | 分析今日 Git 变更并生成学习卡片与工作交付总结 |
| `LFAI: 复制今日工作交付与 Standup 到剪贴板` | 一键将格式化好的 Standup / 日报 / PR 总结复制到剪贴板 |
| `LFAI: 提炼当前选中代码深度原理` | 对选中代码片段进行即时深度剖析 |
| `LFAI: 打开今日学习笔记` | 打开今日自动生成的 Markdown 复盘文件 |
| `LFAI: 刷新今日学习看板` | 重新加载侧边栏面板 |

---

## 🗺️ 开发路线图

- [x] **v0.1.0** — 核心提炼引擎、侧边栏交互看板、Markdown 自动归档
- [x] **v0.1.2** — 双轨驱动工作流（日报/Standup 一键复制）、架构师级深水区探针、破坏性推演分析
- [ ] **v0.2.0** — 间隔重复调度器（SM-2 算法）、每日复习微测验
- [ ] **v0.3.0** — Anki `.apkg` 导出、Obsidian 插件双向同步
- [ ] **v0.4.0** — 知识成长热力图日历
- [ ] **v0.5.0** — 团队模式：在工作区内共享学习卡片

---

## 📈 Star 增长趋势 (Star History)

<p align="center">
  <a href="https://star-history.com/#xixici/learning-from-ai&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=xixici/learning-from-ai&type=Date&theme=dark" />
      <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=xixici/learning-from-ai&type=Date" />
      <img alt="Star 历史图表" src="https://api.star-history.com/svg?repos=xixici/learning-from-ai&type=Date" width="100%" />
    </picture>
  </a>
</p>

---

## 📄 许可证

MIT © [LFAI Community](https://github.com/xixici/learning-from-ai)
