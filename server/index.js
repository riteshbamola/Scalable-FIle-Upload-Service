import express from 'express';
import connectDB from './db/db.js';
import AuthRouter from './routes/Auth.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 5000;

connectDB();
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', AuthRouter);

app.get('/', (req, res) => {
  res.json({ msg: "Hello" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
