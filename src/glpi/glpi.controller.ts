import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { GlpiService } from './glpi.service';
import { GlpiSyncService } from './glpisync/glpisync.service';

@Controller('glpi')
export class GlpiController {
  constructor(private readonly glpiService: GlpiService, private readonly glpiSyncService: GlpiSyncService) { }

  @Get('users')
  async getUsers() {
    return await this.glpiService.listUsers();
  }
  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.glpiService.getUserById(id);
  }

  @Get('tickets')
  async getTickets() {
    return await this.glpiService.listTickets();
  }

  @Post('sync-users')
  async syncUsers(
    @Query('dryRun') dryRun?: string,
  ) {
    const opts = {
      dryRun: (dryRun ?? 'false').toLowerCase() === 'true',
    };
    return this.glpiSyncService.syncUsersFromGlpi(opts);
  }
}
