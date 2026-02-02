import React, { useState, useEffect } from 'react';
import { GoalCard } from '../components/GoalCard';
import { Heatmap } from '../components/Heatmap';
import { Plus, Sparkles, Menu, X, LogOut } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// Removed dummyGoals import
import { CustomizationModal } from '../components/CustomizationModal';
import { Modal } from '../components/Modal';

interface Goal {
    id: string;
    title: string;
    completedDates: string[];
    createdAt: string;
    startDate: string;
    endDate?: string;
    type?: 'one-time' | 'recurring';
}

export function Dashboard() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Get user from local storage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Load Goals
    const loadGoals = async () => {
        if (!user || !user.id) return;
        try {
            const data = await api.getGoals(user.id);
            // Map _id to id
            const formattedGoals = data.map((g: any) => ({
                id: g._id,
                title: g.title,
                completedDates: g.completedDates,
                createdAt: g.createdAt,
                startDate: g.startDate,
                endDate: g.endDate,
                type: g.type || 'one-time'
            }));
            setGoals(formattedGoals);
        } catch (error) {
            console.error("Failed to load goals", error);
        }
    };

    useEffect(() => {
        if (!user || !user.id) {
            navigate('/login');
        } else {
            // Load goals and User data (to sync gems)
            loadGoals();
            api.getUser(user.id).then(userData => {
                setGems(userData.gems);
                setLastDailyReward(userData.lastDailyReward);
                // Update local storage to keep it fresh
                localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
            }).catch(err => console.error("Failed to sync user", err));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error("Logout API failed", error);
        }
        localStorage.removeItem('user');
        navigate('/login');
    };

    const [gems, setGems] = useState(user.gems || 20); // Initialize from user data logic or default
    // const [lastDailyReward, setLastDailyReward] = useState(user.lastDailyReward);
    // Unused state variable, but setter is used in useEffect to sync. 
    // We can just omit the variable destructuring if truly unused.
    const [, setLastDailyReward] = useState(user.lastDailyReward);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        content: React.ReactNode;
        type?: 'default' | 'success' | 'danger';
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        content: null
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const handleCatchUp = async (goalId: string, date: string) => {
        if (gems < 20) {
            setModalConfig({
                isOpen: true,
                title: 'Insufficient Gems 💎',
                content: <p>You need 20 gems to catch up on missed goals! Keep completing daily tasks to earn more.</p>,
                type: 'danger'
            });
            return;
        }

        setModalConfig({
            isOpen: true,
            title: 'Catch Up?',
            content: <p>Spend <b>20 Gems</b> to mark this goal as done for <b>{date}</b>?</p>,
            onConfirm: async () => {
                try {
                    const data = await api.catchUp(goalId, date, user.id);
                    setGems(data.gems);
                    setGoals(currentGoals => currentGoals.map(g => {
                        if (g.id !== goalId) return g;
                        return { ...g, completedDates: data.goal.completedDates };
                    }));

                    const updatedUser = { ...user, gems: data.gems };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    closeModal();
                } catch (err: any) {
                    setModalConfig({
                        isOpen: true,
                        title: 'Error',
                        content: <p>{err.message || "Failed to catch up"}</p>,
                        type: 'danger'
                    });
                }
            }
        });
    };

    const handleToggleToday = async (goalId: string) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        try {
            const response = await api.toggleGoal(goalId, today);
            const updatedGoal = response.goal;
            const newGemCount = response.gems;

            if (newGemCount !== null && newGemCount !== undefined) {
                setGems(newGemCount);
                const updatedUser = { ...user, gems: newGemCount, lastDailyReward: today };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setModalConfig({
                    isOpen: true,
                    title: 'Great Start! �',
                    content: <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1.2rem', margin: '10px 0' }}>First task of the day completed!</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>+10 Gems 💎</p>
                    </div>,
                    type: 'success'
                });
            }

            setGoals(currentGoals => currentGoals.map(g => {
                if (g.id !== goalId) return g;
                return { ...g, completedDates: updatedGoal.completedDates };
            }));

        } catch (err) {
            console.error("Failed to toggle goal", err);
        }
    };

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoalTitle.trim()) return;

        try {
            await api.createGoal({
                userId: user.id,
                title: newGoalTitle,
                type: goalType,
                startDate: startDate,
                endDate: endDate || undefined
            });
            await loadGoals();
            setNewGoalTitle('');
            setEndDate('');
            setShowAddForm(false);
        } catch (err) {
            console.error("Failed to create goal", err);
            alert("Failed to create goal. Try again.");
        }
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
        if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
            return { streak: 0, totalDaysDone };
        }

        let streak = 0;
        let checkDate = new Date();
        if (!uniqueDates.includes(format(checkDate, 'yyyy-MM-dd'))) {
            checkDate = addDays(checkDate, -1);
        }

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

    // -- Image Customization Logic --
    const [dateStyles, setDateStyles] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Load Styles Logic (Still LocalStorage as per original requirement for client-side visuals)
    useEffect(() => {
        const savedImages = localStorage.getItem('goal-tracker-images');
        const savedStyles = localStorage.getItem('goal-tracker-styles');

        if (savedStyles) {
            try { setDateStyles(JSON.parse(savedStyles)); } catch (e) { }
        } else if (savedImages) {
            try {
                const images = JSON.parse(savedImages);
                const styles: Record<string, string> = {};
                Object.keys(images).forEach(k => { styles[k] = `url(${images[k]})`; });
                setDateStyles(styles);
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('goal-tracker-styles', JSON.stringify(dateStyles));
    }, [dateStyles]);

    const handleCellClick = (dateStr: string) => {
        const isCompleted = goals.some(g => g.completedDates.includes(dateStr));
        if (!isCompleted) return;

        setSelectedDate(dateStr);
        setIsModalOpen(true);
    };

    const handleSelectBackground = (bg: string) => {
        if (!selectedDate) return;
        setDateStyles(prev => ({ ...prev, [selectedDate]: bg }));
    };

    const handleUploadRequest = () => { fileInputRef.current?.click(); };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedDate) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setDateStyles(prev => ({ ...prev, [selectedDate]: `url(${base64})` }));
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    const { streak: globalStreak, totalDaysDone } = calculateStats();

    const [goalType, setGoalType] = useState<'one-time' | 'recurring'>('one-time');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState('');

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Filter Logic
    const todayGoals = goals.filter(g => {
        // If it's a one-time goal, it must match today's date
        if (g.type === 'one-time') {
            return g.startDate === todayStr;
        }
        // If it's recurring, today must be >= startDate AND (if endDate exists, <= endDate)
        if (g.type === 'recurring') {
            const afterStart = todayStr >= g.startDate;
            const beforeEnd = !g.endDate || todayStr <= g.endDate;
            return afterStart && beforeEnd;
        }
        // Fallback for legacy goals without type (assume daily/recurring meant for today)
        return g.createdAt === todayStr;
    });

    // Upcoming logic: One-time goals in future OR Recurring starts in future
    const futureGoals = goals.filter(g => {
        if (g.type === 'one-time') return g.startDate > todayStr;
        if (g.type === 'recurring') return g.startDate > todayStr;
        return false;
    });



    return (
        <div className="app-layout">
            <CustomizationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectBackground={handleSelectBackground}
                onUploadRequest={handleUploadRequest}
                currentStyle={selectedDate ? dateStyles[selectedDate] : undefined}
            />

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                type={modalConfig.type}
                actions={modalConfig.onConfirm ? (
                    <>
                        <button onClick={closeModal} className="btn-cancel">Cancel</button>
                        <button onClick={modalConfig.onConfirm} className="btn-save">Confirm</button>
                    </>
                ) : (
                    <button onClick={closeModal} className="btn-save">Okay!</button>
                )}
            >
                {modalConfig.content}
            </Modal>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageUpload}
            />
            <div
                className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

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
                    <h3>Missed Goals (Yesterday)</h3>
                    <div className="sidebar-list">
                        {/* Logic to find missed goals for Yesterday specifically, for simplicity */}
                        {(() => {
                            const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');

                            const missedGoals = goals.filter(g => {
                                const isDone = g.completedDates.includes(yesterday);
                                if (isDone) return false;

                                if (g.type === 'one-time') return g.startDate === yesterday;
                                if (g.type === 'recurring') return yesterday >= g.startDate && (!g.endDate || yesterday <= g.endDate);
                                return false;
                            });

                            if (missedGoals.length === 0) return <p className="empty-msg">No missed goals yesterday!</p>;

                            return missedGoals.map(g => (
                                <div key={g.id} className="mini-goal-card">
                                    <span className="mini-title">{g.title}</span>
                                    <span className="mini-date">{yesterday}</span>
                                    <button
                                        className="mini-action"
                                        onClick={() => handleCatchUp(g.id, yesterday)}
                                        disabled={gems < 20}
                                        style={{ opacity: gems < 20 ? 0.5 : 1 }}
                                    >
                                        Catch Up (20 💎)
                                    </button>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                <div className="gem-wallet" style={{ margin: '20px 0', padding: '15px', background: '#fff0f5', borderRadius: '12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.5rem', display: 'block' }}>💎 {gems}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>Your Gems</span>
                </div>

                <div style={{ padding: '20px 0', borderTop: '1px solid var(--accent)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Removed Load Demo Data button as we are fully API powered now */}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'white',
                            border: '1px solid var(--primary)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 600
                        }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

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
                    <Heatmap
                        completedDates={allCompletedDates}
                        dateStyles={dateStyles}
                        onDayClick={handleCellClick}
                    />
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

                {showAddForm ? (
                    <div className="add-goal-overlay">
                        <div className="add-goal-card">
                            <form onSubmit={handleAddGoal}>
                                <h3>Create New Goal</h3>

                                <div className="type-toggle">
                                    <button
                                        type="button"
                                        className={goalType === 'one-time' ? 'active' : ''}
                                        onClick={() => setGoalType('one-time')}
                                    >
                                        One Time
                                    </button>
                                    <button
                                        type="button"
                                        className={goalType === 'recurring' ? 'active' : ''}
                                        onClick={() => setGoalType('recurring')}
                                    >
                                        Recurring
                                    </button>
                                </div>

                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="What's your new goal?"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    className="goal-input"
                                />

                                <div className="date-inputs">
                                    <div className="input-group">
                                        <label>Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {goalType === 'recurring' && (
                                        <div className="input-group">
                                            <label>End Date (Optional)</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                min={startDate}
                                            />
                                        </div>
                                    )}
                                </div>

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
        
        .type-toggle {
          display: flex;
          background: #f0f0f0;
          padding: 4px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .type-toggle button {
          flex: 1;
          padding: 8px;
          border: none;
          background: transparent;
          font-weight: 600;
          color: #666;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .type-toggle button.active {
           background: white;
           color: var(--primary);
           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .date-inputs {
           display: flex;
           gap: 12px;
           margin-bottom: 20px;
        }
        
        .date-inputs .input-group {
           flex: 1;
           margin-bottom: 0;
        }
        
        .date-inputs label {
           display: block;
           font-size: 0.8rem;
           color: var(--text-muted);
           margin-bottom: 4px;
           font-weight: 600;
        }
        
        .date-inputs input {
           width: 100%;
           padding: 10px;
           border: 1px solid var(--neutral-gray);
           border-radius: 6px;
           font-family: inherit;
        }

        .empty-msg {
           font-size: 0.9rem;
           color: var(--text-muted);
        }

      `}</style>
        </div>
    );
}
