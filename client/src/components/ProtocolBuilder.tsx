import React, { useState, useEffect } from 'react';
import { useProtocol } from '@/lib/stores/useProtocol';
import { useQuests } from '@/lib/stores/useQuests';
import { DragDropProvider, WidgetItem, DropZone, PlacedWidget } from './DragDropWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Save, Eye, Trash2, Edit } from 'lucide-react';
import { ProtocolWidget } from '@/types/research';
import { TimerManager } from './TimerManager';
import { ChecklistManager } from './ChecklistManager';

export function ProtocolBuilder() {
  const {
    protocols,
    currentProtocol,
    isBuilding,
    createProtocol,
    loadProtocol,
    saveProtocol,
    deleteProtocol,
    addWidget,
    updateWidget,
    removeWidget,
    moveWidget,
    startBuilding,
    stopBuilding,
    loadFromStorage
  } = useProtocol();
  
  const { updateQuestProgress } = useQuests();
  
  const [newProtocolName, setNewProtocolName] = useState('');
  const [newProtocolDescription, setNewProtocolDescription] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'build' | 'run'>('build');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleCreateProtocol = () => {
    if (newProtocolName.trim()) {
      createProtocol(newProtocolName, newProtocolDescription);
      setNewProtocolName('');
      setNewProtocolDescription('');
      setShowCreateDialog(false);
      setViewMode('build');
    }
  };

  const handleAddWidget = (type: ProtocolWidget['type'], position: { x: number; y: number } = { x: 50, y: 50 }) => {
    const widgetConfig = getDefaultWidgetConfig(type);
    const widget: Omit<ProtocolWidget, 'id'> = {
      type,
      title: getDefaultWidgetTitle(type),
      config: widgetConfig,
      position,
      completed: false
    };
    addWidget(widget);
  };

  const getDefaultWidgetConfig = (type: ProtocolWidget['type']) => {
    switch (type) {
      case 'timer':
        return { duration: 300, autoStart: false }; // 5 minutes default
      case 'checklist':
        return { items: [] };
      case 'note':
        return { content: 'Add your notes here...' };
      case 'temperature':
        return { unit: 'celsius', target: 25 };
      case 'ph':
        return { target: 7.0, range: { min: 6.5, max: 7.5 } };
      default:
        return {};
    }
  };

  const getDefaultWidgetTitle = (type: ProtocolWidget['type']) => {
    switch (type) {
      case 'timer': return 'Timer';
      case 'checklist': return 'Checklist';
      case 'note': return 'Notes';
      case 'temperature': return 'Temperature Check';
      case 'ph': return 'pH Measurement';
      default: return 'Widget';
    }
  };

  const handleSaveProtocol = () => {
    if (currentProtocol) {
      saveProtocol(currentProtocol);
      updateQuestProgress('quest-protocol-1', 1);
      stopBuilding();
      setViewMode('run');
    }
  };

  const renderWidget = (widget: ProtocolWidget) => {
    switch (widget.type) {
      case 'timer':
        return (
          <TimerManager
            widgetId={widget.id}
            initialDuration={widget.config.duration || 300}
            autoStart={widget.config.autoStart || false}
            onComplete={() => updateWidget(widget.id, { completed: true })}
          />
        );
      case 'checklist':
        return (
          <ChecklistManager
            widgetId={widget.id}
            initialItems={widget.config.items || []}
            onComplete={() => updateWidget(widget.id, { completed: true })}
          />
        );
      case 'note':
        return (
          <div className="space-y-2">
            <Textarea
              value={widget.config.content || ''}
              onChange={(e) => updateWidget(widget.id, { 
                config: { ...widget.config, content: e.target.value }
              })}
              placeholder="Add your notes..."
              className="text-sm"
              rows={3}
            />
          </div>
        );
      case 'temperature':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Target:</span>
              <Input
                type="number"
                value={widget.config.target || 25}
                onChange={(e) => updateWidget(widget.id, {
                  config: { ...widget.config, target: parseFloat(e.target.value) }
                })}
                className="w-20 text-sm"
              />
              <span className="text-sm">°C</span>
            </div>
            <Input
              type="number"
              placeholder="Current temperature"
              className="text-sm"
              step="0.1"
            />
          </div>
        );
      case 'ph':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Target:</span>
              <Input
                type="number"
                value={widget.config.target || 7.0}
                onChange={(e) => updateWidget(widget.id, {
                  config: { ...widget.config, target: parseFloat(e.target.value) }
                })}
                className="w-20 text-sm"
                step="0.1"
              />
            </div>
            <Input
              type="number"
              placeholder="Current pH"
              className="text-sm"
              step="0.1"
              min="0"
              max="14"
            />
          </div>
        );
      default:
        return <div className="text-sm text-gray-500">Unknown widget type</div>;
    }
  };

  return (
    <DragDropProvider>
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Protocol Builder</h1>
            <div className="flex items-center gap-2">
              {currentProtocol && (
                <>
                  <Button
                    variant={viewMode === 'build' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setViewMode('build');
                      startBuilding();
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Build
                  </Button>
                  <Button
                    variant={viewMode === 'run' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setViewMode('run');
                      stopBuilding();
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Run
                  </Button>
                </>
              )}
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    New Protocol
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Protocol</DialogTitle>
                    <DialogDescription>
                      Create a new research protocol with custom widgets and settings.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Protocol name"
                      value={newProtocolName}
                      onChange={(e) => setNewProtocolName(e.target.value)}
                    />
                    <Textarea
                      placeholder="Protocol description"
                      value={newProtocolDescription}
                      onChange={(e) => setNewProtocolDescription(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateProtocol}>
                        Create
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Protocol List */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {protocols.map((protocol) => (
              <Card 
                key={protocol.id}
                className={`min-w-48 cursor-pointer transition-colors ${
                  currentProtocol?.id === protocol.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => loadProtocol(protocol.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{protocol.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{protocol.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {protocol.widgets.length} widgets
                        </Badge>
                        {protocol.questReward && (
                          <Badge variant="outline" className="text-xs">
                            +{protocol.questReward} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProtocol(protocol.id);
                      }}
                      className="h-6 w-6 p-0 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {currentProtocol ? (
          <div className="flex-1 flex">
            {/* Widget Palette - Only show in build mode */}
            {viewMode === 'build' && (
              <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 overflow-y-auto">
                <h3 className="font-medium mb-4">Widget Palette</h3>
                <div className="space-y-2">
                  <WidgetItem type="timer" onAdd={handleAddWidget} />
                  <WidgetItem type="checklist" onAdd={handleAddWidget} />
                  <WidgetItem type="note" onAdd={handleAddWidget} />
                  <WidgetItem type="temperature" onAdd={handleAddWidget} />
                  <WidgetItem type="ph" onAdd={handleAddWidget} />
                </div>
                
                {isBuilding && (
                  <div className="mt-6">
                    <Button onClick={handleSaveProtocol} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Save Protocol
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Canvas */}
            <div className="flex-1 p-4">
              <DropZone
                onDrop={(position) => handleAddWidget('timer', position)}
                className="relative w-full h-full rounded-lg"
              >
                {currentProtocol.widgets.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {viewMode === 'build' 
                      ? 'Drag widgets here to build your protocol'
                      : 'No widgets in this protocol'
                    }
                  </div>
                ) : (
                  currentProtocol.widgets.map((widget) => (
                    <PlacedWidget
                      key={widget.id}
                      widget={widget}
                      onMove={moveWidget}
                      onRemove={removeWidget}
                      onUpdate={updateWidget}
                    >
                      {renderWidget(widget)}
                    </PlacedWidget>
                  ))
                )}
              </DropZone>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No protocol selected</p>
              <p className="text-sm">Create a new protocol to get started</p>
            </div>
          </div>
        )}
      </div>
    </DragDropProvider>
  );
}
