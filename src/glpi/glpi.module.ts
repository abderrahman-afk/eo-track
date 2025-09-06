import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GlpiService } from './glpi.service';
import { GlpiController } from './glpi.controller';
import { HttpModule } from '@nestjs/axios';
import { GlpiAuthService } from './glpiauth/glpiauth.service';
import { GlpiSyncService } from './glpisync/glpisync.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [ConfigModule, HttpModule,UserModule], // ✅ use HttpModule
  providers: [GlpiAuthService, GlpiService, GlpiSyncService],
  controllers: [GlpiController],
  exports: [GlpiService, GlpiSyncService],
})
export class GlpiModule {}
