import React from 'react';
import { ProtocolWidget } from '@/types/research';

interface PCRWidgetProps {
  widget: ProtocolWidget;
}

const PCRWidget: React.FC<PCRWidgetProps> = ({ widget }) => (
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

export default PCRWidget;
