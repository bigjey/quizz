import { createServer } from 'http';

import { app } from './app';
import { addSocketEvents } from './GameManager';
import { DEV_SERVER_PORT } from '../../shared/constants';

const PORT = process.env.NODE_ENV === 'production' ? 3334 : DEV_SERVER_PORT;
const server = createServer(app);

addSocketEvents(server);

server.listen(PORT, () => {
  console.log(`server is running http://localhost:${PORT}`);
});
