require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const errorHandler = require('./middleware/errorHandler');
const importRoutes = require('./routes/imports');
const adminUserRoutes = require('./routes/adminUsers');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Global middlewares
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/imports', importRoutes);
app.use('/api/admin/users', adminUserRoutes);

// health
app.get('/healthz', (req, res) => res.send({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// error handler
app.use(errorHandler);

// Connect DB then start server
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

