import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GlpiService } from './glpi.service';
import { GlpiController } from './glpi.controller';
import { HttpModule } from '@nestjs/axios';
import { GlpiAuthService } from './glpiauth/glpiauth.service';
import { GlpiSyncService } from './glpisync/glpisync.service';
import { UserModule } from 'src/user/user.module';

// Import new controllers
import { TicketsController } from './tickets/tickets.controller';
import { GroupsController } from './groups/groups.controller';
import { ProfilesController } from './profiles/profiles.controller';
import { DashboardController } from './dashboard/dashboard.controller';

@Module({
  imports: [ConfigModule, HttpModule, UserModule],
  providers: [GlpiAuthService, GlpiService, GlpiSyncService],
  controllers: [
    GlpiController,
    TicketsController,
    GroupsController,
    ProfilesController,
    DashboardController,
  ],
  exports: [GlpiService, GlpiSyncService],
})
export class GlpiModule {}
