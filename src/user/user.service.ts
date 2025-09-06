import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/search-user.dto';

type SyncUserInput = Omit<
  Prisma.UserUncheckedCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'glpiId'
>;

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // unique email
    
    // unique glpiId (if provided)
    if (createUserDto.glpiId) {
      const existingUserByGlpiId = await this.userRepository.findByGlpiId(createUserDto.glpiId);
      if (existingUserByGlpiId) {
        throw new ConflictException('User with this GLPI ID already exists');
      }
    }
    return this.userRepository.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

 

  async findByGlpiId(glpiId: string): Promise<User> {
    const user = await this.userRepository.findByGlpiId(glpiId);
    if (!user) throw new NotFoundException(`User with GLPI ID ${glpiId} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // ensure exists
    await this.findById(id);
 

    // glpiId conflict
    if (updateUserDto.glpiId) {
      const existingUserByGlpiId = await this.userRepository.findByGlpiId(updateUserDto.glpiId);
      if (existingUserByGlpiId && existingUserByGlpiId.id !== id) {
        throw new ConflictException('User with this GLPI ID already exists');
      }
    }

    const updated = await this.userRepository.update(id, updateUserDto);
    if (!updated) throw new NotFoundException(`User with ID ${id} not found`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const success = await this.userRepository.delete(id);
    if (!success) throw new NotFoundException(`User with ID ${id} not found`);
  }

  async softDelete(id: number): Promise<User> {
    const user = await this.userRepository.softDelete(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async searchByCriteria(
    searchDto: UserSearchDto,
  ): Promise<{ users: User[]; total: number }> {
    return this.userRepository.searchByCriteria(searchDto);
  }

  /** For GLPI sync: create if missing, else update (by glpiId) */
 async upsertByGlpi(glpiId: string, data: SyncUserInput): Promise<User> {
    return this.userRepository.upsertByGlpiId(glpiId, data);
  }

async bulkUpsertByGlpi(
    items: Array<{ glpiId: string; data: SyncUserInput }>,
  ): Promise<User[]> {
    return this.userRepository.bulkUpsertByGlpi(items);
  }
}
