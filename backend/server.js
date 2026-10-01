require('dotenv').config();

const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const validateJsonBody = require('./middleware/validateJsonBody');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(validateJsonBody);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Instagram backend API is running.' });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_secret_key') {
    throw new Error('Set a private JWT_SECRET in backend/.env before starting the server.');
  }

  await connectDB();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
