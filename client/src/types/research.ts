export interface ProtocolWidget {
  id: string;
  type: 'timer' | 'pattern' | 'measurement' | 'pcr' | 'storage';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  completed?: boolean;
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  widgets: ProtocolWidget[];
  created: Date;
  lastModified: Date;
  questReward?: number;
}

export interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  remaining: number;
  isRunning: boolean;
  isCompleted: boolean;
  widgetId?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  timestamp?: Date;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  widgetId?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'protocol_complete' | 'timer_complete' | 'checklist_complete' | 'daily_login';
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  unlocked: boolean;
}

export interface CompanionState {
  mood: 'happy' | 'excited' | 'working' | 'sleepy' | 'proud';
  energy: number; // 0-100
  lastInteraction: Date;
  totalInteractions: number;
}
