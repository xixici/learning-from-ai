import * as vscode from 'vscode';
import { DailyDigest, LearningCard } from '../types';
import { EXTRACTION_SYSTEM_PROMPT, buildUserPrompt } from './prompt';

export class LLMClient {
  public static async extractLearnings(
    codeContext: string,
    fileHints?: string[],
    token?: vscode.CancellationToken
  ): Promise<DailyDigest> {
    const config = vscode.workspace.getConfiguration('lfai');
    const provider = config.get<string>('llmProvider', 'vscode.lm');

    const promptText = buildUserPrompt(codeContext, fileHints);

    let rawResponse = '';

    if (provider === 'vscode.lm') {
      try {
        rawResponse = await this.callVsCodeLM(promptText, token);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        vscode.window.showWarningMessage(`LFAI: 尝试调用 VS Code LM 失败 (${errorMsg})，正在检查自定义 API 配置...`);
        rawResponse = await this.callCustomAPI(promptText);
      }
    } else {
      rawResponse = await this.callCustomAPI(promptText);
    }

    if (!rawResponse.trim()) {
      return this.generateFallbackDigest(fileHints);
    }

    return this.parseDigestResponse(rawResponse, fileHints);
  }

  private static async callVsCodeLM(
    userPrompt: string,
    cancellationToken?: vscode.CancellationToken
  ): Promise<string> {
    // Check if vscode.lm is supported in current VS Code
    if (!('lm' in vscode) || !vscode.lm.selectChatModels) {
      throw new Error('当前 VS Code 版本暂不支持 vscode.lm API');
    }

    // Try finding gpt-4o or any available chat model
    let models = await vscode.lm.selectChatModels({ family: 'gpt-4o' });
    if (!models || models.length === 0) {
      models = await vscode.lm.selectChatModels();
    }

    if (!models || models.length === 0) {
      throw new Error('未发现可用的 VS Code 语言模型，请确保已安装并登录 GitHub Copilot');
    }

    const model = models[0];
    const messages = [
      vscode.LanguageModelChatMessage.User(
        `${EXTRACTION_SYSTEM_PROMPT}\n\n---\n${userPrompt}`
      ),
    ];

    const source = new vscode.CancellationTokenSource();
    const token = cancellationToken || source.token;

    const chatResponse = await model.sendRequest(messages, {}, token);

    let fullText = '';
    for await (const fragment of chatResponse.text) {
      fullText += fragment;
    }

    return fullText;
  }

  private static async callCustomAPI(userPrompt: string): Promise<string> {
    const config = vscode.workspace.getConfiguration('lfai');
    const baseUrl = config.get<string>('customApiBaseUrl', 'https://api.deepseek.com/v1');
    const apiKey = config.get<string>('customApiKey', '');
    const model = config.get<string>('customModel', 'deepseek-chat');

    if (!apiKey) {
      vscode.window.showInformationMessage(
        'LFAI: 未检测到 Copilot 或自定义 API Key。已为您展示智能分析样例，您可在设置中配置 `lfai.customApiKey`。'
      );
      return '';
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      throw new Error(`API 请求失败 [HTTP ${res.status}]: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content || '';
  }

  private static parseDigestResponse(rawText: string, fileHints?: string[]): DailyDigest {
    let cleanJson = rawText.trim();
    // Strip markdown code block if present
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    }

    try {
      const parsed = JSON.parse(cleanJson);
      const today = new Date().toISOString().split('T')[0];

      const cards: LearningCard[] = (parsed.cards || []).map((card: Partial<LearningCard>, idx: number) => ({
        id: card.id || `card-${Date.now()}-${idx}`,
        type: card.type || 'syntax',
        title: card.title || `知识点 #${idx + 1}`,
        summary: card.summary || '',
        codeSnippet: card.codeSnippet,
        explanation: card.explanation || '',
        theWhy: card.theWhy,
        destructiveTest: card.destructiveTest,
        bestPractice: card.bestPractice,
        quiz: card.quiz,
        sourceFile: card.sourceFile || fileHints?.[0] || 'workspace',
        timestamp: Date.now(),
      }));

