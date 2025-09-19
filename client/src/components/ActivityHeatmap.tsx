import React, { useMemo } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, addDays, subDays } from 'date-fns';
import { useJournal } from '@/lib/stores/useJournal';

interface ActivityHeatmapProps {
  year?: number;
  onDateClick?: (date: string) => void;
  selectedDate?: string;
}

export function ActivityHeatmap({ year = new Date().getFullYear(), onDateClick, selectedDate }: ActivityHeatmapProps) {
  const entries = useJournal((state) => state.entries);

  const { days, weeks, monthLabels } = useMemo(() => {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));
    
    // Get all days in the year
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Calculate activity levels for each day
    const daysWithActivity = allDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const entry = entries[dateKey];
      
      // Calculate activity level based on log count, content, and actual time spent
      let activityLevel = 0;
      if (entry && entry.logs.length > 0) {
        // Base activity on number of logs and their content length
        const logCount = entry.logs.length;
        const totalContent = entry.logs.join('').length;
        
        // Extract time spent from timer completion logs
        let totalTimeSpent = 0;
        entry.logs.forEach(log => {
          const timerMatch = log.match(/Timer completed:.*\((\d+) minutes\)/);
          if (timerMatch) {
            totalTimeSpent += parseInt(timerMatch[1]);
          }
        });
        
        // Enhanced activity calculation: logs + content + actual time spent
        const activity = logCount + (totalContent / 100) + (totalTimeSpent / 15); // 15 min = 1 activity point
        
        if (activity <= 2) activityLevel = 1;      // Light activity
        else if (activity <= 5) activityLevel = 2; // Medium activity  
        else if (activity <= 10) activityLevel = 3; // High activity
        else activityLevel = 4;                     // Very high activity
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
    
    // Add empty days at the start to align with Sunday
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

    // Generate month labels with proper positioning
    const monthLabels: { label: string; weekIndex: number }[] = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Find the first occurrence of each month in the weeks
    let currentMonth = -1;
    allDaysWithPadding.forEach((day, dayIndex) => {
      if (!day.isPadding) {
        const month = day.date.getMonth();
        if (month !== currentMonth) {
          currentMonth = month;
          const weekIndex = Math.floor(dayIndex / 7);
          monthLabels.push({
            label: monthNames[month],
            weekIndex
          });
        }
      }
    });

    return { days: daysWithActivity, weeks, monthLabels };
  }, [entries, year]);

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

  const totalContributions = days.filter(day => day.hasEntry).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {totalContributions} research sessions in {year}
        </h3>
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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Calendar with unified layout */}
        <div className="grid gap-px" style={{ 
          gridTemplateColumns: `auto 2px repeat(${weeks.length}, 0.625rem)`,
          gridTemplateRows: 'auto 0.625rem repeat(7, 0.625rem)'
        }}>
          {/* Month labels row */}
          {monthLabels.map((month) => (
            <div
              key={month.label}
              className="text-xs text-gray-600 dark:text-gray-300 text-center flex items-center justify-center"
              style={{
                gridColumn: `${3 + month.weekIndex}`,
                gridRow: 1
              }}
            >
              {month.label}
            </div>
          ))}

          {/* Empty cell for day labels column header */}
          <div style={{ gridColumn: 1, gridRow: 2 }}></div>

          {/* Day labels column */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div
              key={day}
              className="text-xs text-gray-600 dark:text-gray-300 flex items-center justify-end pr-2"
              style={{
                gridColumn: 1,
                gridRow: 3 + index,
                opacity: index % 2 === 1 ? 1 : 0 // Show only Mon, Wed, Fri (odd indices: 1, 3, 5)
              }}
            >
              {index % 2 === 1 ? day : ''}
            </div>
          ))}

          {/* Heatmap squares */}
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <button
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  rounded-sm transition-all hover:ring-1 hover:ring-blue-400
                  ${getActivityColor(day.activityLevel)}
                  ${selectedDate === day.dateKey ? 'ring-2 ring-blue-500' : ''}
                  ${day.isPadding ? 'opacity-0' : ''}
                `}
                style={{
                  gridColumn: 3 + weekIndex,
                  gridRow: 3 + dayIndex
                }}
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