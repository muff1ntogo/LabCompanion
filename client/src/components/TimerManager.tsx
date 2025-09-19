import React, { useEffect, useState } from 'react';
import { useResearch } from '@/lib/stores/useResearch';
import { useQuests } from '@/lib/stores/useQuests';
import { useAudio } from '@/lib/stores/useAudio';
import { useJournal } from '@/lib/stores/useJournal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Plus, Trash2, Timer as TimerIcon } from 'lucide-react';
import { Timer } from '@/types/research';

interface TimerManagerProps {
  widgetId?: string;
  initialDuration?: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export function TimerManager({ 
  widgetId, 
  initialDuration = 300, 
  autoStart = false,
  onComplete 
}: TimerManagerProps) {
  const { 
    timers, 
    addTimer, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    removeTimer, 
    updateTimerTick 
  } = useResearch();
  
  const { updateQuestProgress } = useQuests();
  const { playSuccess } = useAudio();
  const { addLog } = useJournal();
  
  const [newTimerDuration, setNewTimerDuration] = useState('5');
  const [newTimerName, setNewTimerName] = useState('');
  const [loggedTimers, setLoggedTimers] = useState(new Set<string>());

  // Timer tick effect
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimerTick();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateTimerTick]);

  // Handle timer completion
  useEffect(() => {
    timers.forEach(timer => {
      if (timer.isCompleted && !loggedTimers.has(timer.id)) {
        playSuccess();
        // Log timer completion to journal
        const durationMin = Math.round(timer.duration / 60);
        addLog(`Timer completed: "${timer.name}" (${durationMin} minutes)`);
        
        updateQuestProgress('quest-timer-1', 
          timers.filter(t => t.isCompleted).length
        );
        
        // Mark as logged to prevent duplicate logs
        setLoggedTimers(prev => new Set(prev).add(timer.id));
        
        if (onComplete) {
          onComplete();
        }
      }
    });
  }, [timers, playSuccess, updateQuestProgress, onComplete, addLog, loggedTimers]);

  const handleAddTimer = () => {
    const duration = parseInt(newTimerDuration) * 60; // Convert minutes to seconds
    const name = newTimerName || `Timer ${timers.length + 1}`;
    
    addTimer({
      name,
      duration,
      remaining: duration,
      isRunning: autoStart,
      isCompleted: false,
      widgetId
    });
    
    setNewTimerName('');
    setNewTimerDuration('5');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (timer: Timer) => {
    return ((timer.duration - timer.remaining) / timer.duration) * 100;
  };

  const relevantTimers = widgetId 
    ? timers.filter(timer => timer.widgetId === widgetId)
    : timers;

  if (widgetId && relevantTimers.length === 0) {
    // Single timer widget mode
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={newTimerDuration}
            onChange={(e) => setNewTimerDuration(e.target.value)}
            placeholder="Minutes"
            className="w-20 text-sm"
            min="1"
            max="999"
          />
          <span className="text-sm text-gray-500">min</span>
          <Button
            size="sm"
            onClick={handleAddTimer}
            className="ml-auto"
          >
            <Plus className="w-3 h-3 mr-1" />
            Start
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add new timer - only show in general timer manager */}
      {!widgetId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TimerIcon className="w-4 h-4" />
              Add Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Timer name"
              value={newTimerName}
              onChange={(e) => setNewTimerName(e.target.value)}
              className="text-sm"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newTimerDuration}
                onChange={(e) => setNewTimerDuration(e.target.value)}
                placeholder="Duration"
                className="flex-1 text-sm"
                min="1"
                max="999"
              />
              <span className="text-sm text-gray-500">minutes</span>
              <Button onClick={handleAddTimer} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active timers */}
      <div className="space-y-3">
        {relevantTimers.map((timer) => (
          <Card key={timer.id} className={`transition-colors ${
            timer.isCompleted ? 'bg-green-50 border-green-200' : 
            timer.isRunning ? 'bg-blue-50 border-blue-200' : 'bg-white'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{timer.name}</h3>
                  {timer.isCompleted && (
                    <Badge variant="secondary" className="text-xs">
                      Completed
                    </Badge>
                  )}
                  {timer.isRunning && (
                    <Badge variant="default" className="text-xs">
                      Running
                    </Badge>
                  )}
                </div>
                {!widgetId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTimer(timer.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {/* Progress bar */}
                <div className="space-y-1">
                  <Progress 
                    value={getProgress(timer)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatTime(timer.duration - timer.remaining)}</span>
                    <span>{formatTime(timer.remaining)}</span>
                  </div>
                </div>

                {/* Time display */}
                <div className="text-center">
                  <div className={`text-2xl font-mono font-bold ${
                    timer.isCompleted ? 'text-green-600 dark:text-green-400' :
                    timer.remaining <= 60 ? 'text-red-600 dark:text-red-400' :
                    timer.isRunning ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatTime(timer.remaining)}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-2">
                  {!timer.isCompleted && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => timer.isRunning ? pauseTimer(timer.id) : startTimer(timer.id)}
                      >
                        {timer.isRunning ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetTimer(timer.id)}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset
                      </Button>
                    </>
                  )}
                  {timer.isCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetTimer(timer.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restart
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {relevantTimers.length === 0 && !widgetId && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <TimerIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No active timers</p>
          <p className="text-sm">Add a timer to get started</p>
        </div>
      )}
    </div>
  );
}
