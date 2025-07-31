require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();


app.use(cors());
app.use(express.json());


// Import user routes
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);


// Import category routes
const categoryRoutes = require('./src/routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

// Import expense routes
const expenseRoutes = require('./src/routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);

// Swagger API Docs
const { swaggerUi, swaggerSpec } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const passport = require('./passport');
app.use(passport.initialize());
// Google OAuth routes
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req, res) => {
    const { generateJwtForUser } = require('./passport');
    const token = generateJwtForUser(req.user);
    // Redirect về frontend với token và provider
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?token=${token}&provider=google`);
  }
);

// Facebook OAuth routes
app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
app.get('/api/auth/facebook/callback', (req, res, next) => {
  // Nếu có lỗi (user hủy đăng nhập)
  if (req.query && req.query.error) {
    // Redirect về frontend với thông báo lỗi
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?error=access_denied&provider=facebook`);
  }
  // Nếu không có lỗi, tiếp tục xác thực Passport
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }, async (err, user) => {
    if (err || !user) {
      // Redirect về frontend với thông báo lỗi
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?error=auth_failed&provider=facebook`);
    }
    const { generateJwtForUser } = require('./passport');
    const token = generateJwtForUser(user);
    // Redirect về frontend với token và provider
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?token=${token}&provider=facebook`);
  })(req, res, next);
});

// Import limit routes
const limitRoutes = require('./src/routes/limitRoutes');
app.use('/api/limits', limitRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
