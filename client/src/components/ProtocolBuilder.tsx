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
  DialogTitle
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
import { RunProtocolPage } from './RunProtocolPage';
import MeasurementWidget from './protocol/MeasurementWidget';
import DilutionWidget from './protocol/DilutionWidget';
import PatternWidget from './protocol/PatternWidget';
import PCRWidget from './protocol/PCRWidget';
import StorageWidget from './protocol/StorageWidget';
import TimerWidget from './protocol/TimerWidget';

const ProtocolBuilder: React.FC = () => {
  // Dialog states and config for widget config
  const [dialogState, setDialogState] = useState<null | {
    type: ProtocolWidget['type'];
    open: boolean;
  }>(null);
  const [patternConfig, setPatternConfig] = useState({ steps: [], repeatCount: 1 });
  const [measurementConfig, setMeasurementConfig] = useState({ unit: 'ml', target: 1, tolerance: 0.1, enableConversion: false });
  const [pcrConfig, setPCRConfig] = useState({ cycles: 30, denaturation: 95, annealing: 55, extension: 72 });
  const [storageConfig, setStorageConfig] = useState({ temperature: -20, location: 'Freezer A', duration: '24 hours' });
  const [dilutionConfig, setDilutionConfig] = useState({ method: 'factor', factor: 2, targetConcentration: '', inputValue: '', inputUnit: 'ml', outputUnit: 'ml' });
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
  const [showRunPage, setShowRunPage] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editMode, setEditMode] = useState(false);

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
    if (['timer', 'pattern', 'measurement', 'pcr', 'storage', 'dilution'].includes(type)) {
      setPendingTimerPosition(position);
      setDialogState({ type, open: true });
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
      case 'dilution':
        return { method: 'factor', factor: 2, targetConcentration: '', inputValue: '', inputUnit: 'ml', outputUnit: 'ml' };
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
      setEditMode(false); // Exit edit mode after saving
    }
  };

  const renderWidget = (widget: ProtocolWidget) => {
    switch (widget.type) {
      case 'timer':
        return <TimerWidget widget={widget} onComplete={() => updateWidget(widget.id, { completed: true })} />;
      case 'pattern':
        return <PatternWidget widget={widget} />;
      case 'measurement':
        return <MeasurementWidget widget={widget} />;
      case 'pcr':
        return <PCRWidget widget={widget} />;
      case 'dilution':
        return <DilutionWidget widget={widget} />;
      case 'storage':
        return <StorageWidget widget={widget} />;
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
      case 'dilution': return <FlaskConical className="w-5 h-5" />;
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
      case 'dilution': return 'Dilution';
      default: return 'Widget';
    }
  };

  // Widget Popup Menu Component
  const renderWidgetPopup = () => {
  const widgetTypes: ProtocolWidget['type'][] = ['timer', 'pattern', 'measurement', 'pcr', 'storage', 'dilution'];
    
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
            {(['timer', 'pattern', 'measurement', 'pcr', 'storage', 'dilution'] as ProtocolWidget['type'][]).map((type) => (
              <Button
                key={type}
                variant="ghost"
                className="h-16 flex-col gap-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setShowWidgetPopover(false);
                  if (type === 'timer') setShowTimerConfig(true);
                  else setDialogState({ type, open: true });
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

  // Swipe-to-delete logic
  const [swipedWidgetId, setSwipedWidgetId] = useState<string | null>(null);
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, id: string) => {
    (e.currentTarget as HTMLDivElement).dataset.touchStartX = String(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>, id: string) => {
    const startX = Number((e.currentTarget as HTMLDivElement).dataset.touchStartX);
    const currentX = e.touches[0].clientX;
    if (currentX - startX > 60) {
      setSwipedWidgetId(id);
    }
  };
  const handleTouchEnd = (id: string) => {
    setTimeout(() => setSwipedWidgetId(null), 1500);
  };

  // Editor State - Active protocol editing with full-width canvas
  const renderEditorState = () => (
  <div className="flex-1 relative overflow-hidden">
    {viewMode === 'run' && currentProtocol ? (
      <RunProtocolPage protocolId={currentProtocol.id} onExit={() => setViewMode('build')} />
    ) : (
      <div className="h-full overflow-y-auto p-4 flex flex-col">
        {/* Back button top left */}
        <div className="flex items-center mb-4" style={{ position: 'relative', top: 0, left: 0, zIndex: 40 }}>
          <Button
            className="bg-blue-600 text-white rounded-full shadow-lg p-3 hover:bg-blue-700 transition"
            style={{ minWidth: 40, minHeight: 40 }}
            onClick={() => {
              setEditMode(false);
              stopBuilding(); // Go back to protocol library
            }}
            aria-label="Back"
            size="icon"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </Button>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="max-w-4xl w-full space-y-6">
            {currentProtocol?.widgets.map((widget) => (
              <div
                key={widget.id}
                className="relative"
                onTouchStart={e => handleTouchStart(e, widget.id)}
                onTouchMove={e => handleTouchMove(e, widget.id)}
                onTouchEnd={() => handleTouchEnd(widget.id)}
              >
                <Card className={`p-4 transition-all ${swipedWidgetId === widget.id ? 'translate-x-20 bg-red-100' : ''}`}> 
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">{widget.title}</h3>
                    <Badge variant={widget.completed ? 'default' : 'secondary'}>
                      {widget.completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  {renderWidget(widget)}
                  {editMode && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeWidget(widget.id)}
                    >
                      Delete
                    </Button>
                  )}
                  {swipedWidgetId === widget.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 animate-bounce"
                      onClick={() => removeWidget(widget.id)}
                    >
                      Delete
                    </Button>
                  )}
                </Card>
              </div>
            ))}
            {currentProtocol?.widgets.length === 0 && (
              <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 h-full min-h-[200px]">
                Click the + button to add widgets and build your protocol
              </div>
            )}
          </div>
        </div>
        {/* Plus button to add widgets bottom right */}
        {isBuilding && (
          <Popover open={showWidgetPopover} onOpenChange={setShowWidgetPopover}>
            <PopoverTrigger asChild>
              <Button
                className="fixed bottom-20 right-4 shadow-lg z-50 sm:bottom-6 sm:right-6 h-12 w-12 rounded-full bg-green-600 text-white"
                size="icon"
                aria-label="Add Widget"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" side="top" align="end">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white text-sm">Add Widget</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['timer', 'pattern', 'measurement', 'pcr', 'storage', 'dilution'] as ProtocolWidget['type'][]).map((type) => (
                  <Button
                    key={type}
                    variant="ghost"
                    className="h-16 flex-col gap-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setShowWidgetPopover(false);
                      if (type === 'timer') setShowTimerConfig(true);
                      else setDialogState({ type, open: true });
                    }}
                  >
                    {getWidgetIcon(type)}
                    <span className="text-xs">{getWidgetLabel(type)}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
        {/* Edit/Save button bottom left */}
        {isBuilding && !editMode && (
          <Button
            onClick={() => setEditMode(true)}
            className="fixed bottom-20 left-4 shadow-lg z-50 sm:bottom-6 sm:left-6 h-12 w-12 rounded-full bg-blue-600 text-white"
            size="icon"
            aria-label="Edit"
          >
            <Edit className="w-6 h-6" />
          </Button>
        )}
        {isBuilding && editMode && (
          <Button
            onClick={handleSaveProtocol}
            className="fixed bottom-20 left-4 shadow-lg z-50 sm:bottom-6 sm:left-6 h-12 w-12 rounded-full bg-blue-600 text-white"
            size="icon"
            aria-label="Save"
          >
            <Save className="w-6 h-6" />
          </Button>
        )}
      </div>
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

  // Generic widget config dialog
  const renderWidgetConfigDialog = () => {
    if (!dialogState) return null;
    const { type, open } = dialogState;
    let config: any;
    let setConfig: (c: any) => void;
    let fields: Array<any>;
    let title: string;
    let resetConfig: () => void;
    if (type === 'pattern') {
      config = patternConfig;
      setConfig = setPatternConfig;
      title = 'Add Protocol Pattern';
      fields = [
        { label: 'Repeat Count', type: 'number', min: 1, value: config.repeatCount, onChange: (v: any) => setConfig({ ...config, repeatCount: Number(v) }) }
      ];
      resetConfig = () => setPatternConfig({ steps: [], repeatCount: 1 });
    } else if (type === 'measurement') {
      config = measurementConfig;
      setConfig = setMeasurementConfig;
      title = 'Add Measurement';
      fields = [
        { label: 'Target', type: 'number', value: config.target, onChange: (v: any) => setConfig({ ...config, target: Number(v) }) },
        { label: 'Unit', type: 'select', value: config.unit, options: ['L', 'mL', 'uL', 'nL'], onChange: (v: any) => setConfig({ ...config, unit: v }) },
        { label: 'Tolerance', type: 'number', value: config.tolerance, onChange: (v: any) => setConfig({ ...config, tolerance: Number(v) }) },
        { label: 'Enable Quick Unit Conversion', type: 'checkbox', value: config.enableConversion, onChange: (v: any) => setConfig({ ...config, enableConversion: v }) }
      ];
      resetConfig = () => setMeasurementConfig({ unit: 'ml', target: 1, tolerance: 0.1, enableConversion: false });
    } else if (type === 'pcr') {
      config = pcrConfig;
      setConfig = setPCRConfig;
      title = 'Add PCR Cycle';
      fields = [
        { label: 'Cycles', type: 'number', value: config.cycles, onChange: (v: any) => setConfig({ ...config, cycles: Number(v) }) },
        { label: 'Denaturation (°C)', type: 'number', value: config.denaturation, onChange: (v: any) => setConfig({ ...config, denaturation: Number(v) }) },
        { label: 'Annealing (°C)', type: 'number', value: config.annealing, onChange: (v: any) => setConfig({ ...config, annealing: Number(v) }) },
        { label: 'Extension (°C)', type: 'number', value: config.extension, onChange: (v: any) => setConfig({ ...config, extension: Number(v) }) }
      ];
      resetConfig = () => setPCRConfig({ cycles: 30, denaturation: 95, annealing: 55, extension: 72 });
    } else if (type === 'timer') {
      config = { duration: timerDuration, autoStart: timerAutoStart };
      setConfig = (c: any) => {
        setTimerDuration(c.duration);
        setTimerAutoStart(c.autoStart);
      };
      title = 'Add Timer';
      fields = [
        { label: 'Duration (seconds)', type: 'number', min: 1, value: config.duration, onChange: (v: any) => setConfig({ ...config, duration: Number(v) }) },
        { label: 'Auto Start', type: 'checkbox', value: config.autoStart, onChange: (v: any) => setConfig({ ...config, autoStart: v }) }
      ];
      resetConfig = () => { setTimerDuration(300); setTimerAutoStart(false); };
    } else if (type === 'dilution') {
      config = dilutionConfig;
      setConfig = setDilutionConfig;
      title = 'Add Dilution';
      fields = [
        { label: 'Input Value', type: 'number', value: config.inputValue, onChange: (v: any) => setConfig({ ...config, inputValue: v }) },
        { label: 'Input Unit', type: 'select', value: config.inputUnit, options: ['L', 'mL', 'uL', 'nL'], onChange: (v: any) => setConfig({ ...config, inputUnit: v }) },
        { label: 'Dilution Method', type: 'select', value: config.method, options: ['factor', 'target concentration'], onChange: (v: any) => setConfig({ ...config, method: v }) },
        { label: 'Dilution Factor', type: 'number', value: config.factor, onChange: (v: any) => setConfig({ ...config, factor: v }) },
        { label: 'Target Concentration', type: 'text', value: config.targetConcentration, onChange: (v: any) => setConfig({ ...config, targetConcentration: v }) },
        { label: 'Output Unit', type: 'select', value: config.outputUnit, options: ['L', 'mL', 'uL', 'nL'], onChange: (v: any) => setConfig({ ...config, outputUnit: v }) },
        { label: 'Concentration Unit', type: 'select', value: config.concentrationUnit || 'mg/mL', options: ['g/L', 'mg/mL', 'ug/uL', 'ng/nL'], onChange: (v: any) => setConfig({ ...config, concentrationUnit: v }) }
      ];
      resetConfig = () => setDilutionConfig({ method: 'factor', factor: 2, targetConcentration: '', inputValue: '', inputUnit: 'ml', outputUnit: 'ml' });
    } else if (type === 'storage') {
      config = storageConfig;
      setConfig = setStorageConfig;
      title = 'Add Storage';
      fields = [
        { label: 'Temperature (°C)', type: 'number', value: config.temperature, onChange: (v: any) => setConfig({ ...config, temperature: Number(v) }) },
        { label: 'Location', type: 'text', value: config.location, onChange: (v: any) => setConfig({ ...config, location: v }) },
        { label: 'Duration', type: 'text', value: config.duration, onChange: (v: any) => setConfig({ ...config, duration: v }) }
      ];
      resetConfig = () => setStorageConfig({ temperature: -20, location: 'Freezer A', duration: '24 hours' });
    } else {
      return null;
    }
    const handleClose = () => {
      setDialogState(null);
      resetConfig();
    };
    const handleAdd = () => {
      let widgetConfig = config;
      if (type === 'timer') widgetConfig = { duration: timerDuration, autoStart: timerAutoStart };
      addWidget({
        type,
        title: getDefaultWidgetTitle(type),
        config: widgetConfig,
        position: pendingTimerPosition,
        completed: false
      });
      setDialogState(null);
      resetConfig();
      if (type === 'timer') setPendingTimerPosition({ x: 50, y: 50 });
    };
    return (
      <Dialog open={open} onOpenChange={open => { if (!open) handleClose(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={i}>
                {field.type === 'checkbox' ? (
                  <label className="inline-flex items-center mt-2">
                    <input type="checkbox" className="mr-2" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                    {field.label}
                  </label>
                ) : (
                  <>
                    <label className="block text-sm">{field.label}</label>
                    <Input type={field.type} min={field.min} value={field.value} onChange={e => field.onChange(e.target.value)} />
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAdd}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      {renderProtocolContent()}
      {renderWidgetConfigDialog()}
    </>
  );

  // Only use the new generic dialog logic
}

export { ProtocolBuilder };
