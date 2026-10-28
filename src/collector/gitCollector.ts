import * as child_process from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { ExtractionRequest } from '../types';

const IGNORED_EXTENSIONS = [
  '.lock',
  '.min.js',
  '.min.css',
  '.map',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
];

const IGNORED_PATHS = [
  'node_modules',
  'dist',
  'build',
  'out',
  '.git',
  '.vscode',
  '.lfai',
  '.l4ai',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
];

function runGit(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve) => {
    child_process.execFile('git', args, { cwd, maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (err) {
        console.warn('[LFAI] git command failed:', args.join(' '), err?.message);
        resolve('');
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export async function collectTodayGitDiff(): Promise<ExtractionRequest | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage('LFAI: 请在打开的工作区中运行此命令。');
    return null;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;

  // 1. Check if git repo exists
  const isInsideWorkTree = await runGit(['rev-parse', '--is-inside-work-tree'], rootPath);
  if (isInsideWorkTree !== 'true') {
    return collectWorkspaceRecentFiles(rootPath);
  }

  // 2. Collect diffs:
  // a) Unstaged and staged diffs in working tree
  const [workingDiff, todayCommitsDiff] = await Promise.all([
    runGit(['diff', 'HEAD'], rootPath),
    runGit(['log', '--since=midnight', '-p', '--stat'], rootPath),
  ]);

  let combinedDiff = '';
  if (workingDiff) {
    combinedDiff += `\n--- [Working Tree Changes] ---\n` + workingDiff;
  }
  if (todayCommitsDiff) {
    combinedDiff += `\n--- [Today's Commits Diff] ---\n` + todayCommitsDiff;
  }

  // If still empty, check unstaged git diff
  if (!combinedDiff.trim()) {
    const rawDiff = await runGit(['diff'], rootPath);
    if (rawDiff.trim()) {
      combinedDiff = rawDiff;
    }
  }

  // If git diff is still empty, fall back to recently modified files
  if (!combinedDiff.trim()) {
    return collectWorkspaceRecentFiles(rootPath);
  }

  // Filter diff lines to ignore locks, node_modules etc.
  const filteredDiff = filterDiff(combinedDiff);
  if (!filteredDiff.trim()) {
    return collectWorkspaceRecentFiles(rootPath);
  }

  return {
    sourceType: 'git_diff',
    codeContext: truncateContext(filteredDiff, 12000),
    fileHints: extractChangedFilesFromDiff(filteredDiff),
  };
}

function filterDiff(rawDiff: string): string {
  const lines = rawDiff.split('\n');
  const result: string[] = [];
  let skippingFile = false;

  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      skippingFile = IGNORED_PATHS.some((p) => line.includes(p)) ||
        IGNORED_EXTENSIONS.some((ext) => line.includes(ext));
    }
    if (!skippingFile) {
      result.push(line);
    }
  }

  return result.join('\n');
}

function extractChangedFilesFromDiff(diff: string): string[] {
  const files: Set<string> = new Set();
  const regex = /diff --git a\/(.+?) b\/(.+)/g;
  let match;
  while ((match = regex.exec(diff)) !== null) {
    files.add(match[1]);
  }
  return Array.from(files);
}

async function collectWorkspaceRecentFiles(rootPath: string): Promise<ExtractionRequest | null> {
  // Fallback: look for recently edited code files in the workspace
  try {
    const files = await vscode.workspace.findFiles(
      '**/*.{ts,js,py,go,rs,java,cpp,c,vue,jsx,tsx}',
      '**/{node_modules,dist,build,.git,.l4ai}/**',
      10
    );

    if (files.length === 0) {
      return null;
    }

    let codeContext = '';
    const fileHints: string[] = [];

    for (const file of files.slice(0, 5)) {
      const doc = await vscode.workspace.openTextDocument(file);
      const text = doc.getText();
      if (text.trim().length > 0) {
        const relative = path.relative(rootPath, file.fsPath);
        fileHints.push(relative);
        codeContext += `\n// File: ${relative}\n${text.slice(0, 2000)}\n`;
      }
    }

    if (!codeContext.trim()) {
      return null;
    }

    return {
      sourceType: 'manual',
      codeContext: truncateContext(codeContext, 12000),
      fileHints,
    };
  } catch {
    return null;
  }
}

function truncateContext(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '\n\n...[Truncated due to token limit]...';
}
