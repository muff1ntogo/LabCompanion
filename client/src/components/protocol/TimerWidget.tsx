import React from 'react';
import { TimerManager } from '../TimerManager';
import { ProtocolWidget } from '@/types/research';

interface TimerWidgetProps {
  widget: ProtocolWidget;
  onComplete: () => void;
}

const TimerWidget: React.FC<TimerWidgetProps> = ({ widget, onComplete }) => (
  <TimerManager
    widgetId={widget.id}
    initialDuration={widget.config.duration || 300}
    autoStart={widget.config.autoStart || false}
    onComplete={onComplete}
  />
);

export default TimerWidget;
