import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
 
import { TicketModule } from './ticket/ticket.module';
import { GlpiModule } from './glpi/glpi.module';
import { PrismaModule } from './core/prisma/prisma.module';
 
  
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    PrismaModule,
    TicketModule,
    GlpiModule,
   ],
 
})
export class AppModule {}
