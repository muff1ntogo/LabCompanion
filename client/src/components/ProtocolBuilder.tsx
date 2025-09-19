import React, { useState, useEffect } from 'react';
import { useProtocol } from '@/lib/stores/useProtocol';
import { useQuests } from '@/lib/stores/useQuests';
import { useJournal } from '@/lib/stores/useJournal';
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
import { Plus, Save, Eye, Trash2, Edit, Maximize2, Minimize2, X, FlaskConical, Timer, GitBranch, Ruler, Dna, Package } from 'lucide-react';
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
  const addJournalLog = useJournal((state: any) => state.addLog);
  
  const { updateQuestProgress } = useQuests();
  
  const [newProtocolName, setNewProtocolName] = useState('');
  const [newProtocolDescription, setNewProtocolDescription] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showWidgetPopover, setShowWidgetPopover] = useState(false);
  const [showTimerConfig, setShowTimerConfig] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300); // 5 minutes default
  const [timerAutoStart, setTimerAutoStart] = useState(false);
  const [pendingTimerPosition, setPendingTimerPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
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
    if (type === 'timer') {
      // Store the position and show timer configuration popup
      setPendingTimerPosition(position);
      setShowTimerConfig(true);
      return;
    }
    
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

  const handleCreateTimer = () => {
    const widget: Omit<ProtocolWidget, 'id'> = {
      type: 'timer',
      title: 'Timer',
      config: { duration: timerDuration, autoStart: timerAutoStart },
      position: pendingTimerPosition,
      completed: false
    };
    addWidget(widget);
    setShowTimerConfig(false);
    setTimerDuration(300);
    setTimerAutoStart(false);
    setPendingTimerPosition({ x: 50, y: 50 });
  };

  const getDefaultWidgetConfig = (type: ProtocolWidget['type']) => {
    switch (type) {
      case 'timer':
        return { duration: 300, autoStart: false }; // 5 minutes default
      case 'pattern':
        return { steps: [], repeatCount: 1 };
      case 'measurement':
        return { unit: 'ml', target: 1, tolerance: 0.1 };
      case 'pcr':
        return { cycles: 30, denaturation: 95, annealing: 55, extension: 72 };
      case 'storage':
        return { temperature: -20, location: 'Freezer A', duration: '24 hours' };
      default:
        return {};
    }
  };

  const getDefaultWidgetTitle = (type: ProtocolWidget['type']) => {
    switch (type) {
      case 'timer': return 'Timer';
      case 'pattern': return 'Protocol Pattern';
      case 'measurement': return 'Measurement';
      case 'pcr': return 'PCR Cycle';
      case 'storage': return 'Storage';
      default: return 'Widget';
    }
  };

  const handleSaveProtocol = () => {
    if (currentProtocol) {
      saveProtocol(currentProtocol);
      // Log protocol run to journal
      let log = `Protocol: ${currentProtocol.name}\nSteps:`;
      currentProtocol.widgets?.forEach((widget: any, idx: number) => {
        log += `\n  ${idx + 1}. ${widget.title || widget.type}`;
      });
      addJournalLog(log);
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
      case 'pattern':
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Steps: {widget.config.steps?.length || 0} | Repeat: {widget.config.repeatCount || 1}x
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Protocol pattern widget
            </div>
          </div>
        );
      case 'measurement':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Target: {widget.config.target || 1} {widget.config.unit || 'ml'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tolerance: ±{widget.config.tolerance || 0.1} {widget.config.unit || 'ml'}
            </p>
          </div>
        );
      case 'pcr':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {widget.config.cycles || 30} Cycles
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>Denaturation: {widget.config.denaturation || 95}°C</div>
              <div>Annealing: {widget.config.annealing || 55}°C</div>
              <div>Extension: {widget.config.extension || 72}°C</div>
            </div>
          </div>
        );
      case 'storage':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {widget.config.location || 'Storage Location'}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>Temperature: {widget.config.temperature || -20}°C</div>
              <div>Duration: {widget.config.duration || '24 hours'}</div>
            </div>
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
      case 'pattern': return <GitBranch className="w-5 h-5" />;
      case 'measurement': return <Ruler className="w-5 h-5" />;
      case 'pcr': return <Dna className="w-5 h-5" />;
      case 'storage': return <Package className="w-5 h-5" />;
      default: return <Timer className="w-5 h-5" />;
    }
  };

  const getWidgetLabel = (type: ProtocolWidget['type']) => {
    switch (type) {
      case 'timer': return 'Timer';
      case 'pattern': return 'Pattern';
      case 'measurement': return 'Measurement';
      case 'pcr': return 'PCR';
      case 'storage': return 'Storage';
      default: return 'Widget';
    }
  };

  // Widget Popup Menu Component
  const renderWidgetPopup = () => {
    const widgetTypes: ProtocolWidget['type'][] = ['timer', 'pattern', 'measurement', 'pcr', 'storage'];
    
    return (
      <Popover open={showWidgetPopover} onOpenChange={setShowWidgetPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg z-50 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
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
          <DropZone onDrop={(type, position) => handleAddWidget(type, position)}>
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
              className="fixed bottom-20 left-4 shadow-lg z-50 sm:bottom-6 sm:left-6"
              size="sm"
            >
              <Save className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Save Protocol</span>
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
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Title and main actions */}
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Protocol Builder</h1>
              
              {/* Create button - always visible */}
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex-shrink-0">
                    <Plus className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">New Protocol</span>
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
              
              {/* Timer Configuration Dialog */}
              <Dialog open={showTimerConfig} onOpenChange={setShowTimerConfig}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure Timer</DialogTitle>
                    <DialogDescription>
                      Set up your timer duration and options.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-white">
                        Duration (minutes)
                      </label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={Math.floor(timerDuration / 60)}
                        onChange={(e) => setTimerDuration(parseInt(e.target.value || '5') * 60)}
                        min="1"
                        max="480"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoStart"
                        checked={timerAutoStart}
                        onChange={(e) => setTimerAutoStart(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="autoStart" className="text-sm text-gray-900 dark:text-white">
                        Auto-start timer when protocol runs
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowTimerConfig(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTimer}>
                        <Timer className="w-4 h-4 mr-2" />
                        Add Timer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Protocol controls and state - when protocol is selected */}
            {currentProtocol && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    Editing Protocol
                  </Badge>
                  <Badge variant="default" className="text-xs truncate max-w-32">
                    {currentProtocol.name}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant={viewMode === 'build' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setViewMode('build');
                      startBuilding();
                    }}
                  >
                    <Edit className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Build</span>
                  </Button>
                  <Button
                    variant={viewMode === 'run' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setViewMode('run');
                      stopBuilding();
                    }}
                  >
                    <Eye className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Run</span>
                  </Button>
                </div>
              </div>
            )}

            {/* State indicator for non-editor states */}
            {protocolState !== 'editor' && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {protocolState === 'empty' && 'No Protocols'}
                  {protocolState === 'library' && `${protocols.length} Protocols`}
                </Badge>
              </div>
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
