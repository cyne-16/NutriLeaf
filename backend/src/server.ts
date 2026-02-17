import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';
import chatRoutes from './routes/chat.routes';

const PORT = process.env.PORT || 5000;

// Connect DB, then start server
connectDatabase().then(() => {
  app.use('/api/chat', chatRoutes);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  });
});
