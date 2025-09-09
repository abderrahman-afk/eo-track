import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GlpiAuthService } from './glpiauth/glpiauth.service';

interface CreateTicketDto {
  title: string;
  content: string;
  urgency?: number;
  impact?: number;
  priority?: number;
  category?: number;
  type?: number;
  status?: number;
}

interface UpdateTicketDto {
  title?: string;
  content?: string;
  urgency?: number;
  impact?: number;
  priority?: number;
  status?: number;
}

interface SearchOptions {
  limit?: number;
  offset?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class GlpiService {
  constructor(
    public readonly http: HttpService,
    public readonly auth: GlpiAuthService,
    public readonly cfg: ConfigService,
  ) {}

  // ==================== USER METHODS ====================

  async listUsers() {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/User`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  async getUserById(id: number) {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/User/${id}`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // ==================== TICKET METHODS ====================

  async listTickets() {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/Ticket`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Get tickets for a specific user using GLPI relationship endpoint
  async getUserTickets(glpiUserId: number, options: SearchOptions = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const params = {
      range: `${offset}-${offset + limit - 1}`,
    };

    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/User/${glpiUserId}/Ticket_User`, {
        headers: await this.auth.headers(),
        params,
      }),
    );
    return res.data;
  }

  // Get tickets requested by user (using search with specific filter)
  async getUserRequestedTickets(glpiUserId: number, options: SearchOptions = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const params = new URLSearchParams();
    params.append('criteria[0][field]', '4'); // users_id_requester
    params.append('criteria[0][value]', glpiUserId.toString());
    params.append('criteria[0][searchtype]', 'equals');
    params.append('range', `${offset}-${offset + limit - 1}`);

    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/search/Ticket?${params.toString()}`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Get tickets assigned to user
  async getUserAssignedTickets(glpiUserId: number, options: SearchOptions = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const params = new URLSearchParams();
    params.append('criteria[0][field]', '5'); // users_id_assign
    params.append('criteria[0][value]', glpiUserId.toString());
    params.append('criteria[0][searchtype]', 'equals');
    params.append('range', `${offset}-${offset + limit - 1}`);

    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/search/Ticket?${params.toString()}`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Get specific ticket (with access validation)
  async getTicketById(ticketId: number, glpiUserId?: number) {
    const ticket = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/Ticket/${ticketId}`, {
        headers: await this.auth.headers(),
      }),
    );

    const ticketData = ticket.data;
    
    // Validate user has access to this ticket (if glpiUserId is provided)
    if (glpiUserId) {
      const requesterId = parseInt(ticketData.users_id_requester) || 0;
      const assignedId = parseInt(ticketData.users_id_assign) || 0;
      
      if (requesterId !== glpiUserId && assignedId !== glpiUserId) {
        throw new Error('Access denied to this ticket');
      }
    }

    return ticketData;
  }

  // Create ticket for user
  async createTicketForUser(glpiUserId: number, ticketData: CreateTicketDto) {
    const payload = {
      name: ticketData.title,
      content: ticketData.content,
      users_id_requester: glpiUserId,
      urgency: ticketData.urgency || 3,
      impact: ticketData.impact || 3,
      priority: ticketData.priority || 3,
      type: ticketData.type || 1, // 1 = Incident, 2 = Request
      status: ticketData.status || 1, // 1 = New
      itilcategories_id: ticketData.category || 0,
    };

    const res = await firstValueFrom(
      this.http.post(`${this.cfg.get('GLPI_URL')}/Ticket`, payload, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Update ticket (with access validation)
  async updateTicket(ticketId: number, glpiUserId: number, updateData: UpdateTicketDto) {
    // First verify user has access
    await this.getTicketById(ticketId, glpiUserId);

    const payload = {
      ...(updateData.title && { name: updateData.title }),
      ...(updateData.content && { content: updateData.content }),
      ...(updateData.urgency && { urgency: updateData.urgency }),
      ...(updateData.impact && { impact: updateData.impact }),
      ...(updateData.priority && { priority: updateData.priority }),
      ...(updateData.status && { status: updateData.status }),
    };

    const res = await firstValueFrom(
      this.http.put(`${this.cfg.get('GLPI_URL')}/Ticket/${ticketId}`, payload, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Delete ticket (with access validation)
  async deleteTicket(ticketId: number, glpiUserId: number) {
    // First verify user has access
    await this.getTicketById(ticketId, glpiUserId);

    const res = await firstValueFrom(
      this.http.delete(`${this.cfg.get('GLPI_URL')}/Ticket/${ticketId}`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // ==================== GROUP METHODS ====================

  // Get user's groups using GLPI relationship endpoint
  async getUserGroups(glpiUserId: number) {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/User/${glpiUserId}/Group_User`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Get tickets for a specific group using GLPI relationship endpoint
  async getGroupTickets(groupId: number, options: SearchOptions = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const params = {
      range: `${offset}-${offset + limit - 1}`,
    };

    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/Group/${groupId}/Ticket_Group`, {
        headers: await this.auth.headers(),
        params,
      }),
    );
    return res.data;
  }

  // Get group details by ID
  async getGroupById(groupId: number) {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/Group/${groupId}`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Get group users
  async getGroupUsers(groupId: number) {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/Group/${groupId}/Group_User`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // ==================== PROFILE METHODS ====================

  // Get user's profiles using GLPI relationship endpoint
  async getUserProfiles(glpiUserId: number) {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/User/${glpiUserId}/Profile_User`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Get profile details by ID
  async getProfileById(profileId: number) {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/Profile/${profileId}`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // ==================== DASHBOARD & STATISTICS ====================

  // Get user ticket statistics
  async getUserTicketStats(glpiUserId: number) {
    const [requested, assigned] = await Promise.all([
      this.getUserRequestedTickets(glpiUserId, { limit: 1000 }),
      this.getUserAssignedTickets(glpiUserId, { limit: 1000 }),
    ]);

    const requestedTickets = requested?.data || [];
    const assignedTickets = assigned?.data || [];

    // Calculate stats
    const stats = {
      totalRequested: requestedTickets.length,
      totalAssigned: assignedTickets.length,
      requestedByStatus: this.groupTicketsByStatus(requestedTickets),
      assignedByStatus: this.groupTicketsByStatus(assignedTickets),
      recentRequested: requestedTickets.slice(0, 5),
      recentAssigned: assignedTickets.slice(0, 5),
    };

    return stats;
  }

  // Get user's recent activity (last 10 tickets)
  async getUserRecentActivity(glpiUserId: number) {
    const tickets = await this.getUserTickets(glpiUserId, { limit: 10 });
    return {
      recentTickets: tickets.data || [],
      count: tickets.totalcount || 0,
    };
  }

  // ==================== UTILITY METHODS ====================

  // Get GLPI item types and their search options
  async getTicketSearchOptions() {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/listSearchOptions/Ticket`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Get ticket statuses
  async getTicketStatuses() {
    // GLPI default statuses: 1=New, 2=Processing, 3=Pending, 4=Solved, 5=Closed, 6=Cancelled
    return [
      { id: 1, name: 'New' },
      { id: 2, name: 'Processing (assigned)' },
      { id: 3, name: 'Processing (planned)' },
      { id: 4, name: 'Pending' },
      { id: 5, name: 'Solved' },
      { id: 6, name: 'Closed' },
    ];
  }

  // Get ticket priorities/urgencies
  async getTicketPriorities() {
    return [
      { id: 1, name: 'Very Low' },
      { id: 2, name: 'Low' },
      { id: 3, name: 'Medium' },
      { id: 4, name: 'High' },
      { id: 5, name: 'Very High' },
      { id: 6, name: 'Major' },
    ];
  }

  private groupTicketsByStatus(tickets: any[]) {
    const grouped = tickets.reduce((acc, ticket) => {
      const status = ticket['2']; // Status field
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return grouped;
  }

  // ==================== SEARCH METHODS ====================

  // Generic search method for any GLPI item type
  async searchItems(itemType: string, criteria: any[] = [], forceDisplay: number[] = [], options: SearchOptions = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const params = new URLSearchParams();
    
    // Add criteria
    criteria.forEach((criterion, index) => {
      params.append(`criteria[${index}][field]`, criterion.field.toString());
      params.append(`criteria[${index}][searchtype]`, criterion.searchtype);
      params.append(`criteria[${index}][value]`, criterion.value.toString());
    });
    
    // Add force display fields
    forceDisplay.forEach((field, index) => {
      params.append(`forcedisplay[${index}]`, field.toString());
    });
    
    // Add pagination
    params.append('range', `${offset}-${offset + limit - 1}`);

    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/search/${itemType}?${params.toString()}`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Search tickets with criteria
  async searchTickets(criteria: any[] = [], forceDisplay: number[] = [2, 1, 12, 15], options: SearchOptions = {}) {
    return this.searchItems('Ticket', criteria, forceDisplay, options);
  }

  // Search users with criteria  
  async searchUsers(criteria: any[] = [], forceDisplay: number[] = [2, 1, 5, 8], options: SearchOptions = {}) {
    return this.searchItems('User', criteria, forceDisplay, options);
  }

  // Search groups with criteria
  async searchGroups(criteria: any[] = [], forceDisplay: number[] = [2, 1, 16], options: SearchOptions = {}) {
    return this.searchItems('Group', criteria, forceDisplay, options);
  }

  // Search profiles with criteria
  async searchProfiles(criteria: any[] = [], forceDisplay: number[] = [2, 1, 19], options: SearchOptions = {}) {
    return this.searchItems('Profile', criteria, forceDisplay, options);
  }

  // ==================== CATEGORY METHODS ====================

  // Get all ITIL categories (including main categories and sub-categories)
  async getAllCategories() {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/ITILCategory`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Get specific category by ID
  async getCategoryById(categoryId: number) {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/ITILCategory/${categoryId}`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }

  // Get only main categories (level 1, itilcategories_id = 0)
  async getMainCategories() {
    const allCategories = await this.getAllCategories();
    return allCategories.filter((category: any) => 
      category.itilcategories_id === 0 || category.itilcategories_id === '0'
    );
  }

  // Get only sub-categories (level > 1, itilcategories_id != 0)
  async getSubCategories() {
    const allCategories = await this.getAllCategories();
    return allCategories.filter((category: any) => 
      category.itilcategories_id !== 0 && category.itilcategories_id !== '0'
    );
  }

  // Get sub-categories for a specific parent category
  async getSubCategoriesByParent(parentCategoryId: number) {
    const allCategories = await this.getAllCategories();
    return allCategories.filter((category: any) => 
      parseInt(category.itilcategories_id) === parentCategoryId
    );
  }

  // Get category with its sub-categories
  async getCategoryWithSubCategories(categoryId: number) {
    const [category, subCategories] = await Promise.all([
      this.getCategoryById(categoryId),
      this.getSubCategoriesByParent(categoryId),
    ]);

    return {
      category,
      subCategories,
      hasSubCategories: subCategories.length > 0,
      subCategoryCount: subCategories.length,
    };
  }

  // Get category hierarchy (organized by parent-child structure)
  async getCategoryHierarchy() {
    const allCategories = await this.getAllCategories();
    
    const mainCategories = allCategories.filter((category: any) => 
      category.itilcategories_id === 0 || category.itilcategories_id === '0'
    );

    const hierarchy = mainCategories.map((mainCategory: any) => {
      const subCategories = allCategories.filter((category: any) => 
        parseInt(category.itilcategories_id) === mainCategory.id
      );
      
      return {
        ...mainCategory,
        subCategories,
        hasSubCategories: subCategories.length > 0,
        subCategoryCount: subCategories.length,
      };
    });

    return hierarchy;
  }
}
