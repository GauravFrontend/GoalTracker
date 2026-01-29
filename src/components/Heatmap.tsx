import React from 'react';
import { eachDayOfInterval, format, subWeeks, startOfWeek, endOfWeek, startOfToday, parseISO } from 'date-fns';
import '../styles/variables.css';

interface HeatmapProps {
  completedDates: string[]; // ISO date strings
  daysToShow?: number; // Ignored in favor of week logic now for better alignment
}

export const Heatmap: React.FC<HeatmapProps> = ({ completedDates }) => {
  const today = startOfToday();

  // Determine the end of the range.
  // If we have completed dates in the future (for testing), show them.
  let rangeEnd = today;
  if (completedDates.length > 0) {
    // efficient max finding
    const timestamps = completedDates.map(d => parseISO(d).getTime());
    const maxTimestamp = Math.max(...timestamps);
    if (maxTimestamp > today.getTime()) {
      rangeEnd = new Date(maxTimestamp);
    }
  }

  // Align to full weeks to ensure the grid looks correct (Row 1 = Sunday, Row 7 = Saturday)
  const currentWeekEnd = endOfWeek(rangeEnd);
  const startWeekStart = startOfWeek(subWeeks(today, 16)); // Show 16 weeks (~4 months) based on TODAY to keep history stable

  // Generate array of dates to show (oldest to newest)
  const dates = eachDayOfInterval({
    start: startWeekStart,
    end: currentWeekEnd,
  });

  const getIntensity = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Count how many times this date appears in the completedDates array
    const count = completedDates.filter(d => d === dateStr).length;

    if (count === 0) return 'empty';
    if (count === 1) return 'level-1';
    if (count === 2) return 'level-2';
    if (count === 3) return 'level-3';
    return 'level-4';
  };

  // Group dates by month for labels
  const monthGroups: { month: string; startIndex: number }[] = [];
  let currentMonth = '';

  dates.forEach((date, index) => {
    // Only add label if it's the start of the month OR the very first date
    // We check if the month changed.
    const monthLabel = format(date, 'MMM');
    if (monthLabel !== currentMonth) {
      // Logic adjustment: Since we are column-filling, the label should roughly align 
      // with the column where the month starts.
      // Index implies specific day. 
      // index 0 = Sunday.

      monthGroups.push({ month: monthLabel, startIndex: index });
      currentMonth = monthLabel;
    }
  });

  // Calculate how many columns (weeks) we have
  const numWeeks = Math.ceil(dates.length / 7);

  return (
    <div className="heatmap-container">
      <div className="heatmap-wrapper">
        {/* Month labels */}
        <div
          className="month-labels"
          style={{
            gridTemplateColumns: `repeat(${numWeeks}, 12px)`
          }}
        >
          {monthGroups.map((group, idx) => {
            const weekIndex = Math.floor(group.startIndex / 7);
            // If the label is too close to the end or previous, it might overlap, but CSS Grid handles placement.
            return (
              <div
                key={idx}
                className="month-label"
                style={{
                  gridColumn: `${weekIndex + 1} / span 2`, // Allow span to prevent cutoff
                }}
              >
                {group.month}
              </div>
            );
          })}
        </div>

        {/* Heatmap grid */}
        <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${numWeeks}, 12px)` }}>
          {dates.map((date) => {
            const intensity = getIntensity(date);
            const dateLabel = format(date, 'MMM do, yyyy');

            // Highlight today
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

            return (
              <div
                key={date.toString()}
                className={`heatmap-cell ${intensity} ${isToday ? 'today' : ''}`}
                title={dateLabel}
              />
            );
          })}
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-cell empty"></div>
        <div className="legend-cell level-2"></div>
        <span>More</span>
      </div>

      <style>{`
        .heatmap-container {
          padding: 20px;
          background: white;
          border-radius: var(--radius-md);
          overflow-x: auto;
        }
        
        .heatmap-wrapper {
          display: inline-block;
          min-width: 100%;
        }

        .month-labels {
          display: grid;
          /* Explicit columns to match grid below */
          grid-template-rows: auto;
          gap: 3px;
          margin-bottom: 6px;
          height: 18px;
        }

        .month-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          text-align: left;
           /* Ensure text doesn't wrap awkwardly */
          white-space: nowrap;
          overflow: visible;
        }
        
        .heatmap-grid {
          display: grid;
          grid-template-rows: repeat(7, 12px); /* 7 days a week */
          grid-auto-flow: column; /* Fill columns first (weeks) */
          gap: 3px;
        }
        
        .heatmap-cell {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          transition: all 0.2s ease;
        }
        
        .heatmap-cell:hover {
          transform: scale(1.3);
          border: 1px solid rgba(0,0,0,0.1);
          z-index: 10;
          position: relative;
        }

        .heatmap-cell.empty {
          background-color: var(--heatmap-empty);
        }
        
        .heatmap-cell.level-1 { background-color: var(--heatmap-l1); }
        .heatmap-cell.level-2 { background-color: var(--heatmap-l2); }
        .heatmap-cell.level-3 { background-color: var(--heatmap-l3); }
        .heatmap-cell.level-4 { background-color: var(--heatmap-l4); }
        
        .heatmap-cell.today {
           border: 1px solid var(--primary);
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          font-size: 0.8rem;
          color: var(--text-muted);
          justify-content: flex-end;
        }
        
        .legend-cell {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        .legend-cell.empty { background-color: var(--heatmap-empty); }
        .legend-cell.level-2 { background-color: var(--heatmap-l2); }

      `}</style>
    </div>
  );
};
