import * as vscode from 'vscode';
import { DailyDigest, LearningCard } from '../types';
import { EXTRACTION_SYSTEM_PROMPT, buildUserPrompt } from './prompt';

export class LLMClient {
  public static async extractLearnings(
    codeContext: string,
    fileHints?: string[],
    token?: vscode.CancellationToken
  ): Promise<DailyDigest> {
    const config = vscode.workspace.getConfiguration('l4ai');
    const provider = config.get<string>('llmProvider', 'vscode.lm');

    const promptText = buildUserPrompt(codeContext, fileHints);

    let rawResponse = '';

    if (provider === 'vscode.lm') {
      try {
        rawResponse = await this.callVsCodeLM(promptText, token);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        vscode.window.showWarningMessage(`L4AI: 尝试调用 VS Code LM 失败 (${errorMsg})，正在检查自定义 API 配置...`);
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
    const config = vscode.workspace.getConfiguration('l4ai');
    const baseUrl = config.get<string>('customApiBaseUrl', 'https://api.deepseek.com/v1');
    const apiKey = config.get<string>('customApiKey', '');
    const model = config.get<string>('customModel', 'deepseek-chat');

    if (!apiKey) {
      vscode.window.showInformationMessage(
        'L4AI: 未检测到 Copilot 或自定义 API Key。已为您展示智能分析样例，您可在设置中配置 `l4ai.customApiKey`。'
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
        quiz: card.quiz,
        sourceFile: card.sourceFile || fileHints?.[0] || 'workspace',
        timestamp: Date.now(),
      }));

      return {
        date: today,
        summary: parsed.summary || '今日代码考点提炼完成',
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
      summary: '今日重点：TypeScript 模块化设计、异步流式处理与错误恢复防御机制',
      totalCards: 4,
      cards: [
        {
          id: 'demo-1',
          type: 'syntax',
          title: '异步迭代器 (for await...of) 与流式消费',
          summary: '使用 for await...of 消费异步生成器，避免等待全量数据即可实现流式响应。',
          codeSnippet: `for await (const chunk of stream) {\n  processChunk(chunk);\n}`,
          explanation: '在处理大模型流式输出或大文件 I/O 时，传统 Promise.all 会导致高内存占用和首包延迟。for await 语法能在数据块到达的第一时间触发微任务执行。',
          sourceFile: source,
          timestamp: Date.now(),
        },
        {
          id: 'demo-2',
          type: 'architecture',
          title: '优雅降级策略：VS Code LM 与外部 API 双通道',
          summary: '采用策略模式与 Chain of Responsibility，确保无环境依赖时的稳定性。',
          codeSnippet: `try {\n  return await callVsCodeLM();\n} catch {\n  return await callCustomAPI();\n}`,
          explanation: '面向外部不确定依赖（如 VS Code Copilot 登录态或第三方网络）时，设计双重兜底通道，并提供优雅的默认降级体验，避免插件主进程中断。',
          sourceFile: source,
          timestamp: Date.now(),
        },
        {
          id: 'demo-3',
          type: 'gotcha',
          title: 'Node 子进程 maxBuffer 溢出隐患',
          summary: '执行大仓库 git diff 时，若未设置足够大的 maxBuffer 可能静默截断或报错。',
          codeSnippet: `execFile('git', args, { maxBuffer: 10 * 1024 * 1024 });`,
          explanation: '默认 child_process 的 buffer 限制为 1MB。在多人协作的大型仓库或包含大规模变更时，默认配置容易触发 ERR_CHILD_PROCESS_STDIO_MAXBUFFER 异常。',
          sourceFile: source,
          timestamp: Date.now(),
        },
        {
          id: 'demo-4',
          type: 'quiz',
          title: '今日自测：CancellationToken 的协作式取消机制',
          summary: '自测题：如何正确响应 VS Code 的用户取消操作？',
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
