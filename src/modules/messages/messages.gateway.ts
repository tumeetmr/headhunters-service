import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { IsString, IsUUID } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { Server, Socket } from 'socket.io';

interface SocketUser {
  id: string;
  email: string;
  role: string;
}

interface MessagePayload {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  readAt?: string | Date | null;
  createdAt: string | Date;
  sender: {
    id: string;
    name?: string | null;
    role?: string;
  };
}

class ThreadSubscriptionDto {
  @IsUUID()
  @IsString()
  threadId!: string;
}

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: true,
    credentials: true,
  },
})
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessagesGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = this.authenticateClient(client);
      client.data.user = user;
      await client.join(this.userRoom(user.id));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unauthorized socket connection';
      this.logger.warn(`Socket auth failed: ${message}`);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    client.removeAllListeners();
  }

  @SubscribeMessage('thread:join')
  async handleThreadJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: ThreadSubscriptionDto,
  ) {
    const user = this.getSocketUser(client);
    const hasAccess = await this.isThreadParticipant(body.threadId, user.id);

    if (!hasAccess) {
      throw new WsException('You do not have access to this thread');
    }

    await client.join(this.threadRoom(body.threadId));
    return { success: true, threadId: body.threadId };
  }

  @SubscribeMessage('thread:leave')
  async handleThreadLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: ThreadSubscriptionDto,
  ) {
    await client.leave(this.threadRoom(body.threadId));
    return { success: true, threadId: body.threadId };
  }

  emitMessageCreated(params: {
    threadId: string;
    message: MessagePayload;
    participantUserIds: string[];
  }) {
    this.server.to(this.threadRoom(params.threadId)).emit('messages:new', {
      threadId: params.threadId,
      message: params.message,
    });

    for (const userId of params.participantUserIds) {
      this.server.to(this.userRoom(userId)).emit('threads:updated', {
        threadId: params.threadId,
        message: params.message,
      });
    }
  }

  private authenticateClient(client: Socket): SocketUser {
    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Missing authorization token');
    }

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new WsException('JWT secret is not configured');
    }

    const payload = this.jwtService.verify<{
      sub: string;
      email: string;
      role: string;
    }>(token, { secret });

    if (!payload.sub) {
      throw new WsException('Invalid authorization token');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }

  private extractToken(client: Socket): string | null {
    const authToken =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : null;

    if (authToken?.startsWith('Bearer ')) {
      return authToken.slice(7).trim();
    }

    if (authToken) {
      return authToken.trim();
    }

    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    return null;
  }

  private async isThreadParticipant(
    threadId: string,
    userId: string,
  ): Promise<boolean> {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
      select: {
        company: {
          select: { userId: true },
        },
        recruiterProfile: {
          select: { userId: true },
        },
      },
    });

    if (!thread) {
      return false;
    }

    return (
      thread.company?.userId === userId ||
      thread.recruiterProfile?.userId === userId
    );
  }

  private getSocketUser(client: Socket): SocketUser {
    const user = client.data.user as SocketUser | undefined;
    if (!user?.id) {
      throw new WsException('Socket is not authenticated');
    }

    return user;
  }

  private threadRoom(threadId: string) {
    return `thread:${threadId}`;
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }
}
