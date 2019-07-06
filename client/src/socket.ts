import { DEV_SERVER_PORT } from './../../shared/constants';
import SocketClient from 'socket.io-client';

const url =
  process.env.NODE_ENV === 'production'
    ? window.origin
    : `http://localhost:${DEV_SERVER_PORT}`;

const opts: SocketIOClient.ConnectOpts = {
  path: '/socket',
};

export const socket = SocketClient(url, opts);
