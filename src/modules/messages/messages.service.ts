import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDirectThreadDto } from './dto/create-direct-thread.dto';
import { MessagesGateway } from './messages.gateway';
import { SendMessageDto } from './dto/send-message.dto';

type ActorContext =
  | { role: 'COMPANY'; userId: string; companyId: string }
  | { role: 'RECRUITER'; userId: string; recruiterProfileId: string };

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  private async getActorContext(
    userId: string,
    role: string,
  ): Promise<ActorContext> {
    if (role === 'COMPANY') {
      const company = await this.prisma.company.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!company) {
        throw new NotFoundException('Company profile not found');
      }

      return {
        role: 'COMPANY',
        userId,
        companyId: company.id,
      };
    }

    if (role === 'RECRUITER') {
      const recruiter = await this.prisma.recruiterProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!recruiter) {
        throw new NotFoundException('Recruiter profile not found');
      }

      return {
        role: 'RECRUITER',
        userId,
        recruiterProfileId: recruiter.id,
      };
    }

    throw new ForbiddenException(
      'Messaging is only available for company and recruiter accounts',
    );
  }

  private async assertThreadParticipant(threadId: string, actor: ActorContext) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        companyId: true,
        recruiterProfileId: true,
      },
    });

    if (!thread) {
      throw new NotFoundException('Message thread not found');
    }

    if (actor.role === 'COMPANY' && thread.companyId !== actor.companyId) {
      throw new ForbiddenException('You do not have access to this thread');
    }

    if (
      actor.role === 'RECRUITER' &&
      thread.recruiterProfileId !== actor.recruiterProfileId
    ) {
      throw new ForbiddenException('You do not have access to this thread');
    }

    return thread;
  }

  async createDirectThread(
    userId: string,
    role: string,
    dto: CreateDirectThreadDto,
  ) {
    const actor = await this.getActorContext(userId, role);
    const subject = dto.subject?.trim() || null;
    const initialMessage = dto.initialMessage?.trim() || null;

    if (actor.role === 'COMPANY') {
      if (!dto.recruiterProfileId) {
        throw new BadRequestException(
          'recruiterProfileId is required for company users',
        );
      }

      const recruiter = await this.prisma.recruiterProfile.findUnique({
        where: { id: dto.recruiterProfileId },
        select: { id: true },
      });

      if (!recruiter) {
        throw new NotFoundException('Recruiter profile not found');
      }

      let thread = await this.prisma.messageThread.findFirst({
        where: {
          companyId: actor.companyId,
          recruiterProfileId: recruiter.id,
          engagementId: null,
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (!thread) {
        thread = await this.prisma.messageThread.create({
          data: {
            companyId: actor.companyId,
            recruiterProfileId: recruiter.id,
            subject,
          },
        });
      }

      if (initialMessage) {
        await this.prisma.message.create({
          data: {
            threadId: thread.id,
            senderId: actor.userId,
            body: initialMessage,
          },
        });
      }

      return this.getThreadByIdForUser(thread.id, userId, role);
    }

    if (!dto.companyId) {
      throw new BadRequestException(
        'companyId is required for recruiter users',
      );
    }

    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    let thread = await this.prisma.messageThread.findFirst({
      where: {
        companyId: company.id,
        recruiterProfileId: actor.recruiterProfileId,
        engagementId: null,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!thread) {
      thread = await this.prisma.messageThread.create({
        data: {
          companyId: company.id,
          recruiterProfileId: actor.recruiterProfileId,
          subject,
        },
      });
    }

    if (initialMessage) {
      await this.prisma.message.create({
        data: {
          threadId: thread.id,
          senderId: actor.userId,
          body: initialMessage,
        },
      });
    }

    return this.getThreadByIdForUser(thread.id, userId, role);
  }

  async listThreads(userId: string, role: string) {
    const actor = await this.getActorContext(userId, role);

    const where =
      actor.role === 'COMPANY'
        ? { companyId: actor.companyId }
        : { recruiterProfileId: actor.recruiterProfileId };

    const threads = await this.prisma.messageThread.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        recruiterProfile: {
          select: {
            id: true,
            slug: true,
            photoUrl: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const threadIds = threads.map((thread) => thread.id);
    const unreadRaw =
      threadIds.length > 0
        ? await this.prisma.message.groupBy({
            by: ['threadId'],
            where: {
              threadId: { in: threadIds },
              readAt: null,
              senderId: { not: userId },
            },
            _count: { _all: true },
          })
        : [];

    const unreadMap = new Map(
      unreadRaw.map((item) => [item.threadId, item._count._all]),
    );

    return threads.map((thread) => ({
      id: thread.id,
      subject: thread.subject,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      company: thread.company,
      recruiterProfile: thread.recruiterProfile,
      lastMessage: thread.messages[0]
        ? {
            id: thread.messages[0].id,
            body: thread.messages[0].body,
            createdAt: thread.messages[0].createdAt,
            sender: thread.messages[0].sender,
          }
        : null,
      unreadCount: unreadMap.get(thread.id) ?? 0,
    }));
  }

  async getThreadByIdForUser(threadId: string, userId: string, role: string) {
    const actor = await this.getActorContext(userId, role);
    await this.assertThreadParticipant(threadId, actor);

    const thread = await this.prisma.messageThread.findUnique({
      where: { id: threadId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        recruiterProfile: {
          select: {
            id: true,
            slug: true,
            photoUrl: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Message thread not found');
    }

    return thread;
  }

  async listMessages(threadId: string, userId: string, role: string) {
    const actor = await this.getActorContext(userId, role);
    await this.assertThreadParticipant(threadId, actor);

    const messages = await this.prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return messages;
  }

  async sendMessage(
    threadId: string,
    userId: string,
    role: string,
    dto: SendMessageDto,
  ) {
    const actor = await this.getActorContext(userId, role);
    await this.assertThreadParticipant(threadId, actor);

    const body = dto.body.trim();
    if (!body) {
      throw new BadRequestException('Message body cannot be empty');
    }

    const createdMessage = await this.prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        body,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    const participantUserIds = await this.getParticipantUserIds(threadId);
    this.messagesGateway.emitMessageCreated({
      threadId,
      message: createdMessage,
      participantUserIds,
    });

    return createdMessage;
  }

  private async getParticipantUserIds(threadId: string): Promise<string[]> {
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

    const ids = [
      thread?.company?.userId,
      thread?.recruiterProfile?.userId,
    ].filter((id): id is string => Boolean(id));

    return [...new Set(ids)];
  }

  async markThreadAsRead(threadId: string, userId: string, role: string) {
    const actor = await this.getActorContext(userId, role);
    await this.assertThreadParticipant(threadId, actor);

    const now = new Date();
    await this.prisma.message.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: now },
    });

    return { success: true, readAt: now.toISOString() };
  }
}
