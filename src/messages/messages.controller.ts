import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private service: MessagesService) {}

  @Post()
  send(
    @Body() body: SendMessageDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.sendMessage({
      conversationId: body.conversationId,
      senderId: user.userId, // ✅ secure
      content: body.content,
    });
  }

  @Get(':conversationId')
  get(@Param('conversationId', ParseUUIDPipe) conversationId: string) {
    return this.service.getMessages(conversationId);
  }
}