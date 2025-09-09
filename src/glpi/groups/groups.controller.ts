import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { GlpiService } from '../glpi.service';

class GroupQueryDto {
  limit?: number;
  offset?: number;
}

@Controller('groups')
export class GroupsController {
  constructor(private readonly glpiService: GlpiService) {}

  // GET /groups/user/123 - Get groups for specific user
  @Get('user/:glpiUserId')
  async getUserGroups(@Param('glpiUserId', ParseIntPipe) glpiUserId: number) {
    return this.glpiService.getUserGroups(glpiUserId);
  }

  // GET /groups/123 - Get group details by ID
  @Get(':groupId')
  async getGroupById(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('glpiUserId', ParseIntPipe) glpiUserId: number,
  ) {
    if (!glpiUserId) {
      throw new BadRequestException('glpiUserId is required for access validation');
    }

    // Verify user is member of this group
    const userGroups = await this.glpiService.getUserGroups(glpiUserId);
    const isMember = userGroups.some((group: any) => group.groups_id === groupId);

    if (!isMember) {
      throw new BadRequestException('Access denied: User is not a member of this group');
    }

    return this.glpiService.getGroupById(groupId);
  }

  // GET /groups/123/tickets?glpiUserId=456&limit=10&offset=0
  @Get(':groupId/tickets')
  async getGroupTickets(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() query: GroupQueryDto & { glpiUserId: string },
  ) {
    const { glpiUserId, limit = 50, offset = 0 } = query;

    if (!glpiUserId) {
      throw new BadRequestException('glpiUserId is required for access validation');
    }

    const userId = parseInt(glpiUserId);

    // First verify user is member of this group
    const userGroups = await this.glpiService.getUserGroups(userId);
    const isMember = userGroups.some((group: any) => group.groups_id === groupId);

    if (!isMember) {
      throw new BadRequestException('Access denied: User is not a member of this group');
    }

    // Get group tickets
    const options = { limit: Number(limit), offset: Number(offset) };
    return this.glpiService.getGroupTickets(groupId, options);
  }

  // GET /groups/123/users?glpiUserId=456 - Get users in a group
  @Get(':groupId/users')
  async getGroupUsers(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('glpiUserId', ParseIntPipe) glpiUserId: number,
  ) {
    if (!glpiUserId) {
      throw new BadRequestException('glpiUserId is required for access validation');
    }

    // Verify user is member of this group
    const userGroups = await this.glpiService.getUserGroups(glpiUserId);
    const isMember = userGroups.some((group: any) => group.groups_id === groupId);

    if (!isMember) {
      throw new BadRequestException('Access denied: User is not a member of this group');
    }

    return this.glpiService.getGroupUsers(groupId);
  }
}