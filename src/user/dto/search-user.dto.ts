export class UserSearchDto {
	name?: string;
	email?: string;
	phone?: string;
	glpiId?: string;
	isActive?: boolean;

	// Search options
	limit?: number = 10;
	offset?: number = 0;
	sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt' = 'createdAt';
	sortOrder?: 'ASC' | 'DESC' = 'DESC';

	// Search type (exact match or partial)
	searchType?: 'exact' | 'partial' = 'partial';
}
