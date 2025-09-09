import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { GlpiService } from '../glpi.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly glpiService: GlpiService) {}

  // GET /dashboard/user/123/stats - Get complete dashboard statistics for user
  @Get('user/:glpiUserId/stats')
  async getUserDashboardStats(@Param('glpiUserId', ParseIntPipe) glpiUserId: number) {
    return this.glpiService.getUserTicketStats(glpiUserId);
  }

  // GET /dashboard/user/123/recent - Get recent activity for user
  @Get('user/:glpiUserId/recent')
  async getUserRecentActivity(@Param('glpiUserId', ParseIntPipe) glpiUserId: number) {
    return this.glpiService.getUserRecentActivity(glpiUserId);
  }

  // GET /dashboard/user/123/overview - Get complete user overview
  @Get('user/:glpiUserId/overview')
  async getUserOverview(@Param('glpiUserId', ParseIntPipe) glpiUserId: number) {
    const [stats, recent, groups, profiles] = await Promise.all([
      this.glpiService.getUserTicketStats(glpiUserId),
      this.glpiService.getUserRecentActivity(glpiUserId),
      this.glpiService.getUserGroups(glpiUserId),
      this.glpiService.getUserProfiles(glpiUserId),
    ]);

    return {
      user: {
        glpiId: glpiUserId,
      },
      tickets: {
        stats,
        recent: recent.recentTickets,
      },
      groups,
      profiles,
      summary: {
        totalTickets: stats.totalRequested + stats.totalAssigned,
        totalRequested: stats.totalRequested,
        totalAssigned: stats.totalAssigned,
        groupCount: groups.length,
        profileCount: profiles.length,
      },
    };
  }
}