import { AccessAuthGuard } from '@app/authentication/access.guard';
import { Friendship } from '@app/model/database/friendship.entity';
import { User } from '@app/model/database/user.entity';
import { StatisticDto } from '@app/model/dto/statistic';
import { FriendshipService } from '@app/services/friendship/friendship.service';
import { StatisticService } from '@app/services/statistics/statistic.service';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(AccessAuthGuard)
export class UserController {
    constructor(private readonly friendshipService: FriendshipService, private statisticService: StatisticService) {}

    @ApiOperation({ summary: 'Get all app users' })
    @Get('/:id')
    async getUsers(@Param('id') id: string): Promise<User[]> {
        return await this.friendshipService.getUsers(id);
    }

    @ApiOperation({ summary: 'Get friends of User ' })
    @Get('/:userId/friends-of-friend/:friendId')
    async getFriendsOfFriend(@Param('userId') userId: string, @Param('friendId') friendId: string): Promise<{ user: User; canInteract: boolean }[]> {
        return await this.friendshipService.getFriendsofFriend(userId, friendId);
    }

    @ApiOperation({ summary: 'Get a specific user Friends' })
    @Get('/:id/friends')
    async getUserFriends(@Param('id') username: string): Promise<Friendship[]> {
        return await this.friendshipService.getFriends(username);
    }

    @ApiOperation({ summary: 'Get all user blocked person' })
    @Get('/:id/block')
    async getUserBlocked(@Param('id') userId: string): Promise<Friendship[]> {
        return await this.friendshipService.getUserBlocked(userId);
    }

    @ApiOperation({ summary: 'Get all user request sent' })
    @Get(':id/friend-requests/sent')
    async getRequestSent(@Param('id') userId: string): Promise<Friendship[]> {
        return await this.friendshipService.getSentFriendRequests(userId);
    }

    @ApiOperation({ summary: 'Get all user request received' })
    @Get(':id/friend-requests/received')
    async getRequestReceived(@Param('id') userId: string): Promise<Friendship[]> {
        return await this.friendshipService.getFriendRequests(userId);
    }

    @ApiOperation({ summary: 'Get all users' })
    @Post('/follow')
    async followUser(@Body() users: { senderId: string; receiverId: string }): Promise<Friendship> {
        return await this.friendshipService.createFriendship(users);
    }

    @ApiOperation({ summary: 'Accept or Decline Friend Request' })
    @Post('/friend-requests')
    async acceptOrDeclineUserRequest(@Body() data: { friendshipId: string; inviteResponse: string }): Promise<Friendship> {
        return await this.friendshipService.acceptOrDeclineRequest(data);
    }

    @ApiOperation({ summary: 'Block a specific user' })
    @Post('/block')
    async blockUser(@Body() data: { friendshipId: string; blockedUserId: string }): Promise<Friendship> {
        return await this.friendshipService.blockUser(data.friendshipId, data.blockedUserId);
    }

    @ApiOperation({ summary: 'Remove a friend request' })
    @Delete('/friend-requests/:friendshipId')
    async removeFriendRequest(@Param('friendshipId') friendshipId: string): Promise<Friendship> {
        return await this.friendshipService.removeEntry(friendshipId);
    }

    @ApiOperation({ summary: 'Remove a friend' })
    @Delete('/friends/:friendshipId')
    async removeFriend(@Param('friendshipId') friendshipId: string): Promise<Friendship> {
        return await this.friendshipService.removeEntry(friendshipId);
    }

    @ApiOperation({ summary: 'Remove a friend request' })
    @Post('/unblock')
    async unblockUser(@Body('friendshipId') friendshipId: string): Promise<Friendship> {
        return await this.friendshipService.removeEntry(friendshipId);
    }

    @ApiOperation({ summary: 'Get all app users' })
    @Get('/:id/statistic')
    async getUserStatistic(@Param('id') id: string): Promise<StatisticDto> {
        return await this.statisticService.getStatistics(id);
    }
}
