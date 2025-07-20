
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

// Import statistics routes
const statisticsRoutes = require('./src/routes/statisticsRoutes');
app.use('/api/statistics', statisticsRoutes);

// Swagger API Docs
const { swaggerUi, swaggerSpec } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
