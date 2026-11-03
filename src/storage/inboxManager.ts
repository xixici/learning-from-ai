import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { InboxItem } from '../types';

export class InboxManager {
  private static readonly STORAGE_KEY = 'lfai_inbox_items';
  private static readonly _onDidUpdateInbox = new vscode.EventEmitter<InboxItem[]>();
  public static readonly onDidUpdateInbox: vscode.Event<InboxItem[]> = this._onDidUpdateInbox.event;

  public static formatLocalDate(d: Date = new Date()): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public static async getItems(context: vscode.ExtensionContext): Promise<InboxItem[]> {
    // 1. Try memory / workspaceState cache first
    const cached = context.workspaceState.get<InboxItem[]>(this.STORAGE_KEY);
    if (cached !== undefined && Array.isArray(cached)) {
      return this.ensureItemsDate(cached);
    }

    // 2. Fallback to file storage
    const items = await this.readItemsFromFile();
    const fixed = this.ensureItemsDate(items);
    await context.workspaceState.update(this.STORAGE_KEY, fixed);
    return fixed;
  }

  private static ensureItemsDate(items: InboxItem[]): InboxItem[] {
    return items.map((it) => {
      if (!it.date) {
        it.date = this.formatLocalDate(new Date(it.timestamp || Date.now()));
      }
      return it;
    });
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

    const targetDate = this.formatLocalDate(new Date());
    const newItem: InboxItem = {
      id: `inbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      date: targetDate,
      preview,
      content: trimmed,
      source,
      detectedType,
      charCount: trimmed.length,
    };
    items.unshift(newItem); // Newest first

    // Limit maximum inbox items in active pool to 100
    if (items.length > 100) {
      items.length = 100;
    }

    await context.workspaceState.update(this.STORAGE_KEY, items);
    await this.writeItemsToFile(items);
    await this.writeItemToDateArchive(targetDate, newItem);
    this._onDidUpdateInbox.fire(items);

    return newItem;
  }


  public static async getItem(
    context: vscode.ExtensionContext,
    id: string
  ): Promise<InboxItem | undefined> {
    const items = await this.getItems(context);
    return items.find((item) => item.id === id);
  }

  public static async getLatestItem(
    context: vscode.ExtensionContext
  ): Promise<InboxItem | undefined> {
    const items = await this.getItems(context);
    return items.length > 0 ? items[0] : undefined;
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
  /**
   * Get inbox items for a specific date (YYYY-MM-DD)
   */
  public static async getItemsByDate(
    context: vscode.ExtensionContext,
    targetDate: string
  ): Promise<InboxItem[]> {
    // 1. First check the dedicated date archive file (.lfai/inbox/YYYY-MM-DD.json)
    const dateFileItems = await this.readDateArchive(targetDate);
    if (dateFileItems.length > 0) {
      return dateFileItems;
    }

    // 2. Fallback to filtering the main active inbox items
    const allItems = await this.getItems(context);
    return allItems.filter((it) => it.date === targetDate);
  }

  /**
   * Get all dates that have archived inbox entries (sorted newest first)
   */
  public static async getAllInboxDates(context?: vscode.ExtensionContext): Promise<string[]> {
    const datesSet = new Set<string>();
    const inboxDir = this.getInboxDir();

    if (inboxDir) {
      try {
        const files = await fs.readdir(inboxDir);
        for (const f of files) {
          const match = f.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
          if (match) {
            datesSet.add(match[1]);
          }
        }
      } catch {
        // ignore if dir does not exist
      }
    }

    if (context) {
      const cached = context.workspaceState.get<InboxItem[]>(this.STORAGE_KEY) || [];
      for (const it of cached) {
        if (it.date) {
          datesSet.add(it.date);
        }
      }
    }

    return Array.from(datesSet).sort((a, b) => b.localeCompare(a));
  }

  public static getInboxDir(): string | null {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return null;
    }
    const config = vscode.workspace.getConfiguration('lfai');
    const relDir = config.get<string>('notesDir', '.lfai/daily');
    const rootDir = path.dirname(path.join(folders[0].uri.fsPath, relDir));
    return path.join(rootDir, 'inbox');
  }

  private static getInboxFilePath(): string | null {
    const dir = this.getInboxDir();
    return dir ? path.join(dir, 'items.json') : null;
  }

  private static getDateArchiveFilePath(targetDate: string): string | null {
    const dir = this.getInboxDir();
    return dir ? path.join(dir, `${targetDate}.json`) : null;
  }

  private static async readDateArchive(targetDate: string): Promise<InboxItem[]> {
    const filePath = this.getDateArchiveFilePath(targetDate);
    if (!filePath) {
      return [];
    }
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? this.ensureItemsDate(parsed) : [];
    } catch {
      return [];
    }
  }

  private static async writeItemToDateArchive(targetDate: string, item: InboxItem): Promise<void> {
    const filePath = this.getDateArchiveFilePath(targetDate);
    if (!filePath) {
      return;
    }
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      let items = await this.readDateArchive(targetDate);
      if (!items.some((it) => it.id === item.id || it.content === item.content)) {
        items.unshift(item);
      }
      await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`LFAI: Failed to append inbox date archive (${targetDate}):`, err);
    }
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
