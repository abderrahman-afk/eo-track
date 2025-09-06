export class CreateUserDto {
	name: string;
	email: string;

	phone?: string;
	phone2?: string;
	mobile?: string;
	realname?: string;
	firstname?: string;
	picture?: string;
	nickname?: string;

	glpiId?: string;
	isActive?: boolean;
	dateSync?: string; // or handle as Date in service
}
