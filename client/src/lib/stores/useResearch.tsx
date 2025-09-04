import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Timer, Checklist, ChecklistItem } from "@/types/research";

interface ResearchState {
  timers: Timer[];
  checklists: Checklist[];
  
  // Timer actions
  addTimer: (timer: Omit<Timer, 'id'>) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  removeTimer: (id: string) => void;
  updateTimerTick: () => void;
  
  // Checklist actions
  addChecklist: (checklist: Omit<Checklist, 'id'>) => void;
  removeChecklist: (id: string) => void;
  addChecklistItem: (checklistId: string, item: Omit<ChecklistItem, 'id'>) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  removeChecklistItem: (checklistId: string, itemId: string) => void;
}

export const useResearch = create<ResearchState>()(
  subscribeWithSelector((set, get) => ({
    timers: [],
    checklists: [],
    
    addTimer: (timer) => {
      const newTimer: Timer = {
        ...timer,
        id: `timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      set((state) => ({
        timers: [...state.timers, newTimer]
      }));
    },
    
    startTimer: (id) => {
      set((state) => ({
        timers: state.timers.map(timer =>
          timer.id === id ? { ...timer, isRunning: true } : timer
        )
      }));
    },
    
    pauseTimer: (id) => {
      set((state) => ({
        timers: state.timers.map(timer =>
          timer.id === id ? { ...timer, isRunning: false } : timer
        )
      }));
    },
    
    resetTimer: (id) => {
      set((state) => ({
        timers: state.timers.map(timer =>
          timer.id === id ? { 
            ...timer, 
            remaining: timer.duration, 
            isRunning: false, 
            isCompleted: false 
          } : timer
        )
      }));
    },
    
    removeTimer: (id) => {
      set((state) => ({
        timers: state.timers.filter(timer => timer.id !== id)
      }));
    },
    
    updateTimerTick: () => {
      set((state) => ({
        timers: state.timers.map(timer => {
          if (!timer.isRunning || timer.isCompleted) return timer;
          
          const newRemaining = Math.max(0, timer.remaining - 1);
          const isCompleted = newRemaining === 0;
          
          return {
            ...timer,
            remaining: newRemaining,
            isCompleted,
            isRunning: !isCompleted
          };
        })
      }));
    },
    
    addChecklist: (checklist) => {
      const newChecklist: Checklist = {
        ...checklist,
        id: `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      set((state) => ({
        checklists: [...state.checklists, newChecklist]
      }));
    },
    
    removeChecklist: (id) => {
      set((state) => ({
        checklists: state.checklists.filter(checklist => checklist.id !== id)
      }));
    },
    
    addChecklistItem: (checklistId, item) => {
      const newItem: ChecklistItem = {
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      set((state) => ({
        checklists: state.checklists.map(checklist =>
          checklist.id === checklistId
            ? { ...checklist, items: [...checklist.items, newItem] }
            : checklist
        )
      }));
    },
    
    toggleChecklistItem: (checklistId, itemId) => {
      set((state) => ({
        checklists: state.checklists.map(checklist =>
          checklist.id === checklistId
            ? {
                ...checklist,
                items: checklist.items.map(item =>
                  item.id === itemId
                    ? { 
                        ...item, 
                        completed: !item.completed,
                        timestamp: !item.completed ? new Date() : undefined
                      }
                    : item
                )
              }
            : checklist
        )
      }));
    },
    
    removeChecklistItem: (checklistId, itemId) => {
      set((state) => ({
        checklists: state.checklists.map(checklist =>
          checklist.id === checklistId
            ? { ...checklist, items: checklist.items.filter(item => item.id !== itemId) }
            : checklist
        )
      }));
    }
  }))
);
