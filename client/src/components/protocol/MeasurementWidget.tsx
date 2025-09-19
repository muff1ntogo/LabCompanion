import React from 'react';
import { Input } from '@/components/ui/input';
import { ProtocolWidget } from '@/types/research';

interface MeasurementWidgetProps {
  widget: ProtocolWidget;
}

const MeasurementWidget: React.FC<MeasurementWidgetProps> = ({ widget }) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-gray-900 dark:text-white">
      Target: {widget.config.target || 1} {widget.config.unit || 'ml'}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      Tolerance: ±{widget.config.tolerance || 0.1} {widget.config.unit || 'ml'}
    </p>
    <div className="mt-2">
      <label className="block text-sm mb-1">Record Measurement</label>
      <Input type="number" placeholder={`Enter measured value (${widget.config.unit || 'ml'})`} />
    </div>
    {widget.config.enableConversion && (
      <div className="mt-2">
        <label className="block text-sm mb-1">Quick Unit Conversion</label>
        <div className="flex gap-2">
          <Input type="number" placeholder="Value" />
          <select className="border rounded px-2 py-1 text-sm">
            <option value="L">L</option>
            <option value="mL">mL</option>
            <option value="uL">uL</option>
            <option value="nL">nL</option>
          </select>
          <span className="text-xs">to</span>
          <select className="border rounded px-2 py-1 text-sm">
            <option value="L">L</option>
            <option value="mL">mL</option>
            <option value="uL">uL</option>
            <option value="nL">nL</option>
          </select>
          <span className="text-xs">Concentration:</span>
          <select className="border rounded px-2 py-1 text-sm">
            <option value="g/L">g/L</option>
            <option value="mg/mL">mg/mL</option>
            <option value="ug/uL">ug/uL</option>
            <option value="ng/nL">ng/nL</option>
          </select>
        </div>
      </div>
    )}
  </div>
);

export default MeasurementWidget;
