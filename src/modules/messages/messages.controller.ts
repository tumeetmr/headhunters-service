import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '../../common/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateDirectThreadDto } from './dto/create-direct-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
@Roles(Role.COMPANY, Role.RECRUITER)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('threads')
  listThreads(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.messagesService.listThreads(userId, role);
  }

  @Post('threads/direct')
  createDirectThread(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateDirectThreadDto,
  ) {
    return this.messagesService.createDirectThread(userId, role, dto);
  }

  @Get('threads/:threadId')
  getThread(
    @Param('threadId', ParseUUIDPipe) threadId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.messagesService.getThreadByIdForUser(threadId, userId, role);
  }

  @Get('threads/:threadId/messages')
  listMessages(
    @Param('threadId', ParseUUIDPipe) threadId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.messagesService.listMessages(threadId, userId, role);
  }

  @Post('threads/:threadId/messages')
  sendMessage(
    @Param('threadId', ParseUUIDPipe) threadId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(threadId, userId, role, dto);
  }

  @Patch('threads/:threadId/read')
  markThreadAsRead(
    @Param('threadId', ParseUUIDPipe) threadId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.messagesService.markThreadAsRead(threadId, userId, role);
  }
}
