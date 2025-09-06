import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from '@prisma/client';
import { TicketRepository } from './ticket.repository';
import { SearchTicketDto } from './dto/search-ticket.dto';

@Injectable()
export class TicketService {

  constructor(private readonly ticketRepository: TicketRepository) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {

    return await this.ticketRepository.create(createTicketDto);
  }

  async findAll(): Promise<Ticket[]> {
    return await this.ticketRepository.findAll();
  }

  async findById(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }
 
 

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    // Check if ticket exists
    await this.findById(id);
    const updatedTicket = await this.ticketRepository.update(id, updateTicketDto);
    if (!updatedTicket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return updatedTicket;
  }

  async delete(id: number): Promise<void> {
    const success = await this.ticketRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
  }

  async softDelete(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.softDelete(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async searchByCriteria(
    searchDto: SearchTicketDto,
  ): Promise<{ tickets: Ticket[]; total: number }> {
    return await this.ticketRepository.searchByCriteria(searchDto);
  }
}
