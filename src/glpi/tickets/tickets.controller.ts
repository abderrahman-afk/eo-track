import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { GlpiService } from '../glpi.service';

// DTOs
class CreateTicketDto {
  title: string;
  content: string;
  urgency?: number;
  impact?: number;
  priority?: number;
  category?: number;
  type?: number;
}

class UpdateTicketDto {
  title?: string;
  content?: string;
  urgency?: number;
  impact?: number;
  priority?: number;
  status?: number;
}

class TicketQueryDto {
  limit?: number;
  offset?: number;
  type?: 'requested' | 'assigned' | 'all';
}

@Controller('tickets')
export class TicketsController {
  constructor(private readonly glpiService: GlpiService) {}

  // GET /tickets?glpiUserId=123&type=all&limit=10&offset=0
  @Get()
  async getUserTickets(@Query() query: TicketQueryDto & { glpiUserId: string }) {
    const { glpiUserId, type = 'all', limit = 50, offset = 0 } = query;

    if (!glpiUserId) {
      throw new BadRequestException('glpiUserId is required');
    }

    const userId = parseInt(glpiUserId);
    const options = { limit: Number(limit), offset: Number(offset) };

    switch (type) {
      case 'requested':
        return this.glpiService.getUserRequestedTickets(userId, options);
      case 'assigned':
        return this.glpiService.getUserAssignedTickets(userId, options);
      case 'all':
      default:
        return this.glpiService.getUserTickets(userId, options);
    }
  }

  // GET /tickets/123?glpiUserId=456
  @Get(':id')
  async getTicketById(
    @Param('id', ParseIntPipe) ticketId: number,
    @Query('glpiUserId', ParseIntPipe) glpiUserId: number,
  ) {
    if (!glpiUserId) {
      throw new BadRequestException('glpiUserId is required');
    }

    return this.glpiService.getTicketById(ticketId, glpiUserId);
  }

  // POST /tickets?glpiUserId=123
  @Post()
  async createTicket(
    @Query('glpiUserId', ParseIntPipe) glpiUserId: number,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    if (!glpiUserId) {
      throw new BadRequestException('glpiUserId is required');
    }

    return this.glpiService.createTicketForUser(glpiUserId, createTicketDto);
  }

  // PUT /tickets/123?glpiUserId=456
  @Put(':id')
  async updateTicket(
    @Param('id', ParseIntPipe) ticketId: number,
    @Query('glpiUserId', ParseIntPipe) glpiUserId: number,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    if (!glpiUserId) {
      throw new BadRequestException('glpiUserId is required');
    }

    return this.glpiService.updateTicket(ticketId, glpiUserId, updateTicketDto);
  }

  // DELETE /tickets/123?glpiUserId=456
  @Delete(':id')
  async deleteTicket(
    @Param('id', ParseIntPipe) ticketId: number,
    @Query('glpiUserId', ParseIntPipe) glpiUserId: number,
  ) {
    if (!glpiUserId) {
      throw new BadRequestException('glpiUserId is required');
    }

    return this.glpiService.deleteTicket(ticketId, glpiUserId);
  }

  // GET /tickets/statuses - Get available ticket statuses
  @Get('meta/statuses')
  async getTicketStatuses() {
    return this.glpiService.getTicketStatuses();
  }

  // GET /tickets/priorities - Get available ticket priorities
  @Get('meta/priorities')
  async getTicketPriorities() {
    return this.glpiService.getTicketPriorities();
  }

  // GET /tickets/search-options - Get available search options
  @Get('meta/search-options')
  async getSearchOptions() {
    return this.glpiService.getTicketSearchOptions();
  }
}