import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { InboxItem } from '../types';

export class InboxManager {
  private static readonly STORAGE_KEY = 'lfai_inbox_items';
  private static readonly _onDidUpdateInbox = new vscode.EventEmitter<InboxItem[]>();
  public static readonly onDidUpdateInbox: vscode.Event<InboxItem[]> = this._onDidUpdateInbox.event;

  public static async getItems(context: vscode.ExtensionContext): Promise<InboxItem[]> {
    // 1. Try memory / workspaceState cache first
    const cached = context.workspaceState.get<InboxItem[]>(this.STORAGE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    // 2. Fallback to file storage
    const items = await this.readItemsFromFile();
    if (items.length > 0) {
      await context.workspaceState.update(this.STORAGE_KEY, items);
    }
    return items;
  }

  public static async addItem(
    context: vscode.ExtensionContext,
    content: string,
    source: 'clipboard' | 'manual' = 'clipboard',
    detectedType: 'chat' | 'code' | 'snippet' = 'chat'
  ): Promise<InboxItem | null> {
    const trimmed = content.trim();
    if (!trimmed) {
      return null;
    }

    const items = await this.getItems(context);

    // Check if exact same content already exists in inbox
    if (items.some((item) => item.content === trimmed)) {
      return null;
    }

    // Generate preview title
    let preview = trimmed.replace(/\r?\n+/g, ' ').slice(0, 70);
    if (trimmed.length > 70) {
      preview += '...';
    }

    const newItem: InboxItem = {
      id: `inbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      preview,
      content: trimmed,
      source,
      detectedType,
    };

    items.unshift(newItem); // Newest first

    // Limit maximum inbox items to 50
    if (items.length > 50) {
      items.length = 50;
    }

    await context.workspaceState.update(this.STORAGE_KEY, items);
    await this.writeItemsToFile(items);
    this._onDidUpdateInbox.fire(items);

    return newItem;
  }

  public static async removeItem(
    context: vscode.ExtensionContext,
    id: string
  ): Promise<void> {
    const items = await this.getItems(context);
    const updated = items.filter((item) => item.id !== id);
    await context.workspaceState.update(this.STORAGE_KEY, updated);
    await this.writeItemsToFile(updated);
    this._onDidUpdateInbox.fire(updated);
  }

  public static async clearInbox(context: vscode.ExtensionContext): Promise<void> {
    await context.workspaceState.update(this.STORAGE_KEY, []);
    await this.writeItemsToFile([]);
    this._onDidUpdateInbox.fire([]);
  }

  private static getInboxFilePath(): string | null {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return null;
    }
    const config = vscode.workspace.getConfiguration('lfai');
    const relDir = config.get<string>('notesDir', '.lfai/daily');
    // Store inbox in .lfai/inbox/items.json
    const rootDir = path.dirname(path.join(folders[0].uri.fsPath, relDir));
    return path.join(rootDir, 'inbox', 'items.json');
  }

  private static async readItemsFromFile(): Promise<InboxItem[]> {
    const filePath = this.getInboxFilePath();
    if (!filePath) {
      return [];
    }

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private static async writeItemsToFile(items: InboxItem[]): Promise<void> {
    const filePath = this.getInboxFilePath();
    if (!filePath) {
      return;
    }

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf-8');
    } catch (err) {
      console.warn('LFAI: Failed to write inbox items to disk:', err);
    }
  }
}
