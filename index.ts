// Import necessary modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import twitterRoutes from './routes/twitter';

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // Enable CORS
app.use(helmet()); // Enhance security with Helmet
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/twitter', twitterRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
