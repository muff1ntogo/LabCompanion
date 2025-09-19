import React from 'react';
import { Input } from '@/components/ui/input';
import { ProtocolWidget } from '@/types/research';

interface DilutionWidgetProps {
  widget: ProtocolWidget;
}

const DilutionWidget: React.FC<DilutionWidgetProps> = ({ widget }) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-gray-900 dark:text-white">Dilution Widget</p>
    <div className="mt-2">
      <label className="block text-sm mb-1">Input Value</label>
      <Input type="number" value={widget.config.inputValue} readOnly />
      <span className="text-xs">Unit: {widget.config.inputUnit}</span>
    </div>
    <div className="mt-2">
      <label className="block text-sm mb-1">Dilution Method</label>
      <span className="text-xs">{widget.config.method === 'factor' ? `Factor: ${widget.config.factor}` : `Target Concentration: ${widget.config.targetConcentration}`}</span>
    </div>
    <div className="mt-2">
      <label className="block text-sm mb-1">Output Unit</label>
      <span className="text-xs">{widget.config.outputUnit}</span>
    </div>
    <div className="mt-2">
      <label className="block text-sm mb-1">Concentration Unit</label>
      <span className="text-xs">{widget.config.concentrationUnit || 'mg/mL'}</span>
    </div>
  </div>
);

export default DilutionWidget;
