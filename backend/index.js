import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));