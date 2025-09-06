import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Module({
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, PrismaService],
  exports: [TicketService, TicketRepository],
})
export class TicketModule {}
