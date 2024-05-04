import { ChatService } from '@app/services/chat/chat.service';
import { ClassSerializerInterceptor, Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Chats')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}
    // FIXME Mettre dans un autre controller maybe
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Get user' })
    @Get('/:username')
    async getUserId(@Param('username') username: string): Promise<string> {
        return await this.chatService.getUserIdForChatCreation(username);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Get chat name' })
    @Get('chatname/:chatId')
    async getChatName(@Param('chatId') chatId: string): Promise<string> {
        return await this.chatService.getChatName(chatId);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation({ summary: 'Get chat users' })
    @Get('users/:chatId')
    async getChatUsers(@Param('chatId') chatId: string): Promise<string[]> {
        return await this.chatService.getChatUsers(chatId);
    }
}
