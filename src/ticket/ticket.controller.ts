import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Query, ParseIntPipe, Put } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from '@prisma/client';
import { SearchTicketDto } from './dto/search-ticket.dto';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}


  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    console.log(createTicketDto);
    
    return await this.ticketService.create(createTicketDto);
  }

  @Get()
  async findAll(): Promise<Ticket[]> {
    return await this.ticketService.findAll();
  }

  @Get('search')
  async searchByCriteria(
    @Query() searchDto: SearchTicketDto,
  ): Promise<{ tickets: Ticket[]; total: number }> {
    return await this.ticketService.searchByCriteria(searchDto);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Ticket> {
    return await this.ticketService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    return await this.ticketService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.ticketService.delete(id);
  }

  @Put(':id/deactivate')
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<Ticket> {
    return await this.ticketService.softDelete(id);
  }
}
