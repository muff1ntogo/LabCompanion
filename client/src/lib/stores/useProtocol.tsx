import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Protocol, ProtocolWidget } from "@/types/research";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

interface ProtocolState {
  protocols: Protocol[];
  currentProtocol: Protocol | null;
  isBuilding: boolean;
  
  // Protocol actions
  createProtocol: (name: string, description: string) => void;
  loadProtocol: (id: string) => void;
  saveProtocol: (protocol: Protocol) => void;
  deleteProtocol: (id: string) => void;
  
  // Widget actions
  addWidget: (widget: Omit<ProtocolWidget, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<ProtocolWidget>) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  
  // Builder actions
  startBuilding: () => void;
  stopBuilding: () => void;
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useProtocol = create<ProtocolState>()(
  subscribeWithSelector((set, get) => ({
    protocols: [],
    currentProtocol: null,
    isBuilding: false,
    
    createProtocol: (name, description) => {
      const newProtocol: Protocol = {
        id: `protocol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        widgets: [],
        created: new Date(),
        lastModified: new Date(),
        questReward: 10
      };
      
      set((state) => ({
        protocols: [...state.protocols, newProtocol],
        currentProtocol: newProtocol,
        isBuilding: true
      }));
      
      get().saveToStorage();
    },
    
    loadProtocol: (id) => {
      const state = get();
      const protocol = state.protocols.find(p => p.id === id);
      if (protocol) {
        set({ currentProtocol: protocol });
      }
    },
    
    saveProtocol: (protocol) => {
      set((state) => ({
        protocols: state.protocols.map(p => 
          p.id === protocol.id ? { ...protocol, lastModified: new Date() } : p
        ),
        currentProtocol: protocol.id === state.currentProtocol?.id ? 
          { ...protocol, lastModified: new Date() } : state.currentProtocol
      }));
      
      get().saveToStorage();
    },
    
    deleteProtocol: (id) => {
      set((state) => ({
        protocols: state.protocols.filter(p => p.id !== id),
        currentProtocol: state.currentProtocol?.id === id ? null : state.currentProtocol
      }));
      
      get().saveToStorage();
    },
    
    addWidget: (widget) => {
      const state = get();
      if (!state.currentProtocol) return;
      
      const newWidget: ProtocolWidget = {
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      const updatedProtocol = {
        ...state.currentProtocol,
        widgets: [...state.currentProtocol.widgets, newWidget],
        lastModified: new Date()
      };
      
      get().saveProtocol(updatedProtocol);
    },
    
    updateWidget: (id, updates) => {
      const state = get();
      if (!state.currentProtocol) return;
      
      const updatedProtocol = {
        ...state.currentProtocol,
        widgets: state.currentProtocol.widgets.map(widget =>
          widget.id === id ? { ...widget, ...updates } : widget
        ),
        lastModified: new Date()
      };
      
      get().saveProtocol(updatedProtocol);
    },
    
    removeWidget: (id) => {
      const state = get();
      if (!state.currentProtocol) return;
      
      const updatedProtocol = {
        ...state.currentProtocol,
        widgets: state.currentProtocol.widgets.filter(widget => widget.id !== id),
        lastModified: new Date()
      };
      
      get().saveProtocol(updatedProtocol);
    },
    
    moveWidget: (id, position) => {
      get().updateWidget(id, { position });
    },
    
    startBuilding: () => {
      set({ isBuilding: true });
    },
    
    stopBuilding: () => {
      set({ isBuilding: false });
    },
    
    loadFromStorage: () => {
      const stored = getLocalStorage('research-protocols');
      if (stored) {
        set({ 
          protocols: stored.map((p: any) => ({
            ...p,
            created: new Date(p.created),
            lastModified: new Date(p.lastModified)
          }))
        });
      }
    },
    
    saveToStorage: () => {
      const state = get();
      setLocalStorage('research-protocols', state.protocols);
    }
  }))
);
