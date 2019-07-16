import SocketServer from 'socket.io';
import { Http2Server } from 'http2';

export let io: SocketServer.Server = null;

const opt: SocketServer.ServerOptions = {
  path: '/socket',
};

export function createSocketServer(httpServer: Http2Server) {
  io = SocketServer(httpServer, opt);
}
