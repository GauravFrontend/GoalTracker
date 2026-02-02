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
        if (err.code === 11000) {
            return res.status(400).json({ error: "Username or Email already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Simple password comparison (Plain text as per current scope)
        if (password !== user.password) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login successful", user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router; 