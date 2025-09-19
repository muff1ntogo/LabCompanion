import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProtocol } from '@/lib/stores/useProtocol';
import { useJournal } from '@/lib/stores/useJournal';

interface RunProtocolPageProps {
  protocolId: string;
  onExit: () => void;
}

export function RunProtocolPage({ protocolId, onExit }: RunProtocolPageProps) {
  const { protocols, updateWidget, saveProtocol } = useProtocol();
  const addJournalLog = useJournal((state: any) => state.addLog);
  const protocol = protocols.find(p => p.id === protocolId);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!protocol) return <div className="p-8 text-center">Protocol not found.</div>;

  const widgets = protocol.widgets;
  const currentWidget = widgets[step];

  const handleNext = () => {
    if (step < widgets.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleSaveAndExit = () => {
    let log = `Protocol Run: ${protocol.name}\nSteps:`;
    widgets.forEach((widget, idx) => {
      log += `\n  ${idx + 1}. ${widget.title || widget.type}`;
    });
    addJournalLog(log);
    saveProtocol({ ...protocol });
    onExit();
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-xl font-bold mb-4">Protocol Complete!</h2>
        <p className="mb-6">All steps finished. You can save this run to your journal or exit.</p>
        <div className="flex gap-4">
          <Button onClick={handleSaveAndExit} variant="default">Save to Journal & Exit</Button>
          <Button onClick={onExit} variant="outline">Exit</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <Card className="w-full max-w-md">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Step {step + 1}: {currentWidget.title}</h3>
            <Badge variant={currentWidget.completed ? 'default' : 'secondary'}>
              {currentWidget.completed ? 'Completed' : 'Pending'}
            </Badge>
          </div>
          {/* Render widget details here, or custom widget UI if needed */}
          <div className="mb-4">
            <pre className="text-xs text-gray-600 dark:text-gray-300">{JSON.stringify(currentWidget.config, null, 2)}</pre>
          </div>
          <Button onClick={handleNext} variant="default">
            {step < widgets.length - 1 ? 'Next Step' : 'Finish'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
