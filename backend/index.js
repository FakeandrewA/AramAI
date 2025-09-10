import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_DEV_URI || 'mongodb://localhost:27017/AramAI';


app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});