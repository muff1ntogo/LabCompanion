import React, { useState } from 'react';
import { useJournal } from '@/lib/stores/useJournal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ActivityHeatmap } from './ActivityHeatmap';
import { Calendar, Download, BookOpen, Activity } from 'lucide-react';

export const JournalViewer: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const entries = useJournal((state: any) => state.entries);
  const exportDay = useJournal((state: any) => state.exportDay);
  const dates = Object.keys(entries).sort().reverse();

  const handleDateClick = (date: string) => {
    if (date.startsWith('month:')) {
      setSelectedMonth(parseInt(date.split(':')[1]));
      return;
    }
    if (date.startsWith('year:')) {
      setSelectedYear(parseInt(date.split(':')[1]));
      return;
    }
    setSelectedDate(date);
  };

  const handleExport = () => {
    const text = exportDay(selectedDate);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-${selectedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalEntries = Object.keys(entries).length;
  const selectedEntry = entries[selectedDate];
  const entryCount = selectedEntry?.logs.length || 0;

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-900 scrollbar-hide">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Research Journal</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Track your daily research activities and protocol runs
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalEntries}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Total Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Object.values(entries).reduce((acc: number, entry: any) => acc + entry.logs.length, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Total Entries</div>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Research Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1 border rounded-md bg-white dark:bg-gray-800 text-sm border-gray-300 dark:border-gray-600"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <ActivityHeatmap
              year={selectedYear}
              month={selectedMonth}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </CardContent>
        </Card>

        {/* Journal Entry Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Available Dates:
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  <option value={format(new Date(), 'yyyy-MM-dd')}>
                    {format(new Date(), 'MMM d, yyyy')} (Today)
                  </option>
                  {dates.map(date => (
                    <option key={date} value={date}>
                      {format(new Date(date), 'MMM d, yyyy')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Entry info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Date:</span>
                  <Badge variant="outline">
                    {format(new Date(selectedDate), 'MMM d, yyyy')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Entries:</span>
                  <Badge variant={entryCount > 0 ? 'default' : 'secondary'}>
                    {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                  </Badge>
                </div>
              </div>

              <Button onClick={handleExport} className="w-full" disabled={entryCount === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export as .txt
              </Button>
            </CardContent>
          </Card>

          {/* Journal Content */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Journal Entry - {format(new Date(selectedDate), 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200 min-h-[200px]">
                  {exportDay(selectedDate) || 'No entries recorded for this date.\n\nYour research activities and protocol runs will automatically appear here when you use the app.'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
