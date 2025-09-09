import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Title of the ticket',
    example: 'Printer not working'
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the issue',
    example: 'The office printer on the second floor is not printing properly. It shows paper jam error but no paper is stuck.',
  })
  content: string;

  @ApiPropertyOptional({
    description: 'Urgency level (1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High, 6=Major)',
    example: 3,
    default: 3
  })
  urgency?: number;

  @ApiPropertyOptional({
    description: 'Impact level (1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High, 6=Major)',
    example: 3,
    default: 3
  })
  impact?: number;

  @ApiPropertyOptional({
    description: 'Priority level (1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High, 6=Major)',
    example: 3,
    default: 3
  })
  priority?: number;

  @ApiPropertyOptional({
    description: 'Category ID for ticket classification',
    example: 1
  })
  category?: number;

  @ApiPropertyOptional({
    description: 'Ticket type (1=Incident, 2=Request)',
    example: 1,
    enum: [1, 2],
    default: 1
  })
  type?: number;
}

export class UpdateTicketDto {
  @ApiPropertyOptional({
    description: 'Updated title of the ticket',
    example: 'Printer issue - Updated status'
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description or additional information',
    example: 'Investigation completed. Replacement cartridge needed.'
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Updated urgency level',
    example: 4
  })
  urgency?: number;

  @ApiPropertyOptional({
    description: 'Updated impact level',
    example: 3
  })
  impact?: number;

  @ApiPropertyOptional({
    description: 'Updated priority level',
    example: 4
  })
  priority?: number;

  @ApiPropertyOptional({
    description: 'Updated status (1=New, 2=Processing, 3=Pending, 4=Solved, 5=Closed, 6=Cancelled)',
    example: 2
  })
  status?: number;
}

export class SearchCriteriaDto {
  @ApiProperty({
    description: 'Field ID for search criteria',
    example: 4
  })
  field: number;

  @ApiProperty({
    description: 'Search type',
    example: 'equals',
    enum: ['contains', 'equals', 'notequals', 'lessthan', 'morethan', 'under', 'notunder']
  })
  searchtype: string;

  @ApiProperty({
    description: 'Value to search for',
    example: '123',
    oneOf: [
      { type: 'string' },
      { type: 'number' }
    ]
  })
  value: string | number;
}

export class SearchTicketsDto {
  @ApiPropertyOptional({
    description: 'Search criteria array',
    type: [SearchCriteriaDto],
    example: [
      { field: 4, searchtype: 'equals', value: '6' },
      { field: 12, searchtype: 'equals', value: '1' }
    ]
  })
  criteria?: SearchCriteriaDto[];

  @ApiPropertyOptional({
    description: 'Fields to display in results',
    type: [Number],
    example: [2, 1, 12, 15],
    default: [2, 1, 12, 15]
  })
  forceDisplay?: number[];

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 50,
    default: 50
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of results to skip (pagination)',
    example: 0,
    default: 0
  })
  offset?: number;
}