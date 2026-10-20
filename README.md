# Learning from AI (L4AI) 🧠

**让 AI 替你写代码，但确保你真正学懂代码背后的设计与知识。**

在 AI 辅助编程时代，我们敲代码的速度提升了数倍，但“虽然代码跑通了，我却不知道背后为什么这么写”的技能空心化问题日益严重。  
**Learning from AI (L4AI)** 是一个专为解决此痛点设计的 VS Code 插件。它能在你每天结束工作时，自动从当天的 Git 增量变更、Codex 交互与代码片段中，精准提炼高价值的认知点、架构权衡与自测卡片。

---

## ✨ 核心特性

- ⚡ **自动提炼今日所学**：一键分析今日工作区 Git 增量变更与代码上下文。
- 💡 **4 维立体认知卡片**：
  - **[语法特性]**：语言新特性、标准库隐藏技巧、高级语法糖。
  - **[架构权衡]**：为什么这样解耦？为什么用策略模式？数据流设计考量。
  - **[潜在避坑]**：AI 生成代码中暗含的时序风险、异常防护与边界条件。
  - **[深度自测]**：Anki 风格的主动回忆微测试（含提示与深度解析折叠）。
- 🖥️ **原生侧边栏交互看板 (Webview)**：
  - 沉浸式知识卡片浏览，按分类快速过滤。
  - 一键复制代码切片、折叠/展开深入剖析。
  - 侧边栏交互式答题自测。
- 📝 **Markdown 自动归档**：
  - 自动沉淀每日复盘笔记至 `.l4ai/daily/YYYY-MM-DD.md`。
  - 天然兼容 Obsidian、Notion 与 Logseq。
- 🔌 **零门槛双通道模型支持**：
  - **VS Code LM 原生接口**：利用当前已有的 GitHub Copilot 订阅，零配置 API Key 即可使用！
  - **自定义 LLM API**：支持 DeepSeek、OpenAI、Claude、Ollama 等任意 OpenAI 兼容端点。
- 🎯 **划词即时提炼**：右键选区代码，随时深入剖析某段代码的设计原理。

---

## 🚀 快速上手

### 1. 提炼今日知识
1. 点击 VS Code 状态栏右侧的 `$(brain) L4AI: 今日知识`，或在命令面板 (`Ctrl+Shift+P` / `Cmd+Shift+P`) 搜索并执行：
   ```
   L4AI: 提炼今日代码与 Codex 考点
   ```
2. 插件会自动汇总今日代码变更，调用分析引擎提炼知识卡片。
3. 提炼完成后，可在弹窗中选择直接查看 `.l4ai/daily/` 下的 Markdown 笔记，或在左侧活动栏查看交互式看板。

### 2. 划选代码深度提炼
在任意文件中选中一段代码，右键点击：
```
L4AI: 提炼当前选中代码深度原理
```

### 3. 配置自定义 API (可选)
如果未使用 GitHub Copilot，可在 VS Code 设置 (`Ctrl+,`) 中搜索 `l4ai`：
- `l4ai.llmProvider`: 切换为 `custom`
- `l4ai.customApiBaseUrl`: 如 `https://api.deepseek.com/v1`
- `l4ai.customApiKey`: 填写您的 API Key
- `l4ai.customModel`: 如 `deepseek-chat`

---

## 🛠️ 开发者指南

```bash
# 安装依赖
npm install

# 编译与打包
npm run build

# 快速生成 VSIX 安装包
npx @vscode/vsce package --no-dependencies
```

---

## 📄 License
MIT License
