require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();


app.use(express.json());


// Import user routes
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

// Import category routes
const categoryRoutes = require('./src/routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Example route
app.get('/', (req, res) => {
  res.send('Expense Tracker API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
