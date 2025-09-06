import React, { useState, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { ProtocolWidget } from '@/types/research';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, CheckSquare, StickyNote, Thermometer, Beaker, Trash2 } from 'lucide-react';

interface DragDropWidgetProps {
  children: React.ReactNode;
}

export function DragDropProvider({ children }: DragDropWidgetProps) {
  const isMobile = useIsMobile();
  const backend = isMobile ? TouchBackend : HTML5Backend;
  
  return (
    <DndProvider backend={backend}>
      {children}
    </DndProvider>
  );
}

interface WidgetItemProps {
  type: ProtocolWidget['type'];
  onAdd: (type: ProtocolWidget['type']) => void;
}

export function WidgetItem({ type, onAdd }: WidgetItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'widget',
    item: { type },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onAdd(type);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

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

  return (
    <div
      ref={drag}
      className={`p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-move
        bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100`}
      onClick={() => onAdd(type)}
    >
      {getWidgetIcon(type)}
      {getWidgetLabel(type)}
    </div>
  );
}

interface DropZoneProps {
  onDrop: (position: { x: number; y: number }) => void;
  children: React.ReactNode;
  className?: string;
}

export function DropZone({ onDrop, children, className = '' }: DropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'widget',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        const dropZoneRect = dropRef.current?.getBoundingClientRect();
        if (dropZoneRect) {
          const position = {
            x: offset.x - dropZoneRect.left,
            y: offset.y - dropZoneRect.top
          };
          onDrop(position);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const dropRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={(node) => {
        drop(node);
        if (dropRef.current !== node) {
          (dropRef as any).current = node;
        }
      }}
      className={`min-h-full w-full border-2 border-dashed transition-colors relative
        ${isOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}
        ${className}`}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center">
          <div className="text-blue-600 font-medium">Drop widget here</div>
        </div>
      )}
    </div>
  );
}

interface PlacedWidgetProps {
  widget: ProtocolWidget;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ProtocolWidget>) => void;
  children?: React.ReactNode;
}

export function PlacedWidget({ 
  widget, 
  onMove, 
  onRemove, 
  onUpdate,
  children 
}: PlacedWidgetProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'placed-widget',
    item: { id: widget.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'placed-widget',
    drop: (item: { id: string }, monitor) => {
      if (item.id !== widget.id) return;
      
      const offset = monitor.getDifferenceFromInitialOffset();
      if (offset) {
        const newPosition = {
          x: widget.position.x + offset.x,
          y: widget.position.y + offset.y
        };
        onMove(widget.id, newPosition);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const getWidgetIcon = (type: ProtocolWidget['type']) => {
    switch (type) {
      case 'timer': return <Timer className="w-4 h-4" />;
      case 'checklist': return <CheckSquare className="w-4 h-4" />;
      case 'note': return <StickyNote className="w-4 h-4" />;
      case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'ph': return <Beaker className="w-4 h-4" />;
      default: return <StickyNote className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`absolute cursor-move ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{
        left: widget.position.x,
        top: widget.position.y,
        zIndex: 10
      }}
    >
      <Card className="w-64 border shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getWidgetIcon(widget.type)}
              <CardTitle className="text-sm">{widget.title}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {widget.completed && (
                <Badge variant="secondary" className="text-xs">
                  Done
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(widget.id)}
                className="h-6 w-6 p-0 hover:bg-red-100"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
