import 'dotenv/config';
import app from './app';
import env from './config/env';
import logger from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
}); 