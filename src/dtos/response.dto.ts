import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GlpiUserDto {
  @ApiProperty({ description: 'User ID', example: 8 })
  id: number;

  @ApiProperty({ description: 'Username', example: 'john.doe' })
  name: string;

  @ApiPropertyOptional({ description: 'Real name', example: 'John Doe' })
  realname?: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  firstname?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'john.doe@example.com' })
  _useremails?: string[];

  @ApiPropertyOptional({ description: 'User phone number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'User mobile number' })
  mobile?: string;

  @ApiPropertyOptional({ description: 'Last login date' })
  last_login?: string;

  @ApiPropertyOptional({ description: 'Creation date' })
  date_creation?: string;

  @ApiPropertyOptional({ description: 'Modification date' })
  date_mod?: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  entities_id?: number;

  @ApiPropertyOptional({ description: 'Is user active', example: 1 })
  is_active?: number;
}

export class GlpiTicketDto {
  @ApiProperty({ description: 'Ticket ID', example: 123 })
  id: number;

  @ApiProperty({ description: 'Ticket title', example: 'Printer not working' })
  name: string;

  @ApiPropertyOptional({ description: 'Ticket content/description' })
  content?: string;

  @ApiPropertyOptional({ description: 'Requester user ID', example: 8 })
  users_id_requester?: number;

  @ApiPropertyOptional({ description: 'Assigned user ID', example: 5 })
  users_id_assign?: number;

  @ApiPropertyOptional({ description: 'Ticket status', example: 2 })
  status?: number;

  @ApiPropertyOptional({ description: 'Urgency level', example: 3 })
  urgency?: number;

  @ApiPropertyOptional({ description: 'Impact level', example: 3 })
  impact?: number;

  @ApiPropertyOptional({ description: 'Priority level', example: 3 })
  priority?: number;

  @ApiPropertyOptional({ description: 'Category ID', example: 1 })
  itilcategories_id?: number;

  @ApiPropertyOptional({ description: 'Entity ID', example: 0 })
  entities_id?: number;

  @ApiPropertyOptional({ description: 'Creation date' })
  date_creation?: string;

  @ApiPropertyOptional({ description: 'Modification date' })
  date_mod?: string;

  @ApiPropertyOptional({ description: 'Ticket type (1=Incident, 2=Request)', example: 1 })
  type?: number;
}

export class GlpiCategoryDto {
  @ApiProperty({ description: 'Category ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Category name', example: 'grave' })
  name: string;

  @ApiProperty({ description: 'Complete category path', example: 'grave > sub categorir grave' })
  completename: string;

  @ApiPropertyOptional({ description: 'Category description', example: 'ticket graves' })
  comment?: string;

  @ApiProperty({ description: 'Parent category ID (0 for main categories)', example: 0 })
  itilcategories_id: number;

  @ApiProperty({ description: 'Category level (1 for main, 2+ for sub)', example: 1 })
  level: number;

  @ApiPropertyOptional({ description: 'Category code', example: 'GR' })
  code?: string;

  @ApiPropertyOptional({ description: 'Entity ID', example: 0 })
  entities_id?: number;

  @ApiPropertyOptional({ description: 'Is visible in helpdesk', example: 1 })
  is_helpdeskvisible?: number;

  @ApiPropertyOptional({ description: 'Supports incidents', example: 1 })
  is_incident?: number;

  @ApiPropertyOptional({ description: 'Supports requests', example: 1 })
  is_request?: number;

  @ApiPropertyOptional({ description: 'Creation date' })
  date_creation?: string;

  @ApiPropertyOptional({ description: 'Modification date' })
  date_mod?: string;
}

export class CategoryWithSubCategoriesDto {
  @ApiProperty({ description: 'Main category information', type: GlpiCategoryDto })
  category: GlpiCategoryDto;

  @ApiProperty({ description: 'Sub-categories', type: [GlpiCategoryDto] })
  subCategories: GlpiCategoryDto[];

  @ApiProperty({ description: 'Whether category has sub-categories', example: true })
  hasSubCategories: boolean;

  @ApiProperty({ description: 'Number of sub-categories', example: 2 })
  subCategoryCount: number;
}

export class UserTicketStatsDto {
  @ApiProperty({ description: 'Total tickets requested by user', example: 25 })
  totalRequested: number;

  @ApiProperty({ description: 'Total tickets assigned to user', example: 12 })
  totalAssigned: number;

  @ApiProperty({ 
    description: 'Requested tickets grouped by status', 
    example: { '1': 5, '2': 10, '5': 10 }
  })
  requestedByStatus: Record<string, number>;

  @ApiProperty({ 
    description: 'Assigned tickets grouped by status',
    example: { '2': 8, '4': 4 }
  })
  assignedByStatus: Record<string, number>;

  @ApiProperty({ description: 'Recent requested tickets (last 5)', type: [Object] })
  recentRequested: any[];

  @ApiProperty({ description: 'Recent assigned tickets (last 5)', type: [Object] })
  recentAssigned: any[];
}

export class UserOverviewDto {
  @ApiProperty({ description: 'User information', type: GlpiUserDto })
  user: GlpiUserDto;

  @ApiProperty({ 
    description: 'Ticket information including recent tickets and statistics'
  })
  tickets: {
    recent: any[];
    stats: UserTicketStatsDto;
  };

  @ApiProperty({ description: 'User groups', type: [Object] })
  groups: any[];

  @ApiProperty({ description: 'User profiles', type: [Object] })
  profiles: any[];

  @ApiProperty({
    description: 'Summary statistics',
    properties: {
      totalTickets: { type: 'number', example: 37 },
      totalRequested: { type: 'number', example: 25 },
      totalAssigned: { type: 'number', example: 12 },
      groupCount: { type: 'number', example: 3 },
      profileCount: { type: 'number', example: 2 }
    }
  })
  summary: {
    totalTickets: number;
    totalRequested: number;
    totalAssigned: number;
    groupCount: number;
    profileCount: number;
  };
}

export class SearchResultDto {
  @ApiProperty({ description: 'Search results data', type: [Object] })
  data: any[];

  @ApiPropertyOptional({ description: 'Total count of results', example: 123 })
  totalcount?: number;

  @ApiPropertyOptional({ description: 'Current page count', example: 50 })
  count?: number;

  @ApiPropertyOptional({ description: 'Content range information', example: '0-49/123' })
  'content-range'?: string;
}

export class TicketStatusDto {
  @ApiProperty({ description: 'Status ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Status name', example: 'New' })
  name: string;
}

export class TicketPriorityDto {
  @ApiProperty({ description: 'Priority ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Priority name', example: 'Very Low' })
  name: string;
}