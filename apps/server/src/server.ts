import { createServer } from 'node:http';

import dotenv from 'dotenv';

import { createApp } from './index.js';
import { logger } from './db/logger.js';
import { createSocketServer } from './socket/index.js';

dotenv.config();

const app = createApp();
const port = Number(process.env.PORT || 4000);
const httpServer = createServer(app);

createSocketServer(httpServer);

httpServer.listen(port, () => {
  logger.info('HTTP + Socket server listening on http://localhost:%d', port);
});
