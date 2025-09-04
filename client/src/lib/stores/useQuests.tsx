import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Quest, CompanionState } from "@/types/research";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

interface QuestState {
  quests: Quest[];
  companion: CompanionState;
  playerScore: number;
  level: number;
  
  // Quest actions
  completeQuest: (id: string) => void;
  updateQuestProgress: (id: string, progress: number) => void;
  generateDailyQuests: () => void;
  
  // Companion actions
  updateCompanionMood: (mood: CompanionState['mood']) => void;
  interactWithCompanion: () => void;
  
  // Scoring
  addScore: (points: number) => void;
  checkLevelUp: () => void;
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const initialQuests: Quest[] = [
  {
    id: 'quest-protocol-1',
    title: 'Create Your First Protocol',
    description: 'Build and save your first research protocol',
    type: 'protocol_complete',
    target: 1,
    progress: 0,
    reward: 50,
    completed: false,
    unlocked: true
  },
  {
    id: 'quest-timer-1',
    title: 'Time Master',
    description: 'Complete 5 timers successfully',
    type: 'timer_complete',
    target: 5,
    progress: 0,
    reward: 30,
    completed: false,
    unlocked: true
  },
  {
    id: 'quest-checklist-1',
    title: 'List Checker',
    description: 'Complete 3 checklists',
    type: 'checklist_complete',
    target: 3,
    progress: 0,
    reward: 25,
    completed: false,
    unlocked: true
  }
];

export const useQuests = create<QuestState>()(
  subscribeWithSelector((set, get) => ({
    quests: initialQuests,
    companion: {
      mood: 'happy',
      energy: 100,
      lastInteraction: new Date(),
      totalInteractions: 0
    },
    playerScore: 0,
    level: 1,
    
    completeQuest: (id) => {
      set((state) => {
        const updatedQuests = state.quests.map(quest => {
          if (quest.id === id && !quest.completed) {
            return { ...quest, completed: true, progress: quest.target };
          }
          return quest;
        });
        
        const quest = state.quests.find(q => q.id === id);
        const newScore = quest ? state.playerScore + quest.reward : state.playerScore;
        
        return {
          quests: updatedQuests,
          playerScore: newScore
        };
      });
      
      get().checkLevelUp();
      get().updateCompanionMood('excited');
      get().saveToStorage();
    },
    
    updateQuestProgress: (id, progress) => {
      set((state) => ({
        quests: state.quests.map(quest =>
          quest.id === id && !quest.completed
            ? { ...quest, progress: Math.min(progress, quest.target) }
            : quest
        )
      }));
      
      // Auto-complete quest if target reached
      const quest = get().quests.find(q => q.id === id);
      if (quest && quest.progress >= quest.target && !quest.completed) {
        get().completeQuest(id);
      }
      
      get().saveToStorage();
    },
    
    generateDailyQuests: () => {
      const today = new Date().toDateString();
      const stored = getLocalStorage('last-quest-generation');
      
      if (stored !== today) {
        const dailyQuest: Quest = {
          id: `daily-${Date.now()}`,
          title: 'Daily Research Goal',
          description: 'Complete any 2 research tasks today',
          type: 'daily_login',
          target: 2,
          progress: 0,
          reward: 20,
          completed: false,
          unlocked: true
        };
        
        set((state) => ({
          quests: [...state.quests.filter(q => !q.id.startsWith('daily-')), dailyQuest]
        }));
        
        setLocalStorage('last-quest-generation', today);
        get().saveToStorage();
      }
    },
    
    updateCompanionMood: (mood) => {
      set((state) => ({
        companion: { ...state.companion, mood }
      }));
    },
    
    interactWithCompanion: () => {
      set((state) => ({
        companion: {
          ...state.companion,
          lastInteraction: new Date(),
          totalInteractions: state.companion.totalInteractions + 1,
          energy: Math.min(100, state.companion.energy + 5)
        }
      }));
      
      get().saveToStorage();
    },
    
    addScore: (points) => {
      set((state) => ({
        playerScore: state.playerScore + points
      }));
      
      get().checkLevelUp();
      get().saveToStorage();
    },
    
    checkLevelUp: () => {
      const state = get();
      const newLevel = Math.floor(state.playerScore / 100) + 1;
      
      if (newLevel > state.level) {
        set({ level: newLevel });
        get().updateCompanionMood('proud');
      }
    },
    
    loadFromStorage: () => {
      const questData = getLocalStorage('research-quests');
      const companionData = getLocalStorage('research-companion');
      const scoreData = getLocalStorage('research-score');
      
      if (questData) {
        set({ quests: questData });
      }
      
      if (companionData) {
        set({ 
          companion: {
            ...companionData,
            lastInteraction: new Date(companionData.lastInteraction)
          }
        });
      }
      
      if (scoreData) {
        set({ 
          playerScore: scoreData.score || 0,
          level: scoreData.level || 1
        });
      }
    },
    
    saveToStorage: () => {
      const state = get();
      setLocalStorage('research-quests', state.quests);
      setLocalStorage('research-companion', state.companion);
      setLocalStorage('research-score', { 
        score: state.playerScore, 
        level: state.level 
      });
    }
  }))
);
