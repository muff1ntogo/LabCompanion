import React, { useState, useEffect } from 'react';
import { useResearch } from '@/lib/stores/useResearch';
import { useQuests } from '@/lib/stores/useQuests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, CheckSquare, X } from 'lucide-react';
import { Checklist, ChecklistItem } from '@/types/research';

interface ChecklistManagerProps {
  widgetId?: string;
  initialItems?: ChecklistItem[];
  onComplete?: () => void;
}

export function ChecklistManager({ 
  widgetId, 
  initialItems = [],
  onComplete 
}: ChecklistManagerProps) {
  const { 
    checklists, 
    addChecklist, 
    removeChecklist, 
    addChecklistItem, 
    toggleChecklistItem, 
    removeChecklistItem 
  } = useResearch();
  
  const { updateQuestProgress } = useQuests();
  
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<{ [key: string]: string }>({});

  // Initialize widget checklist if needed
  useEffect(() => {
    if (widgetId && initialItems.length > 0) {
      const existingChecklist = checklists.find(c => c.widgetId === widgetId);
      if (!existingChecklist) {
        addChecklist({
          title: 'Protocol Checklist',
          items: initialItems,
          widgetId
        });
      }
    }
  }, [widgetId, initialItems, checklists, addChecklist]);

  // Handle completion
  useEffect(() => {
    checklists.forEach(checklist => {
      const completedItems = checklist.items.filter(item => item.completed).length;
      const totalItems = checklist.items.length;
      
      if (totalItems > 0 && completedItems === totalItems) {
        updateQuestProgress('quest-checklist-1', 
          checklists.filter(c => c.items.every(item => item.completed) && c.items.length > 0).length
        );
        if (onComplete && checklist.widgetId === widgetId) {
          onComplete();
        }
      }
    });
  }, [checklists, updateQuestProgress, onComplete, widgetId]);

  const handleAddChecklist = () => {
    if (newChecklistTitle.trim()) {
      addChecklist({
        title: newChecklistTitle,
        items: []
      });
      setNewChecklistTitle('');
    }
  };

  const handleAddItem = (checklistId: string) => {
    const text = newItemTexts[checklistId];
    if (text && text.trim()) {
      addChecklistItem(checklistId, {
        text: text.trim(),
        completed: false
      });
      setNewItemTexts({ ...newItemTexts, [checklistId]: '' });
    }
  };

  const getProgress = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    const completed = checklist.items.filter(item => item.completed).length;
    return (completed / checklist.items.length) * 100;
  };

  const relevantChecklists = widgetId 
    ? checklists.filter(checklist => checklist.widgetId === widgetId)
    : checklists;

  if (widgetId && relevantChecklists.length === 0) {
    // Single checklist widget mode - no checklist created yet
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-500 text-center py-4">
          This checklist is empty. Add items in the protocol builder.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add new checklist - only show in general checklist manager */}
      {!widgetId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Add Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Checklist title"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                className="text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddChecklist()}
              />
              <Button onClick={handleAddChecklist} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklists */}
      <div className="space-y-3">
        {relevantChecklists.map((checklist) => {
          const progress = getProgress(checklist);
          const isCompleted = progress === 100 && checklist.items.length > 0;
          
          return (
            <Card key={checklist.id} className={`transition-colors ${
              isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{checklist.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <Badge variant="secondary" className="text-xs">
                        Complete
                      </Badge>
                    )}
                    {!widgetId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChecklist(checklist.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {checklist.items.length > 0 && (
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {checklist.items.filter(item => item.completed).length} / {checklist.items.length} completed
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Checklist items */}
                <div className="space-y-2">
                  {checklist.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleChecklistItem(checklist.id, item.id)}
                        className="mt-0.5"
                      />
                      <span className={`flex-1 text-sm ${
                        item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.text}
                      </span>
                      {item.completed && item.timestamp && (
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChecklistItem(checklist.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-red-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add new item */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new item..."
                    value={newItemTexts[checklist.id] || ''}
                    onChange={(e) => setNewItemTexts({ 
                      ...newItemTexts, 
                      [checklist.id]: e.target.value 
                    })}
                    className="text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem(checklist.id)}
                  />
                  <Button
                    onClick={() => handleAddItem(checklist.id)}
                    size="sm"
                    disabled={!newItemTexts[checklist.id]?.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {relevantChecklists.length === 0 && !widgetId && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No checklists created</p>
          <p className="text-sm">Add a checklist to track your tasks</p>
        </div>
      )}
    </div>
  );
}
