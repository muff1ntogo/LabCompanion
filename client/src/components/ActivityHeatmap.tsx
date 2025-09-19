import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, subDays } from 'date-fns';
import { useJournal } from '@/lib/stores/useJournal';

interface ActivityHeatmapProps {
  year?: number;
  month?: number;
  onDateClick?: (date: string) => void;
  selectedDate?: string;
}

export function ActivityHeatmap({ year = new Date().getFullYear(), month, onDateClick, selectedDate }: ActivityHeatmapProps) {
  const entries = useJournal((state) => state.entries);
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const currentMonth = typeof month === 'number' ? month : new Date().getMonth();
  const startDate = startOfMonth(new Date(year, currentMonth, 1));
  const endDate = endOfMonth(new Date(year, currentMonth, 1));
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const daysWithActivity = allDays.map(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const entry = entries[dateKey];
    let activityLevel = 0;
    if (entry && entry.logs.length > 0) {
      const logCount = entry.logs.length;
      const totalContent = entry.logs.join('').length;
      let totalTimeSpent = 0;
      entry.logs.forEach(log => {
        const timerMatch = log.match(/Timer completed:.*\((\d+) minutes\)/);
        if (timerMatch) {
          totalTimeSpent += parseInt(timerMatch[1]);
        }
      });
      const activity = logCount + (totalContent / 100) + (totalTimeSpent / 15);
      if (activity <= 2) activityLevel = 1;
      else if (activity <= 5) activityLevel = 2;
      else if (activity <= 10) activityLevel = 3;
      else activityLevel = 4;
    }
    return {
      date: day,
      dateKey,
      activityLevel,
      hasEntry: !!entry,
      logCount: entry?.logs.length || 0,
      isPadding: false
    };
  });
  // Pad the start to align with Sunday (if needed)
  const firstDay = daysWithActivity[0];
  const firstDayOfWeek = getDay(firstDay.date);
  const paddedDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    const paddedDate = subDays(firstDay.date, firstDayOfWeek - i);
    paddedDays.push({
      date: paddedDate,
      dateKey: format(paddedDate, 'yyyy-MM-dd'),
      activityLevel: 0,
      hasEntry: false,
      logCount: 0,
      isPadding: true
    });
  }
  const allDaysWithPadding = [...paddedDays, ...daysWithActivity];
  // Group into weeks
  const weeks = [];
  for (let i = 0; i < allDaysWithPadding.length; i += 7) {
    weeks.push(allDaysWithPadding.slice(i, i + 7));
  }

  const getActivityColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-100 dark:bg-gray-800';          // No activity
      case 1: return 'bg-blue-100 dark:bg-blue-900/30';       // Light activity
      case 2: return 'bg-blue-300 dark:bg-blue-700/60';       // Medium activity
      case 3: return 'bg-blue-500 dark:bg-blue-600';          // High activity
      case 4: return 'bg-blue-700 dark:bg-blue-500';          // Very high activity
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const totalContributions = daysWithActivity.filter(day => day.hasEntry).length;

  return (
    <div className="w-full">
      {/* Header with month/year selectors */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {totalContributions} research sessions in {monthNames[currentMonth]} {year}
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={currentMonth}
            onChange={e => onDateClick && onDateClick('month:' + e.target.value)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs"
          >
            {monthNames.map((name, idx) => (
              <option key={name} value={idx}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => onDateClick && onDateClick('year:' + e.target.value)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(yearOpt => (
              <option key={yearOpt} value={yearOpt}>{yearOpt}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={`w-2.5 h-2.5 rounded-sm ${getActivityColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="grid gap-px min-w-[320px]" style={{
          gridTemplateColumns: `repeat(${weeks.length}, 1.5rem)`,
          gridTemplateRows: 'repeat(7, 1.5rem)'
        }}>
          {/* Day labels column */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div
              key={day}
              className="text-xs text-gray-600 dark:text-gray-300 flex items-center justify-end pr-2"
              style={{ gridColumn: 1, gridRow: 1 + index }}
            >
              {day}
            </div>
          ))}
          {/* Heatmap squares */}
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <button
                key={`${weekIndex}-${dayIndex}`}
                className={`rounded-sm transition-all hover:ring-1 hover:ring-blue-400 ${getActivityColor(day.activityLevel)} ${selectedDate === day.dateKey ? 'ring-2 ring-blue-500' : ''} ${day.isPadding ? 'opacity-0' : ''}`}
                style={{ gridColumn: 1 + weekIndex, gridRow: 1 + dayIndex }}
                title={`${format(day.date, 'MMM d, yyyy')}: ${day.logCount} entries`}
                onClick={() => !day.isPadding && onDateClick?.(day.dateKey)}
                disabled={day.isPadding}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}