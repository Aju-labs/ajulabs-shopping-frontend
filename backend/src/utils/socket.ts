import { Server } from 'socket.io';
import type http from 'http';
import { socketCorsOptions } from './cors';

let io: Server | null = null;

export function initSocket(server: http.Server): Server {
  io = new Server(server, {
    cors: socketCorsOptions,
  });

  io.on('connection', (socket) => {
    socket.on('entregador:join', (entregadorId: string) => {
      socket.join(`entregador:${entregadorId}`);
      socket.join('entregadores');
    });

    socket.on('usuario:join', (usuarioId: string) => {
      socket.join(`usuario:${usuarioId}`);
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) throw new Error('Socket.IO não inicializado');
  return io;
}
