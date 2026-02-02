import express from 'express';
import Goal from '../models/Goal.js';

const router = express.Router();

// GET all goals for a user
// Query param: ?userId=...
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "UserId required" });

        const goals = await Goal.find({ userId });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a new goal
router.post('/', async (req, res) => {
    try {
        const { userId, title, type, startDate, endDate } = req.body;

        // Basic validation
        if (!userId || !title) {
            return res.status(400).json({ error: "UserId and Title are required" });
        }

        const effectiveStartDate = startDate || new Date().toISOString().split('T')[0];

        const newGoal = new Goal({
            userId,
            title,
            type: type || 'one-time',
            startDate: effectiveStartDate,
            endDate: endDate || null,
            createdAt: new Date().toISOString().split('T')[0], // Keep for backward compat or internal tracking
            completedDates: []
        });

        const savedGoal = await newGoal.save();
        res.status(201).json(savedGoal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TOGGLE goal completion for a specific date
// PATCH /:goalId/toggle
// Body: { date: "YYYY-MM-DD" }
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.body; // Date string to toggle

        if (!date) return res.status(400).json({ error: "Date is required" });

        const goal = await Goal.findById(id);
        if (!goal) return res.status(404).json({ error: "Goal not found" });

        const index = goal.completedDates.indexOf(date);
        if (index === -1) {
            // Not completed yet -> Mark as done
            goal.completedDates.push(date);
        } else {
            // Already completed -> Unmark
            goal.completedDates.splice(index, 1);
        }

        await goal.save();
        res.json(goal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a goal (e.g. for "Catch Up" feature)
router.put('/:id', async (req, res) => {
    try {
        const { title, createdAt } = req.body;
        const goal = await Goal.findByIdAndUpdate(
            req.params.id,
            { $set: { title, createdAt } },
            { new: true }
        );
        res.json(goal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a goal
router.delete('/:id', async (req, res) => {
    try {
        await Goal.findByIdAndDelete(req.params.id);
        res.json({ message: "Goal deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
