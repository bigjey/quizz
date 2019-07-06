import { createServer } from 'http';

import { app } from './app';
import { addSocketEvents } from './GameManager';

const PORT = 3334;
const server = createServer(app);

addSocketEvents(server);

server.listen(PORT, () => {
  console.log(`server is running http://localhost:${PORT}`);
});
