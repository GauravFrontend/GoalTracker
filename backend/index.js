import express from 'express';
import 'dotenv/config';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';

const app = express();
connectDB();

app.use(express.json());

app.use('/api', authRoutes);

app.listen(5000, () => console.log('Server running on 5000'));