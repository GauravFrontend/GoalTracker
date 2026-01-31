import React from 'react';
import { eachDayOfInterval, format, subWeeks, startOfWeek, endOfWeek, startOfToday, parseISO } from 'date-fns';
import '../styles/variables.css';

interface HeatmapProps {
  completedDates: string[]; // ISO date strings
  daysToShow?: number;
  dateStyles?: Record<string, string>; // date -> CSS background property
  onDayClick?: (dateStr: string) => void;
}

export const Heatmap: React.FC<HeatmapProps> = ({ completedDates, dateStyles = {}, onDayClick }) => {
  const today = startOfToday();

  // Determine the end of the range.
  let rangeEnd = today;
  if (completedDates.length > 0) {
    const timestamps = completedDates.map(d => parseISO(d).getTime());
    const maxTimestamp = Math.max(...timestamps);
    if (maxTimestamp > today.getTime()) {
      rangeEnd = new Date(maxTimestamp);
    }
  }

  // Align to full weeks
  const currentWeekEnd = endOfWeek(rangeEnd);
  const startWeekStart = startOfWeek(subWeeks(today, 16));

  const dates = eachDayOfInterval({
    start: startWeekStart,
    end: currentWeekEnd,
  });

  const getIntensity = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = completedDates.filter(d => d === dateStr).length;

    if (count === 0) return 'empty';
    if (count === 1) return 'level-1';
    if (count === 2) return 'level-2';
    if (count === 3) return 'level-3';
    return 'level-4';
  };

  // Group dates by month for labels (Simplified for brevity as logic remains same)
  const monthGroups: { month: string; startIndex: number }[] = [];
  let currentMonth = '';

  dates.forEach((date, index) => {
    const monthLabel = format(date, 'MMM');
    if (monthLabel !== currentMonth) {
      monthGroups.push({ month: monthLabel, startIndex: index });
      currentMonth = monthLabel;
    }
  });

  const numWeeks = Math.ceil(dates.length / 7);

  return (
    <div className="heatmap-container">
      <div className="heatmap-wrapper">
        <div
          className="month-labels"
          style={{ gridTemplateColumns: `repeat(${numWeeks}, 12px)` }}
        >
          {monthGroups.map((group, idx) => {
            const weekIndex = Math.floor(group.startIndex / 7);
            return (
              <div
                key={idx}
                className="month-label"
                style={{ gridColumn: `${weekIndex + 1} / span 2` }}
              >
                {group.month}
              </div>
            );
          })}
        </div>

        <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${numWeeks}, 12px)` }}>
          {dates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const intensity = getIntensity(date);
            const dateLabel = format(date, 'MMM do, yyyy');
            const isToday = dateStr === format(today, 'yyyy-MM-dd');

            const backgroundStyle = dateStyles[dateStr];

            return (
              <div
                key={date.toString()}
                className={`heatmap-cell ${intensity} ${isToday ? 'today' : ''}`}
                title={dateLabel}
                onClick={() => onDayClick && onDayClick(dateStr)}
                style={backgroundStyle ? (
                  backgroundStyle.startsWith('url') ? {
                    backgroundImage: backgroundStyle,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: 'none'
                  } : {
                    background: backgroundStyle,
                    border: 'none'
                  }
                ) : {}}
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
          white-space: nowrap;
          overflow: visible;
        }
        
        .heatmap-grid {
          display: grid;
          grid-template-rows: repeat(7, 12px); 
          grid-auto-flow: column; 
          gap: 3px;
        }
        
        .heatmap-cell {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          transition: all 0.2s ease;
          cursor: pointer; /* Interaction hint */
        }
        
        .heatmap-cell:hover {
          transform: scale(1.5);
          border: 1px solid rgba(0,0,0,0.2);
          z-index: 10;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .heatmap-cell.empty { background-color: var(--heatmap-empty); }
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
