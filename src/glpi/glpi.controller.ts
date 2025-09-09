import { Controller, Get, Param, ParseIntPipe, Post, Query, Body, Put, Delete, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { GlpiService } from './glpi.service';
import { GlpiSyncService } from './glpisync/glpisync.service';
import { firstValueFrom } from 'rxjs';
import { CreateTicketDto, UpdateTicketDto, SearchTicketsDto } from '../dtos/ticket.dto';
import { 
  GlpiUserDto, 
  GlpiTicketDto, 
  GlpiCategoryDto, 
  CategoryWithSubCategoriesDto, 
  UserOverviewDto, 
  UserTicketStatsDto,
  SearchResultDto,
  TicketStatusDto,
  TicketPriorityDto
} from '../dtos/response.dto';

@ApiTags('GLPI Integration')
@Controller('glpi')
export class GlpiController {
  constructor(private readonly glpiService: GlpiService, private readonly glpiSyncService: GlpiSyncService) { }

  // ==================== USER ENDPOINTS ====================

  @Get('users')
  @ApiTags('Users')
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieve a list of all GLPI users with their basic information'
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: [GlpiUserDto]
  })
  async getUsers() {
    return await this.glpiService.listUsers();
  }

  @Get('users/:id')
  @ApiTags('Users')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed information for a specific user by their GLPI ID'
  })
  @ApiParam({
    name: 'id',
    description: 'GLPI User ID',
    example: 8,
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: GlpiUserDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.glpiService.getUserById(id);
  }

  // Get user's tickets using relationship endpoint
  @Get('users/:id/tickets')
  async getUserTickets(
    @Param('id', ParseIntPipe) userId: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const options = { limit: limit || 50, offset: offset || 0 };
    return await this.glpiService.getUserTickets(userId, options);
  }

  // Get user's groups using relationship endpoint
  @Get('users/:id/groups')
  async getUserGroups(@Param('id', ParseIntPipe) userId: number) {
    return await this.glpiService.getUserGroups(userId);
  }

  // Get user's profiles using relationship endpoint
  @Get('users/:id/profiles')
  async getUserProfiles(@Param('id', ParseIntPipe) userId: number) {
    return await this.glpiService.getUserProfiles(userId);
  }

  // Get user's requested tickets only
  @Get('users/:id/tickets/requested')
  async getUserRequestedTickets(
    @Param('id', ParseIntPipe) userId: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const options = { limit: limit || 50, offset: offset || 0 };
    return await this.glpiService.getUserRequestedTickets(userId, options);
  }

  // Get user's assigned tickets only
  @Get('users/:id/tickets/assigned')
  async getUserAssignedTickets(
    @Param('id', ParseIntPipe) userId: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const options = { limit: limit || 50, offset: offset || 0 };
    return await this.glpiService.getUserAssignedTickets(userId, options);
  }

  // Get user's dashboard statistics
  @Get('users/:id/stats')
  @ApiTags('Users')
  @ApiOperation({
    summary: 'Get user ticket statistics',
    description: 'Get comprehensive ticket statistics for a specific user including counts by status'
  })
  @ApiParam({
    name: 'id',
    description: 'GLPI User ID',
    example: 8
  })
  @ApiResponse({
    status: 200,
    description: 'User ticket statistics retrieved successfully',
    type: UserTicketStatsDto
  })
  async getUserStats(@Param('id', ParseIntPipe) userId: number) {
    return await this.glpiService.getUserTicketStats(userId);
  }

  // Get user's recent activity
  @Get('users/:id/recent')
  @ApiTags('Users')
  @ApiOperation({
    summary: 'Get user recent activity',
    description: 'Get user\'s recent ticket activity (last 10 tickets)'
  })
  @ApiParam({
    name: 'id',
    description: 'GLPI User ID',
    example: 8
  })
  @ApiResponse({
    status: 200,
    description: 'User recent activity retrieved successfully'
  })
  async getUserRecentActivity(@Param('id', ParseIntPipe) userId: number) {
    return await this.glpiService.getUserRecentActivity(userId);
  }

  // ==================== TICKET ENDPOINTS ====================

  @Get('tickets')
  async getTickets() {
    return await this.glpiService.listTickets();
  }

  @Get('tickets/:id')
  async getTicketById(@Param('id', ParseIntPipe) ticketId: number) {
    // Direct GLPI API call for ticket details
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Ticket/${ticketId}`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Create new ticket for user
  @Post('users/:id/tickets')
  @ApiTags('Tickets')
  @ApiOperation({
    summary: 'Create ticket for user',
    description: 'Create a new ticket for a specific user with validation and automatic assignment'
  })
  @ApiParam({
    name: 'id',
    description: 'GLPI User ID who will be the requester',
    example: 8
  })
  @ApiBody({
    type: CreateTicketDto,
    description: 'Ticket creation data'
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: GlpiTicketDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket data provided'
  })
  async createTicketForUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() ticketData: CreateTicketDto,
  ) {
    return await this.glpiService.createTicketForUser(userId, ticketData);
  }

  // Update ticket
  @Put('tickets/:id')
  async updateTicket(
    @Param('id', ParseIntPipe) ticketId: number,
    @Query('userId', ParseIntPipe) userId: number,
    @Body() updateData: {
      title?: string;
      content?: string;
      urgency?: number;
      impact?: number;
      priority?: number;
      status?: number;
    },
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required for access validation');
    }
    return await this.glpiService.updateTicket(ticketId, userId, updateData);
  }

  // Delete ticket
  @Delete('tickets/:id')
  async deleteTicket(
    @Param('id', ParseIntPipe) ticketId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required for access validation');
    }
    return await this.glpiService.deleteTicket(ticketId, userId);
  }

  // Get ticket statuses
  @Get('tickets/meta/statuses')
  async getTicketStatuses() {
    return await this.glpiService.getTicketStatuses();
  }

  // Get ticket priorities
  @Get('tickets/meta/priorities')
  async getTicketPriorities() {
    return await this.glpiService.getTicketPriorities();
  }

  // Get ticket search options
  @Get('tickets/meta/search-options')
  async getTicketSearchOptions() {
    return await this.glpiService.getTicketSearchOptions();
  }

  // ==================== GROUP ENDPOINTS ====================

  // Get all groups
  @Get('groups')
  async getGroups() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Group`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get specific group
  @Get('groups/:id')
  async getGroupById(@Param('id', ParseIntPipe) groupId: number) {
    return await this.glpiService.getGroupById(groupId);
  }

  // Get group's tickets using relationship endpoint
  @Get('groups/:id/tickets')
  async getGroupTickets(
    @Param('id', ParseIntPipe) groupId: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const options = { limit: limit || 50, offset: offset || 0 };
    return await this.glpiService.getGroupTickets(groupId, options);
  }

  // Get group's users using relationship endpoint
  @Get('groups/:id/users')
  async getGroupUsers(@Param('id', ParseIntPipe) groupId: number) {
    return await this.glpiService.getGroupUsers(groupId);
  }

  // ==================== PROFILE ENDPOINTS ====================

  // Get all profiles
  @Get('profiles')
  async getProfiles() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Profile`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get specific profile
  @Get('profiles/:id')
  async getProfileById(@Param('id', ParseIntPipe) profileId: number) {
    return await this.glpiService.getProfileById(profileId);
  }

  // Get profile rights/permissions
  @Get('profiles/:id/rights')
  async getProfileRights(@Param('id', ParseIntPipe) profileId: number) {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Profile/${profileId}/ProfileRight`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get profile users
  @Get('profiles/:id/users')
  async getProfileUsers(@Param('id', ParseIntPipe) profileId: number) {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Profile/${profileId}/Profile_User`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // ==================== ENTITY ENDPOINTS ====================

  // Get all entities
  @Get('entities')
  async getEntities() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Entity`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get specific entity
  @Get('entities/:id')
  async getEntityById(@Param('id', ParseIntPipe) entityId: number) {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Entity/${entityId}`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get entity users
  @Get('entities/:id/users')
  async getEntityUsers(@Param('id', ParseIntPipe) entityId: number) {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Entity/${entityId}/Profile_User`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // ==================== COMPUTER/ASSET ENDPOINTS ====================

  // Get all computers
  @Get('computers')
  async getComputers() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Computer`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get specific computer
  @Get('computers/:id')
  async getComputerById(@Param('id', ParseIntPipe) computerId: number) {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Computer/${computerId}`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get user's computers
  @Get('users/:id/computers')
  async getUserComputers(@Param('id', ParseIntPipe) userId: number) {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/User/${userId}/Computer_Item`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // ==================== MONITOR ENDPOINTS ====================

  // Get all monitors
  @Get('monitors')
  async getMonitors() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Monitor`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get specific monitor
  @Get('monitors/:id')
  async getMonitorById(@Param('id', ParseIntPipe) monitorId: number) {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Monitor/${monitorId}`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // ==================== SOFTWARE ENDPOINTS ====================

  // Get all software
  @Get('software')
  async getSoftware() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Software`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get specific software
  @Get('software/:id')
  async getSoftwareById(@Param('id', ParseIntPipe) softwareId: number) {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Software/${softwareId}`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // ==================== CATEGORY ENDPOINTS ====================

  // Get ticket categories
  @Get('ticket-categories')
  async getTicketCategories() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/ITILCategory`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get specific ticket category
  @Get('ticket-categories/:id')
  async getTicketCategoryById(@Param('id', ParseIntPipe) categoryId: number) {
    return await this.glpiService.getCategoryById(categoryId);
  }

  // ==================== ENHANCED CATEGORY ENDPOINTS ====================

  // Get all categories (including main and sub-categories)
  @Get('categories')
  async getAllCategories() {
    return await this.glpiService.getAllCategories();
  }

  // Get specific category by ID
  @Get('categories/:id')
  async getCategoryById(@Param('id', ParseIntPipe) categoryId: number) {
    return await this.glpiService.getCategoryById(categoryId);
  }

  // Get only main categories (parent categories with itilcategories_id = 0)
  @Get('categories/main')
  async getMainCategories() {
    return await this.glpiService.getMainCategories();
  }

  // Get all sub-categories
  @Get('categories/sub')
  async getAllSubCategories() {
    return await this.glpiService.getSubCategories();
  }

  // Get sub-categories for a specific parent category
  @Get('categories/:parentId/sub-categories')
  async getSubCategoriesByParent(@Param('parentId', ParseIntPipe) parentId: number) {
    return await this.glpiService.getSubCategoriesByParent(parentId);
  }

  // Get category with its sub-categories
  @Get('categories/:id/with-sub-categories')
  async getCategoryWithSubCategories(@Param('id', ParseIntPipe) categoryId: number) {
    return await this.glpiService.getCategoryWithSubCategories(categoryId);
  }

  // Get complete category hierarchy (organized structure)
  @Get('categories/hierarchy')
  @ApiTags('Categories')
  @ApiOperation({
    summary: 'Get category hierarchy',
    description: 'Get complete hierarchical structure of categories with parent-child relationships organized for UI display'
  })
  @ApiResponse({
    status: 200,
    description: 'Category hierarchy retrieved successfully',
    type: [CategoryWithSubCategoriesDto]
  })
  async getCategoryHierarchy() {
    return await this.glpiService.getCategoryHierarchy();
  }

  // ==================== LOCATION ENDPOINTS ====================

  // Get all locations
  @Get('locations')
  async getLocations() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Location`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get specific location
  @Get('locations/:id')
  async getLocationById(@Param('id', ParseIntPipe) locationId: number) {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/Location/${locationId}`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // ==================== DASHBOARD/OVERVIEW ENDPOINTS ====================

  // Get complete user overview
  @Get('users/:id/overview')
  @ApiTags('Users')
  @ApiOperation({
    summary: 'Get complete user overview',
    description: 'Get comprehensive user overview including profile, tickets, groups, and statistics - perfect for dashboard display'
  })
  @ApiParam({
    name: 'id',
    description: 'GLPI User ID',
    example: 8
  })
  @ApiResponse({
    status: 200,
    description: 'Complete user overview retrieved successfully',
    type: UserOverviewDto
  })
  async getUserOverview(@Param('id', ParseIntPipe) userId: number) {
    const [user, tickets, groups, profiles, stats] = await Promise.all([
      this.glpiService.getUserById(userId),
      this.glpiService.getUserTickets(userId, { limit: 10 }),
      this.glpiService.getUserGroups(userId),
      this.glpiService.getUserProfiles(userId),
      this.glpiService.getUserTicketStats(userId),
    ]);

    return {
      user,
      tickets: {
        recent: tickets?.data || [],
        stats,
      },
      groups: groups || [],
      profiles: profiles || [],
      summary: {
        totalTickets: stats.totalRequested + stats.totalAssigned,
        totalRequested: stats.totalRequested,
        totalAssigned: stats.totalAssigned,
        groupCount: (groups || []).length,
        profileCount: (profiles || []).length,
      },
    };
  }

  // ==================== UTILITY/SYNC ENDPOINTS ====================

  @Post('sync-users')
  async syncUsers(
    @Query('dryRun') dryRun?: string,
  ) {
    const opts = {
      dryRun: (dryRun ?? 'false').toLowerCase() === 'true',
    };
    return this.glpiSyncService.syncUsersFromGlpi(opts);
  }

  // Get GLPI configuration
  @Get('config')
  async getGlpiConfig() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/getGlpiConfig`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // Get session info
  @Get('session')
  async getSessionInfo() {
    const res = await firstValueFrom(
      this.glpiService.http.get(`${this.glpiService.cfg.get('GLPI_URL')}/getFullSession`, {
        headers: await this.glpiService.auth.headers(),
      })
    );
    return res.data;
  }

  // ==================== SEARCH ENDPOINTS ====================

  // Search tickets with criteria
  @Post('search/tickets')
  @ApiTags('Search')
  @ApiOperation({
    summary: 'Search tickets with criteria',
    description: 'Perform advanced ticket search using GLPI search criteria with field IDs, search types, and values'
  })
  @ApiBody({
    type: SearchTicketsDto,
    description: 'Search criteria and options',
    examples: {
      'Search by requester': {
        value: {
          criteria: [{ field: 4, searchtype: 'equals', value: '6' }],
          forceDisplay: [2, 1, 12, 15],
          limit: 20
        }
      },
      'Search by status and requester': {
        value: {
          criteria: [
            { field: 4, searchtype: 'equals', value: '6' },
            { field: 12, searchtype: 'equals', value: '1' }
          ],
          forceDisplay: [2, 1, 12, 15],
          limit: 10
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: SearchResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search criteria'
  })
  async searchTickets(
    @Body() searchData: SearchTicketsDto,
  ) {
    const { criteria = [], forceDisplay = [2, 1, 12, 15], limit = 50, offset = 0 } = searchData;
    return await this.glpiService.searchTickets(criteria, forceDisplay, { limit, offset });
  }

  // Search users with criteria
  @Post('search/users')
  async searchUsers(
    @Body() searchData: {
      criteria?: Array<{
        field: number;
        searchtype: string;
        value: string | number;
      }>;
      forceDisplay?: number[];
      limit?: number;
      offset?: number;
    },
  ) {
    const { criteria = [], forceDisplay = [2, 1, 5, 8], limit = 50, offset = 0 } = searchData;
    return await this.glpiService.searchUsers(criteria, forceDisplay, { limit, offset });
  }

  // Search groups with criteria
  @Post('search/groups')
  async searchGroups(
    @Body() searchData: {
      criteria?: Array<{
        field: number;
        searchtype: string;
        value: string | number;
      }>;
      forceDisplay?: number[];
      limit?: number;
      offset?: number;
    },
  ) {
    const { criteria = [], forceDisplay = [2, 1, 16], limit = 50, offset = 0 } = searchData;
    return await this.glpiService.searchGroups(criteria, forceDisplay, { limit, offset });
  }

  // Search profiles with criteria
  @Post('search/profiles')
  async searchProfiles(
    @Body() searchData: {
      criteria?: Array<{
        field: number;
        searchtype: string;
        value: string | number;
      }>;
      forceDisplay?: number[];
      limit?: number;
      offset?: number;
    },
  ) {
    const { criteria = [], forceDisplay = [2, 1, 19], limit = 50, offset = 0 } = searchData;
    return await this.glpiService.searchProfiles(criteria, forceDisplay, { limit, offset });
  }

  // Generic search endpoint for any item type
  @Post('search/:itemType')
  async searchGeneric(
    @Param('itemType') itemType: string,
    @Body() searchData: {
      criteria?: Array<{
        field: number;
        searchtype: string;
        value: string | number;
      }>;
      forceDisplay?: number[];
      limit?: number;
      offset?: number;
    },
  ) {
    const { criteria = [], forceDisplay = [], limit = 50, offset = 0 } = searchData;
    return await this.glpiService.searchItems(itemType, criteria, forceDisplay, { limit, offset });
  }
}
