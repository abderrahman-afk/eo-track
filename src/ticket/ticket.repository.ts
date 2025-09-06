import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
 import { UpdateTicketDto } from './dto/update-ticket.dto';
import { SearchTicketDto } from './dto/search-ticket.dto';
import { Ticket } from '@prisma/client';
 

@Injectable()
export class TicketRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        return await this.prisma.ticket.create({
            data: createTicketDto,
        });
    }

    async findAll(): Promise<Ticket[]> {
        return await this.prisma.ticket.findMany();
    }

    async findById(id: number): Promise<Ticket | null> {
        return await this.prisma.ticket.findUnique({
            where: { id },
        });
    }

 
 

    async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket | null> {
        try {
            return await this.prisma.ticket.update({
                where: { id },
                data: updateTicketDto,
            });
        } catch (error) {
            return null;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await this.prisma.ticket.delete({
                where: { id },
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async softDelete(id: number): Promise<Ticket | null> {
        try {
            return await this.prisma.ticket.update({
                where: { id },
                data: { isActive: false },
            });
        } catch (error) {
            return null;
        }
    }

    async searchByCriteria(
        searchDto: SearchTicketDto,
    ): Promise<{ tickets: Ticket[]; total: number }> {
        // Build where clause
        const where: any = {};

        // Apply search filters
        if (searchDto.title) {
            if (searchDto.searchType === 'exact') {
                where.title = searchDto.title;
            } else {
                where.title = {
                    contains: searchDto.title,
                    mode: 'insensitive',
                };
            }
        }

        if (searchDto.description) {
            if (searchDto.searchType === 'exact') {
                where.description = searchDto.description;
            } else {
                where.description = {
                    contains: searchDto.description,
                    mode: 'insensitive',
                };
            }
        }

        if (searchDto.isActive !== undefined) {
            where.isActive = searchDto.isActive;
        }

        // Build order by
        const orderBy: any = {};
        const sortBy = searchDto.sortBy || 'createdAt';
        const sortOrder = (searchDto.sortOrder || 'DESC').toLowerCase();
        orderBy[sortBy] = sortOrder;

        // Apply pagination
        const limit = searchDto.limit || 10;
        const offset = searchDto.offset || 0;

        // Execute queries
        const [tickets, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
                orderBy,
                take: limit,
                skip: offset,
            }),
            this.prisma.ticket.count({ where }),
        ]);

        return { tickets, total };
    }
}
