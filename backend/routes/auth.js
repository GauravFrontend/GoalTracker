import express from 'express';
import User from '../models/User.js'; // Ensure the path is correct

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "User registered!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router; 