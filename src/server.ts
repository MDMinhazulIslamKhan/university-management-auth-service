import mongoose from 'mongoose';
import app from './app';
import config from './config/index';
import { errorLogger, logger } from './shared/logger';

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info(`Database is connected on port ${config.port}`);

    app.listen(config.port, () => {
      logger.info(`Application listening on port ${config.port}`);
    });
  } catch (error) {
    errorLogger.error(`Failed to connect database, ${error}`);
  }
}

main();