      return {
        date: today,
        summary: parsed.summary || '今日代码考点提炼完成',
        workSummary: parsed.workSummary,
        totalCards: cards.length,
        cards,
        rawSourceCount: fileHints?.length || 1,
      };
    } catch {
      return this.generateFallbackDigest(fileHints);
    }
  }

  public static generateFallbackDigest(fileHints?: string[]): DailyDigest {
    const today = new Date().toISOString().split('T')[0];
    const source = fileHints?.[0] || 'src/index.ts';

    return {
      date: today,
      summary: '今日重点：异步流式消费背压机制、双通道容灾架构与防御性缓冲治理',
      workSummary: {
        title: '完成认知分析引擎升级与 VS Code 侧边栏工作流集成',
        deliverables: [
          '重构提示词工程，引入深水区探针与负向过滤，大幅提升知识提取密度',
          '实现工作交付层 (Standup/PR) 与技术复盘卡片双轨输出架构',
          '优化 Node 子进程调用链路，配置显式 maxBuffer 防止超大 diff 截断',
          '新增 VS Code 侧边栏「一键复制日报与 Standup」核心快捷操作',
        ],
        changedModules: ['engine', 'collector', 'ui', 'storage'],
      },
      totalCards: 4,
      cards: [
        {
          id: 'demo-1',
          type: 'gotcha',
          title: '子进程 maxBuffer 溢出与静默截断防护',
          summary: '执行大仓库 git diff 时，若未设置足够大的 maxBuffer 可能静默截断或触发致命错误。',
          codeSnippet: `execFile('git', args, { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' });`,
          theWhy: 'Node.js 的 execFile 默认把子进程输出全量积攒在内存 Buffer 中（默认上限仅 1MB）。在此处显式放大至 10MB，保护大体积 diff 稳定消费。',
          destructiveTest: '若移除 maxBuffer 设置，一旦单日涉及大型代码格式化或批量依赖升级，将直接导致 ERR_CHILD_PROCESS_STDIO_MAXBUFFER 异常，提炼静默失败。',
          explanation: '默认 child_process 的 buffer 限制非常保守。面对多人协作或长周期大变更，全量缓冲模式极易暴雷，必须显式定义安全阈值。',
          bestPractice: '对于尺寸可预估但偏大的 CLI 调用，显式配置 10MB~50MB 阈值；对完全不可测体量，必须改用 spawn 流式消费并对接背压。',
          sourceFile: source,
          timestamp: Date.now(),
        },
        {
          id: 'demo-2',
          type: 'architecture',
          title: '优雅降级策略：VS Code LM 与外部 API 双通道',
          summary: '采用责任链与优雅降级策略，确保本地无 Copilot 授权时依然能无缝转接自定义 API。',
          codeSnippet: `try {\n  return await callVsCodeLM();\n} catch {\n  return await callCustomAPI();\n}`,
          theWhy: '企业内网或离线环境中，VS Code Copilot 登录态具有不确定性。双通道设计解耦了对单一商业基础设施的强依赖。',
          destructiveTest: '若直接强依赖 vscode.lm，当用户切断 Copilot 或处于内网私有模型环境时，插件核心功能将 100% 瘫痪。',
          explanation: '面向外部不确定依赖时，设计多重降级与用户友好的指引策略，是工业级插件稳定性的生命线。',
          bestPractice: '在客户端网络与 AI 调用层，始终保留无感切换的兜底实现并做好清晰的错误链路捕获。',
          sourceFile: source,
          timestamp: Date.now(),
        },
        {
          id: 'demo-3',
          type: 'syntax',
          title: '异步迭代器 (for await...of) 与流式消费',
          summary: '使用 for await...of 消费异步生成器，避免等待全量数据即可实现流式响应。',
          codeSnippet: `for await (const chunk of stream) {\n  processChunk(chunk);\n}`,
          theWhy: '传统 Promise.all 会在所有数据准备就绪前阻塞主事件循环并占用大量内存。异步迭代器在微任务级别逐块调度，首包响应极佳。',
          destructiveTest: '如果把流式消费改写为一次性全量拉取，在网络抖动或长篇幅流式传输场景下，用户端将感知到长达数秒的假死卡顿。',
          explanation: 'for await...of 内部通过异步调用 Symbol.asyncIterator 实现协议级消费，结合事件循环的微任务队列，能兼顾低内存占用与高实时性。',
          bestPractice: '大模型交互、文件读取等 I/O 密集型任务中，优先选用 AsyncIterable 配合流式解析器。',
          sourceFile: source,
          timestamp: Date.now(),
        },
        {
          id: 'demo-4',
          type: 'quiz',
          title: '今日自测：CancellationToken 的协作式取消机制',
          summary: '自测题：如何正确响应 VS Code 的用户取消操作？',
          theWhy: 'VS Code 的取消体系采用协作式模型（Cooperative Cancellation），绝不在操作系统层面强制杀线程/进程，以避免损坏文件或造成资源孤儿。',
          destructiveTest: '若仅接收 token 却从未在耗时轮询或异步边界检查 isCancellationRequested，用户即使点击了 Cancel，后台大模型请求依然会继续消耗 token 和算力。',
          explanation: 'CancellationToken 并非强制杀进程，而是协作式标志位。必须在耗时循环或异步等待中定期检查 isCancellationRequested。',
          sourceFile: source,
          quiz: {
            question: '在 VS Code 插件的长时间操作中，如果用户点击了取消，为什么仅仅传递 token 参数可能依然无法立即停止后台任务？',
            hint: '注意协作式取消 (Cooperative Cancellation) 的本质。',
            answer: '因为 CancellationToken 是协作式的，长耗时任务必须在每个循环迭代或关键异步步骤中主动判断 `token.isCancellationRequested` 并抛出 CancellationError，否则任务仍会继续执行完当前阶段。',
            explanation: 'VS Code 的取消契约设计遵循协作原则，避免强行中断导致的资源泄漏或状态不一致。开发者需主动注册 `token.onCancellationRequested` 或轮询标志位。',
          },
          timestamp: Date.now(),
        },
      ],
      rawSourceCount: fileHints?.length || 1,
    };
  }
}
