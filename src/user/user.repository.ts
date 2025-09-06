import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/search-user.dto';
type SyncUserInput = Omit<
  Prisma.UserUncheckedCreateInput,
  'id' | 'glpiId' | 'createdAt' | 'updatedAt'
>;
@Injectable()
export class UserRepository {
	
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data: createUserDto });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

   
  async findByGlpiId(glpiId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { glpiId } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch {
      return null;
    }
  }

  async updateByGlpiId(glpiId: string, data: UpdateUserDto): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: { glpiId },
        data,
      });
    } catch {
      return null;
    }
  }

  /** Upsert for sync jobs (create if missing, else update) */
   async upsertByGlpiId(glpiId: string, data: SyncUserInput): Promise<User> {
    return this.prisma.user.upsert({
      where: { glpiId },
      // update expects UpdateInput; we cast because our data is valid scalars
      update: data as Prisma.UserUncheckedUpdateInput,
      // create must NOT receive id/createdAt/updatedAt; we add glpiId here
      create: { ...data, glpiId } as Prisma.UserUncheckedCreateInput,
    });
  }

  /** Optional: bulk upsert inside a single transaction */
async bulkUpsertByGlpi(items: Array<{ glpiId: string; data: SyncUserInput }>): Promise<User[]> {
    return this.prisma.$transaction(
      items.map(({ glpiId, data }) =>
        this.prisma.user.upsert({
          where: { glpiId },
          update: data as Prisma.UserUncheckedUpdateInput,
          create: { ...data, glpiId } as Prisma.UserUncheckedCreateInput,
        }),
      ),
    );
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async softDelete(id: number): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
    } catch {
      return null;
    }
  }

  async searchByCriteria(
    searchDto: UserSearchDto,
  ): Promise<{ users: User[]; total: number }> {
    const where: Prisma.UserWhereInput = {};

    // name
    if (searchDto.name) {
      where.name =
        searchDto.searchType === 'exact'
          ? searchDto.name
          : { contains: searchDto.name, mode: 'insensitive' };
    }
    // email
    if (searchDto.email) {
      where.email =
        searchDto.searchType === 'exact'
          ? searchDto.email
          : { contains: searchDto.email, mode: 'insensitive' };
    }
    // phone
    if (searchDto.phone) {
      where.phone =
        searchDto.searchType === 'exact'
          ? searchDto.phone
          : { contains: searchDto.phone };
    }
    // NEW filters (optional in DTO): phone2, mobile, realname, firstname, nickname
    if ((searchDto as any).phone2) {
      where.phone2 =
        searchDto.searchType === 'exact'
          ? (searchDto as any).phone2
          : { contains: (searchDto as any).phone2 };
    }
    if ((searchDto as any).mobile) {
      where.mobile =
        searchDto.searchType === 'exact'
          ? (searchDto as any).mobile
          : { contains: (searchDto as any).mobile };
    }
    if ((searchDto as any).realname) {
      where.realname =
        searchDto.searchType === 'exact'
          ? (searchDto as any).realname
          : { contains: (searchDto as any).realname, mode: 'insensitive' };
    }
    if ((searchDto as any).firstname) {
      where.firstname =
        searchDto.searchType === 'exact'
          ? (searchDto as any).firstname
          : { contains: (searchDto as any).firstname, mode: 'insensitive' };
    }
    if ((searchDto as any).nickname) {
      where.nickname =
        searchDto.searchType === 'exact'
          ? (searchDto as any).nickname
          : { contains: (searchDto as any).nickname, mode: 'insensitive' };
    }

    // glpiId
    if (searchDto.glpiId) {
      where.glpiId =
        searchDto.searchType === 'exact'
          ? searchDto.glpiId
          : { contains: searchDto.glpiId };
    }

    // isActive
    if (searchDto.isActive !== undefined) {
      where.isActive = searchDto.isActive;
    }

    // (Optional) dateSync range support: dateSyncFrom / dateSyncTo in DTO
    const dateSyncFrom = (searchDto as any).dateSyncFrom as string | undefined;
    const dateSyncTo = (searchDto as any).dateSyncTo as string | undefined;
    if (dateSyncFrom || dateSyncTo) {
      where.dateSync = {
        gte: dateSyncFrom ? new Date(dateSyncFrom) : undefined,
        lte: dateSyncTo ? new Date(dateSyncTo) : undefined,
      };
    }

    // order by
    const allowedSort = new Set<keyof User>([
      'createdAt',
      'updatedAt',
      'name',
      'email',
      'isActive',
      'dateSync',
    ]);
    const sortBy =
      (searchDto.sortBy as keyof User) && allowedSort.has(searchDto.sortBy as keyof User)
        ? (searchDto.sortBy as keyof User)
        : 'createdAt';
    const sortOrder = (searchDto.sortOrder || 'DESC').toLowerCase() as 'asc' | 'desc';
    const orderBy: Prisma.UserOrderByWithRelationInput = { [sortBy]: sortOrder };

    const limit = searchDto.limit || 10;
    const offset = searchDto.offset || 0;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, orderBy, take: limit, skip: offset }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }
}
