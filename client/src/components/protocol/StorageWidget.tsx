import React from 'react';
import { ProtocolWidget } from '@/types/research';

interface StorageWidgetProps {
  widget: ProtocolWidget;
}

const StorageWidget: React.FC<StorageWidgetProps> = ({ widget }) => (
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

export default StorageWidget;
