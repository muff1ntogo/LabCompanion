
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { format } from 'date-fns';

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  logs: string[];
}

interface JournalState {
  entries: Record<string, JournalEntry>;
  addLog: (log: string) => void;
  exportDay: (date: string) => string;
}

export const useJournal = create<JournalState>()(
  subscribeWithSelector<JournalState>((set, get) => ({
    entries: {},
    addLog: (log: string) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      set((state) => {
        const entry = state.entries[today] || { date: today, logs: [] };
        entry.logs.push(log);
        return {
          entries: {
            ...state.entries,
            [today]: entry,
          },
        };
      });
    },
    exportDay: (date: string) => {
      const entry = get().entries[date];
      if (!entry) return '';
      return `## ${entry.date}\n` + entry.logs.join('\n');
    },
  }))
);
