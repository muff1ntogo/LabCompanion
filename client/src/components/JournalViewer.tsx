import React, { useState } from 'react';
import { useJournal } from '@/lib/stores/useJournal';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export const JournalViewer: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const entries = useJournal((state: any) => state.entries);
  const exportDay = useJournal((state: any) => state.exportDay);
  const dates = Object.keys(entries).sort().reverse();

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-2">Lab Journal</h2>
      <div className="mb-2">
        <label className="mr-2">Select Date:</label>
  <select value={selectedDate} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDate(e.target.value)}>
          {dates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
        <Button className="ml-2" onClick={() => {
          const text = exportDay(selectedDate);
          const blob = new Blob([text], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `journal-${selectedDate}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }}>Export as .txt</Button>
      </div>
      <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
        {exportDay(selectedDate) || 'No entry for this date.'}
      </pre>
    </div>
  );
};
