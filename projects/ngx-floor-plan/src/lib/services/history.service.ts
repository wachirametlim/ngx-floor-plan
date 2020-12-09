import { Injectable } from '@angular/core';
import { HISTORY } from '../models/history.model';

const MAX_HISTOTY = 100;

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private histories: HISTORY[] = [];
  private historyIndex = 0;

  constructor() {}

  load(index?: number): HISTORY {
    if (index) {
      return this.histories[index];
    }
    return this.histories[this.historyIndex];
  }

  save(history: HISTORY): void {
    if (this.histories.length > MAX_HISTOTY) {
      this.histories.shift();
    }
    this.histories.push(history);
    this.historyIndex = this.histories.length;
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.histories.length;
  }

  undo(): void {
    if (this.canUndo()) {
      this.historyIndex--;
    }
  }

  redo(): void {
    if (this.canRedo()) {
      this.historyIndex++;
    }
  }
}
