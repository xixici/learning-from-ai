import * as path from 'path';
import * as vscode from 'vscode';
import { ExtractionRequest } from '../types';

export function collectActiveSelection(): ExtractionRequest | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('LFAI: 请先在编辑器中打开文件并选中代码。');
    return null;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);

  if (!selectedText.trim()) {
    vscode.window.showInformationMessage('LFAI: 请先选中一段代码，再进行知识提炼。');
    return null;
  }

  const fileName = path.basename(editor.document.fileName);
  const language = editor.document.languageId;

  const codeContext = `// File: ${fileName} (${language})\n// Line ${selection.start.line + 1} to ${selection.end.line + 1}\n\n${selectedText}`;

  return {
    sourceType: 'selection',
    codeContext,
    fileHints: [fileName],
  };
}
