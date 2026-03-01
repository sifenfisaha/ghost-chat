import { createServer } from 'node:http';

import dotenv from 'dotenv';

import { createApp } from './index';
import { logger } from './db/logger';
import { createSocketServer } from './socket';

dotenv.config();

const app = createApp();
const port = Number(process.env.PORT || 4000);
const httpServer = createServer(app);

createSocketServer(httpServer);

httpServer.listen(port, () => {
  logger.info('HTTP + Socket server listening on http://localhost:%d', port);
});
