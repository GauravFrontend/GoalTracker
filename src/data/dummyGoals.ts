import { format, addDays } from 'date-fns';

interface Goal {
    id: string;
    title: string;
    completedDates: string[];
    createdAt: string; // YYYY-MM-DD
}

const generateDummyData = (): Goal[] => {
    const goals: Goal[] = [];

    // Use current year to ensure they show up in the heatmap correctly relative to 'Today'
    const now = new Date();
    const currentYear = now.getFullYear();

    const start = new Date(2025, 11, 13); // Dec 13, 2025
    const end = new Date(currentYear, 4, 31);  // May 31st

    let currentDate = start;
    let idCounter = 1;

    while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // Goal 1: Accounts
        goals.push({
            id: `dummy-accounts-${idCounter}`,
            title: 'Accounts: Chapter 2 - Partnership Fundamentals',
            completedDates: [dateStr],
            createdAt: dateStr
        });

        // Goal 2: Law
        goals.push({
            id: `dummy-law-${idCounter}`,
            title: 'Law: Contract Act - Offer and Acceptance',
            completedDates: [dateStr],
            createdAt: dateStr
        });

        idCounter++;
        currentDate = addDays(currentDate, 1);
    }

    // Also ensure we have a goal for TODAY if today is after Feb 15, to avoid empty state
    // But strictly following "Jan and half Feb" requirement for the dummy bulk.

    return goals;
};

export const dummyGoals = generateDummyData();
