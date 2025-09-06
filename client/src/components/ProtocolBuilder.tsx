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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Save, Eye, Trash2, Edit, Maximize2, Minimize2, X, FlaskConical, Timer, CheckSquare, StickyNote, Thermometer, Beaker } from 'lucide-react';
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
  const [showWidgetPopover, setShowWidgetPopover] = useState(false);
  const [viewMode, setViewMode] = useState<'build' | 'run'>('build');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Determine the current state
  const getProtocolBuilderState = () => {
    if (protocols.length === 0) return 'empty';
    if (!currentProtocol || !isBuilding) return 'library';
    return 'editor';
  };

  const protocolState = getProtocolBuilderState();

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

  // Full-screen protocol builder component
  const FullScreenProtocolBuilder = () => (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Full-screen header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Protocol Builder</h1>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullScreen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Full-screen content */}
      <div className="flex-1 flex overflow-hidden">
        {renderProtocolContent()}
      </div>
    </div>
  );

  // Empty State - No protocols exist
  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8">
        <FlaskConical className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Protocols Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first protocol to get started with your research workflow</p>
      </div>
    </div>
  );

  // Library State - Show existing protocols
  const renderLibraryState = () => (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {protocols.map((protocol) => (
            <Card 
              key={protocol.id}
              className={`cursor-pointer transition-colors hover:shadow-md ${
                currentProtocol?.id === protocol.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => loadProtocol(protocol.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">{protocol.name}</h3>
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
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{protocol.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {protocol.widgets.length} widgets
                  </Badge>
                  {protocol.questReward && (
                    <Badge variant="outline" className="text-xs">
                      +{protocol.questReward} pts
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadProtocol(protocol.id);
                      startBuilding();
                      setViewMode('build');
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadProtocol(protocol.id);
                      setViewMode('run');
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const getWidgetIcon = (type: ProtocolWidget['type']) => {
    switch (type) {
      case 'timer': return <Timer className="w-5 h-5" />;
      case 'checklist': return <CheckSquare className="w-5 h-5" />;
      case 'note': return <StickyNote className="w-5 h-5" />;
      case 'temperature': return <Thermometer className="w-5 h-5" />;
      case 'ph': return <Beaker className="w-5 h-5" />;
      default: return <StickyNote className="w-5 h-5" />;
    }
  };

  const getWidgetLabel = (type: ProtocolWidget['type']) => {
    switch (type) {
      case 'timer': return 'Timer';
      case 'checklist': return 'Checklist';
      case 'note': return 'Note';
      case 'temperature': return 'Temperature';
      case 'ph': return 'pH Meter';
      default: return 'Widget';
    }
  };

  // Widget Popup Menu Component
  const renderWidgetPopup = () => {
    const widgetTypes: ProtocolWidget['type'][] = ['timer', 'checklist', 'note', 'temperature', 'ph'];
    
    return (
      <Popover open={showWidgetPopover} onOpenChange={setShowWidgetPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" side="top" align="end">
          <h3 className="font-medium mb-3 text-gray-900 dark:text-white text-sm">Add Widget</h3>
          <div className="grid grid-cols-2 gap-2">
            {widgetTypes.map((type) => (
              <Button
                key={type}
                variant="ghost"
                className="h-16 flex-col gap-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  handleAddWidget(type);
                  setShowWidgetPopover(false);
                }}
              >
                {getWidgetIcon(type)}
                <span className="text-xs">{getWidgetLabel(type)}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Editor State - Active protocol editing with full-width canvas
  const renderEditorState = () => (
    <div className="flex-1 relative overflow-hidden">
      {viewMode === 'run' ? (
        <div className="h-full overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {currentProtocol?.widgets.map((widget) => (
              <Card key={widget.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
                  <Badge variant={widget.completed ? 'default' : 'secondary'}>
                    {widget.completed ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                {renderWidget(widget)}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          <DropZone onDrop={(position) => handleAddWidget('note', position)}>
            {currentProtocol?.widgets.map((widget) => (
              <PlacedWidget
                key={widget.id}
                widget={widget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onUpdate={updateWidget}
              >
                {renderWidget(widget)}
              </PlacedWidget>
            ))}
            {currentProtocol?.widgets.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Click the + button to add widgets and build your protocol
              </div>
            )}
          </DropZone>
          
          {/* Widget Popup Menu */}
          {renderWidgetPopup()}
          
          {/* Save Button */}
          {isBuilding && (
            <Button
              onClick={handleSaveProtocol}
              className="fixed bottom-6 left-6 shadow-lg z-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Protocol
            </Button>
          )}
        </>
      )}
    </div>
  );

  // Function to render the main protocol content based on state
  const renderProtocolContent = () => {
    switch (protocolState) {
      case 'empty':
        return renderEmptyState();
      case 'library':
        return renderLibraryState();
      case 'editor':
        return renderEditorState();
      default:
        return renderEmptyState();
    }
  };

  // Show full-screen version on mobile if enabled
  if (isFullScreen) {
    return (
      <DragDropProvider>
        <FullScreenProtocolBuilder />
      </DragDropProvider>
    );
  }

  return (
    <DragDropProvider>
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Protocol Builder</h1>
            <div className="flex items-center gap-2">
              {/* Full-screen toggle - Mobile only */}
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                {isFullScreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              
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

          {/* State indicator */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {protocolState === 'empty' && 'No Protocols'}
              {protocolState === 'library' && `${protocols.length} Protocols`}
              {protocolState === 'editor' && 'Editing Protocol'}
            </Badge>
            {currentProtocol && protocolState === 'editor' && (
              <Badge variant="default" className="text-xs">
                {currentProtocol.name}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {renderProtocolContent()}
        </div>
      </div>
    </DragDropProvider>
  );
}
