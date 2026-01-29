import React from 'react';
import { Check } from 'lucide-react';
import { format } from 'date-fns';


interface Goal {
  id: string;
  title: string;
  completedDates: string[]; // ISO strings 'YYYY-MM-DD'
  createdAt: string;
}

interface GoalCardProps {
  goal: Goal;
  onToggleToday: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onToggleToday }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isCompleted = goal.completedDates.includes(goal.createdAt);
  const isOverdue = goal.createdAt < todayStr;

  return (
    <div
      className={`goal-card ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
      onClick={() => onToggleToday(goal.id)}
    >
      <div className="card-content">
        <h3 className="goal-title">{goal.title}</h3>
        <p className="goal-date">{isOverdue && !isCompleted ? 'Missed • ' : ''}{goal.createdAt}</p>
      </div>

      <div className="action-wrapper">
        <button className="action-btn">
          {isCompleted ? <Check size={22} strokeWidth={4} /> : <div className="circle-outline" />}
        </button>
      </div>

      <style>{`
        .goal-card {
          position: relative;
          background: white;
          border-radius: 12px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0; /* Very subtle border */
          margin-bottom: 16px;
        }

        /* Hover: Very subtle lift */
        .goal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: rgba(255, 182, 193, 0.4);
        }

        /* --- Completed State (Calm) --- */
        .goal-card.completed {
          background: #fff5f7; /* Lavender Blush - very soft pink */
          border-color: transparent;
        }

        .goal-card.completed .goal-title {
           color: #888; /* Muted text */
           text-decoration: line-through;
           text-decoration-color: #ffdae0;
           transition: color 0.3s ease;
        }
        
        .goal-card.completed .goal-date {
           opacity: 0.6;
        }

        .goal-card.completed .action-btn {
           background: var(--primary); /* Pink accent for the check */
           color: white;
           border-color: var(--primary);
        }

        /* --- Overdue State --- */
        .goal-card.overdue:not(.completed) {
           background: #fffaf0; /* Floral White / Soft warm tint */
           border-color: #ffe4b5;
        }
        
        .goal-card.overdue:not(.completed) .goal-date {
           color: #d97706; /* Soft amber */
           font-weight: 600;
        }

        /* Text Styling */
        .card-content {
           flex: 1;
        }

        .goal-title {
           font-size: 1.05rem;
           font-weight: 600;
           margin-bottom: 4px;
           color: #444; /* softer than black */
           line-height: 1.4;
        }

        .goal-date {
           font-size: 0.8rem;
           color: #999;
           font-weight: 500;
        }

        /* Button Styling */
        .action-wrapper {
           flex-shrink: 0;
        }

        .action-btn {
           width: 36px;
           height: 36px;
           border-radius: 50%;
           border: 2px solid #e0e0e0;
           background: transparent;
           color: white; /* Icon color */
           display: flex;
           align-items: center;
           justify-content: center;
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           cursor: pointer;
        }
        
        .circle-outline {
           /* No inner element needed for this style, the border is on the button */
        }
        
        .goal-card:hover .action-btn:not(.completed .action-btn) {
           border-color: var(--primary);
        }
        
        /* When button is checked */
        .goal-card.completed .action-btn {
           border-color: var(--primary);
           box-shadow: 0 4px 10px rgba(255, 105, 180, 0.2);
           transform: scale(1.1);
        }

      `}</style>
    </div>
  );
};


