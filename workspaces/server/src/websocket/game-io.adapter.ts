import { INestApplicationContext, Logger  } from '@nestjs/common';
import { ServerOptions, Socket, Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CONNECTION_EVENT } from '@nestjs/websockets/constants';
import { JwtService } from '@nestjs/jwt';

export type AuthPayload = {
  userName: string;
};

export class GameIoAdapter extends IoAdapter
{
  private readonly logger = new Logger(GameIoAdapter.name);

  constructor(
    private app: INestApplicationContext,
  ) {
    super(app);
  }
  // Default options applied for each gateway
  private options = {
    cors: {
      origin: process.env.CORS_ALLOW_ORIGIN,
    },
    path: '/wsapi',
    transports: ['websocket'],
    serveClient: false,
    maxSocketListeners: 35,
  };

  createIOServer(port: number, options?: ServerOptions): any
  {
    const jwtService = this.app.get(JwtService);

    const server: Server = super.createIOServer(port, {...this.options, ...options});

    server.of('familyinc').use(createTokenMiddleware(jwtService, this.logger))
  }

  public bindClientConnect(server: any, callback: Function)
  {
    server.on(CONNECTION_EVENT, (socket: Socket) => {
      socket.setMaxListeners(this.options.maxSocketListeners);
      callback(socket);
    });
  }
}

const createTokenMiddleware =
  (jwtService: JwtService, logger: Logger) =>
  (socket: Socket & AuthPayload, next) => {
    // for Postman testing support, fallback to token header
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    logger.debug(`Validating auth token before connection: ${token}`);

    try {
      const payload = jwtService.verify(token);
      socket.userName = payload.userName;
      next();
    } catch {
      next(new Error('FORBIDDEN'));
    }
  };