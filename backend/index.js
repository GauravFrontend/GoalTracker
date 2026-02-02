import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';

const app = express();
app.use(cors());
connectDB();

app.use(express.json());

app.use('/api', authRoutes);

app.listen(5000, () => console.log('Server running on 5000'));