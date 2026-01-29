import React, { useState, useEffect } from 'react';
import { GoalCard } from './components/GoalCard';
import { Heatmap } from './components/Heatmap';
import { Plus, Sparkles, Menu, X } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';

import { dummyGoals } from './data/dummyGoals';

interface Goal {
  id: string;
  title: string;
  completedDates: string[];
  createdAt: string; // YYYY-MM-DD
}

function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('goal-tracker-data');
    console.log("Loading from LocalStorage:", saved);
    console.log("Dummy Goals Import:", dummyGoals);

    if (saved) {
      try {
        const parsedGoals = JSON.parse(saved);
        console.log("Parsed Goals from Storage:", parsedGoals);
        const validatedGoals = parsedGoals.map((g: any) => ({
          ...g,
          createdAt: g.createdAt || format(new Date(), 'yyyy-MM-dd')
        }));
        setGoals(validatedGoals);
      } catch (e) {
        console.error("Failed to load goals", e);
      }
    } else {
      console.log("No data found, setting dummy goals");
      setGoals(dummyGoals);
    }
  }, []);

  // Save to LocalStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('goal-tracker-data', JSON.stringify(goals));
  }, [goals]);

  const handleToggleToday = (goalId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');

    setGoals(currentGoals => currentGoals.map(goal => {
      if (goal.id !== goalId) return goal;

      if (goal.createdAt < today) {
        // Catch up
        return { ...goal, createdAt: today };
      } else {
        // Toggle completion
        const targetDate = goal.createdAt;
        const isCompleted = goal.completedDates.includes(targetDate);

        let newDates;
        if (isCompleted) {
          newDates = goal.completedDates.filter(d => d !== targetDate);
        } else {
          newDates = [...goal.completedDates, targetDate];
        }
        return { ...goal, completedDates: newDates };
      }
    }));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    // PRODUCTION: Always create for Today
    const today = format(new Date(), 'yyyy-MM-dd');

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      completedDates: [],
      createdAt: today
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle('');
    setShowAddForm(false);
  };

  const allCompletedDates = goals.flatMap(g => g.completedDates);



  // -- Streak & Stats Calculation --
  const calculateStats = () => {
    const uniqueDates = [...new Set(allCompletedDates)]
      .sort((a, b) => b.localeCompare(a)); // Sort desc (latest first)

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');

    // Total count of days you performed at least one action
    const totalDaysDone = uniqueDates.length;

    // Streak Logic
    // 1. If no activity today OR yesterday, streak is broken -> 0
    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      return { streak: 0, totalDaysDone };
    }

    let streak = 0;
    // Start checking from Today if active, otherwise start from Yesterday
    let checkDate = new Date();
    if (!uniqueDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
      checkDate = addDays(checkDate, -1);
    }

    // Loop backwards day by day
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (uniqueDates.includes(dateStr)) {
        streak++;
        checkDate = addDays(checkDate, -1);
      } else {
        break;
      }
    }
    return { streak, totalDaysDone };
  };

  const { streak: globalStreak, totalDaysDone } = calculateStats();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayGoals = goals.filter(g => g.createdAt === todayStr);
  const previousGoals = goals.filter(g => g.createdAt < todayStr);
  const futureGoals = goals.filter(g => g.createdAt > todayStr);

  return (
    <div className="app-layout">
      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <Sparkles size={20} color="white" fill="white" />
            <h2>Glow Goals</h2>
          </div>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="sidebar-section">
          <h3>Previous Goals</h3>
          <div className="sidebar-list">
            {previousGoals.length === 0 && <p className="empty-msg">No overdue goals!</p>}
            {previousGoals.map(g => (
              <div key={g.id} className="mini-goal-card">
                <span className="mini-title">{g.title}</span>
                <span className="mini-date">{g.createdAt}</span>
                <button className="mini-action" onClick={() => handleToggleToday(g.id)}>
                  Catch Up
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 0' }}>
          <button
            onClick={() => {
              if (confirm('Replace current goals with demo data?')) {
                setGoals(dummyGoals);
                setIsSidebarOpen(false);
              }
            }}
            style={{
              width: '100%',
              padding: '10px',
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            🔄 Load Demo Data
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={28} />
          </button>

          <div className="header-text">
            <h1>Dashboard</h1>
            <p>Track your dreams ✨</p>
          </div>
        </header>

        <div className="global-heatmap-section">
          <div className="heatmap-header">
            <div className="stats-row">
              <span className="streak-badge-large">🔥 {globalStreak} Day Streak</span>
              <span className="total-badge">✨ {totalDaysDone} Days Total</span>
            </div>
          </div>
          <Heatmap completedDates={allCompletedDates} />
        </div>

        <div className="goals-section">
          <h2>Today's Goals</h2>
          {todayGoals.length === 0 && <p className="empty-state">All caught up! Add a new goal to start.</p>}
          <div className="goals-grid">
            {todayGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleToday={handleToggleToday}
              />
            ))}
          </div>
        </div>

        {/* Render future goals if they exist (legacy), but removed testing label */}
        {futureGoals.length > 0 && (
          <div className="goals-section upcoming">
            <h3>Upcoming</h3>
            <div className="goals-grid">
              {futureGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggleToday={handleToggleToday}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add Goal Section */}
        {showAddForm ? (
          <div className="add-goal-overlay">
            <div className="add-goal-card">
              <form onSubmit={handleAddGoal}>
                <h3>Create New Goal</h3>
                <input
                  autoFocus
                  type="text"
                  placeholder="What's your new goal?"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="goal-input"
                />
                <div className="form-actions">
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn-cancel">Cancel</button>
                  <button type="submit" className="btn-save">Create Goal</button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <button className="fab-add" onClick={() => setShowAddForm(true)}>
            <Plus size={24} />
          </button>
        )}
      </main>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          position: relative;
        }
        
        /* Mobile Overlay */
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 99;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        
        .mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
        
        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid var(--accent);
          padding: 20px;
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
        }
        
        .sidebar-header {
           display: flex;
           align-items: center;
           justify-content: space-between;
           margin-bottom: 30px;
        }
        
        .close-btn {
           display: none; /* Hidden on desktop */
           color: var(--text-muted);
        }
        
        .sidebar .brand {
           display: flex;
           align-items: center;
           gap: 10px;
           background: var(--primary);
           padding: 10px 16px;
           border-radius: var(--radius-md);
           color: white;
        }
        
        .sidebar .brand h2 {
           font-size: 1.1rem;
           font-weight: 800;
        }
        
        .sidebar-section h3 {
           font-size: 0.85rem;
           text-transform: uppercase;
           color: var(--text-muted);
           margin-bottom: 12px;
           letter-spacing: 1px;
           font-weight: 700;
        }
        
        .sidebar-list {
           display: flex;
           flex-direction: column;
           gap: 12px;
        }
        
        .mini-goal-card {
           background: var(--bg-app);
           padding: 12px;
           border-radius: var(--radius-sm);
           border: 1px solid var(--accent);
        }
        
        .mini-title {
           display: block;
           font-weight: 700;
           font-size: 0.95rem;
           margin-bottom: 4px;
        }
        
        .mini-date {
           font-size: 0.75rem;
           color: var(--text-muted);
           display: block;
           margin-bottom: 8px;
        }
        
        .mini-action {
           width: 100%;
           padding: 6px;
           background: white;
           border: 1px solid var(--primary);
           color: var(--primary);
           border-radius: 4px;
           font-size: 0.8rem;
           font-weight: 600;
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          padding: 30px 40px;
          max-width: 100%;
          width: 100%; 
        }
        
        .main-header {
           margin-bottom: 30px;
           display: flex;
           align-items: center;
           gap: 20px;
        }
        
        .menu-btn {
           display: none; /* Hidden on desktop */
           color: var(--text-main);
        }
        
        .main-header h1 {
           font-size: 2rem;
           color: var(--text-main);
           margin-bottom: 4px;
        }
        
        .main-header p {
           color: var(--text-muted);
           margin: 0;
        }

        .global-heatmap-section {
          margin-bottom: 40px;
          background: white;
          padding: 20px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-soft);
          overflow: hidden; /* Prevent horizontal scroll on mobile causing layout shift */
        }
        
        .heatmap-header {
           margin-bottom: 20px;
        }
        
        .stats-row {
           display: flex;
           gap: 12px;
           flex-wrap: wrap;
           align-items: center;
        }
        
        .streak-badge-large {
           font-size: 1.1rem;
           font-weight: 800;
           color: var(--primary);
           background: var(--bg-app);
           padding: 8px 16px;
           border-radius: 20px;
        }
        
        .total-badge {
           font-size: 1rem;
           font-weight: 700;
           color: #666;
           background: #f4f4f5;
           padding: 8px 16px;
           border-radius: 20px;
        }
        
        .goals-section h2 {
           margin-bottom: 20px;
           font-size: 1.5rem;
           color: var(--text-main);
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
           .main-content {
              padding: 20px;
           }
           
           .main-header h1 {
              font-size: 1.5rem;
           }
           
           .menu-btn {
              display: block;
           }
           
           .close-btn {
              display: block;
           }
           
           .sidebar {
              position: fixed;
              top: 0;
              left: 0;
              height: 100%;
              transform: translateX(-100%);
              box-shadow: 2px 0 10px rgba(0,0,0,0.1);
           }
           
           .sidebar.open {
              transform: translateX(0);
           }
           
           .goals-grid {
              grid-template-columns: 1fr;
           }
           
           .fab-add {
              width: 50px;
              height: 50px;
              bottom: 24px;
              right: 24px;
           }
           
           .add-goal-card {
              width: 90%;
              padding: 20px;
           }
        }
        
        /* General Utils */
        .fab-add {
           position: fixed;
           bottom: 40px;
           right: 40px;
           width: 60px;
           height: 60px;
           border-radius: 50%;
           background: var(--primary);
           color: white;
           box-shadow: 0 4px 12px rgba(255, 105, 180, 0.4);
           display: flex;
           align-items: center;
           justify-content: center;
           transition: transform 0.2s;
           z-index: 90;
        }
        
        .fab-add:hover {
           transform: scale(1.1);
           background: var(--primary-hover);
        }
        
        .add-goal-overlay {
           position: fixed;
           top: 0;
           left: 0;
           right: 0;
           bottom: 0;
           background: rgba(0,0,0,0.5);
           display: flex;
           align-items: center;
           justify-content: center;
           z-index: 1000;
        }
        
        .add-goal-card {
           background: white;
           padding: 30px;
           border-radius: var(--radius-lg);
           width: 100%;
           max-width: 500px;
        }
        
        .goal-input {
          width: 100%;
          padding: 15px 20px;
          font-size: 1.1rem;
          border: 2px solid var(--neutral-gray);
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          outline: none;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .btn-cancel {
          padding: 10px 20px;
          color: var(--text-muted);
          font-weight: 600;
        }
        
        .btn-save {
          padding: 10px 24px;
          background: var(--primary);
          color: white;
          border-radius: 50px;
          font-weight: 700;
        }
        
        .empty-state {
           color: var(--text-muted);
           font-style: italic;
        }
        
        .empty-msg {
           font-size: 0.9rem;
           color: var(--text-muted);
        }

      `}</style>
    </div>
  );
}

export default App;
