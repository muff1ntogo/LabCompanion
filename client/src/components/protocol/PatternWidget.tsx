import React from 'react';
import { ProtocolWidget } from '@/types/research';

interface PatternWidgetProps {
  widget: ProtocolWidget;
}

const PatternWidget: React.FC<PatternWidgetProps> = ({ widget }) => (
  <div className="space-y-2">
    <p className="text-sm text-gray-600 dark:text-gray-300">
      Steps: {widget.config.steps?.length || 0} | Repeat: {widget.config.repeatCount || 1}x
    </p>
    <div className="text-xs text-gray-500 dark:text-gray-400">
      Protocol pattern widget
    </div>
  </div>
);

export default PatternWidget;
