# Entity Management Guide: Step-by-Step NestJS Entity Creation

This guide provides a comprehensive, reusable process for creating new entities in our NestJS application following the established patterns from the User and Ticket modules.

## 🎯 Overview

This guide was created during the complete rebuild of the Ticket module, transforming it from a complex structure with numerous enums and relationships into a simple, maintainable entity following NestJS best practices.

## 📋 Prerequisites

- NestJS application setup with Prisma ORM
- PostgreSQL database configured
- Jest testing framework configured
- NestJS CLI installed globally

## 🚀 Step-by-Step Process

### Step 1: Planning Your Entity

**Before you start coding:**
1. **Define the entity purpose** - What business problem does it solve?
2. **List required attributes** - Keep it simple (id, name/title, description, timestamps, audit fields)
3. **Identify relationships** - Minimize complexity, add relationships later if needed
4. **Review existing patterns** - Look at User/Ticket modules for consistency

**Example Planning:**
```
Entity: Product
Purpose: Track inventory items
Attributes: 
  - id (auto-increment)
  - name (required)
  - description (optional)
  - price (required)
  - createdAt/updatedAt (auto)
  - createdBy/updatedBy (audit)
Relationships: None initially
```

### Step 2: Remove Existing Complex Module (if applicable)

**⚠️ IMPORTANT: Backup your database first!**

```bash
# 1. Stop the development server
pkill -f "nest start"

# 2. Remove the existing module directory
rm -rf src/your-entity

# 3. Clean build directories to avoid conflicts
rm -rf build dist
```

### Step 3: Generate Fresh Module Structure

```bash
# Generate new NestJS resource (without spec files)
npx nest generate resource your-entity --no-spec

# This creates:
# - src/your-entity/your-entity.controller.ts
# - src/your-entity/your-entity.module.ts
# - src/your-entity/your-entity.service.ts
# - src/your-entity/dto/create-your-entity.dto.ts
# - src/your-entity/dto/update-your-entity.dto.ts
# - src/your-entity/entities/your-entity.entity.ts
# - Updates src/app.module.ts
```

### Step 4: Create Simple Prisma Schema

**Follow the User/Ticket pattern for consistency:**

```prisma
// In prisma/schema.prisma
model YourEntity {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(255)        // or title for tickets
  description String?  @db.Text                // Optional longer text
  price       Decimal? @db.Decimal(10, 2)      // Example additional field
  createdAt   DateTime @default(now()) @map("created_at")
  createdBy   String?  @map("created_by") @db.VarChar(255)
  updatedAt   DateTime @updatedAt @map("updated_at")
  updatedBy   String?  @map("updated_by") @db.VarChar(255)

  @@map("your_entities")
}
```

**Key Patterns:**
- Always include id, createdAt, updatedAt, createdBy, updatedBy
- Use snake_case for database column names with @map
- Use camelCase for Prisma field names
- Keep descriptions optional
- Use appropriate data types (@db.VarChar, @db.Text, @db.Decimal)

### Step 5: Generate and Run Database Migration

```bash
# Generate migration
npx prisma migrate dev --name "create-simple-your-entity-model"

# This will:
# 1. Create migration files in prisma/migrations/
# 2. Apply changes to database
# 3. Generate updated Prisma client
```

**Verify migration success:**
- Check migration file for correct SQL
- Ensure no data loss warnings
- Confirm Prisma client regeneration

### Step 6: Create DTOs Following Patterns

**Create DTO (`src/your-entity/dto/create-your-entity.dto.ts`):**
```typescript
export class CreateYourEntityDto {
	name: string;                    // Required field
	description?: string;            // Optional field
	price?: number;                  // Additional field
	createdBy?: string;             // Audit field
	updatedBy?: string;             // Audit field
}
```

**Update DTO (`src/your-entity/dto/update-your-entity.dto.ts`):**
```typescript
export class UpdateYourEntityDto {
	name?: string;
	description?: string;
	price?: number;
	updatedBy?: string;             // Always include for audit
}
```

**Search DTO (`src/your-entity/dto/search-your-entity.dto.ts`):**
```typescript
export class YourEntitySearchDto {
	name?: string;
	description?: string;
	searchType?: 'contains' | 'exact' = 'contains';
	sortBy?: 'id' | 'name' | 'createdAt' | 'updatedAt' = 'createdAt';
	sortOrder?: 'ASC' | 'DESC' = 'DESC';
	limit?: number = 10;
	offset?: number = 0;
}
```

### Step 7: Implement Repository Layer

**Create repository (`src/your-entity/your-entity.repository.ts`):**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { YourEntity } from '@prisma/client';
import { CreateYourEntityDto } from './dto/create-your-entity.dto';
import { UpdateYourEntityDto } from './dto/update-your-entity.dto';
import { YourEntitySearchDto } from './dto/search-your-entity.dto';

@Injectable()
export class YourEntityRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(createDto: CreateYourEntityDto): Promise<YourEntity> {
		return await this.prisma.yourEntity.create({
			data: createDto,
		});
	}

	async findAll(): Promise<YourEntity[]> {
		return await this.prisma.yourEntity.findMany();
	}

	async findById(id: number): Promise<YourEntity | null> {
		return await this.prisma.yourEntity.findUnique({
			where: { id },
		});
	}

	async update(id: number, updateDto: UpdateYourEntityDto): Promise<YourEntity | null> {
		try {
			return await this.prisma.yourEntity.update({
				where: { id },
				data: updateDto,
			});
		} catch (error) {
			return null;
		}
	}

	async delete(id: number): Promise<boolean> {
		try {
			await this.prisma.yourEntity.delete({
				where: { id },
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	async searchByCriteria(
		searchDto: YourEntitySearchDto,
	): Promise<{ yourEntities: YourEntity[]; total: number }> {
		// Build where clause
		const where: any = {};

		// Apply search filters
		if (searchDto.name) {
			if (searchDto.searchType === 'exact') {
				where.name = searchDto.name;
			} else {
				where.name = {
					contains: searchDto.name,
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

		// Build order by
		const orderBy: any = {};
		const sortBy = searchDto.sortBy || 'createdAt';
		const sortOrder = (searchDto.sortOrder || 'DESC').toLowerCase();
		orderBy[sortBy] = sortOrder;

		// Apply pagination
		const limit = searchDto.limit || 10;
		const offset = searchDto.offset || 0;

		// Execute queries
		const [yourEntities, total] = await Promise.all([
			this.prisma.yourEntity.findMany({
				where,
				orderBy,
				take: limit,
				skip: offset,
			}),
			this.prisma.yourEntity.count({ where }),
		]);

		return { yourEntities, total };
	}
}
```

### Step 8: Implement Service Layer

**Update service (`src/your-entity/your-entity.service.ts`):**

```typescript
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { YourEntityRepository } from './your-entity.repository';
import { YourEntity } from '@prisma/client';
import { CreateYourEntityDto } from './dto/create-your-entity.dto';
import { UpdateYourEntityDto } from './dto/update-your-entity.dto';
import { YourEntitySearchDto } from './dto/search-your-entity.dto';

@Injectable()
export class YourEntityService {
  constructor(private readonly yourEntityRepository: YourEntityRepository) {}

  async create(createDto: CreateYourEntityDto): Promise<YourEntity> {
    return await this.yourEntityRepository.create(createDto);
  }

  async findAll(): Promise<YourEntity[]> {
    return await this.yourEntityRepository.findAll();
  }

  async findById(id: number): Promise<YourEntity> {
    const entity = await this.yourEntityRepository.findById(id);
    if (!entity) {
      throw new NotFoundException(\`YourEntity with ID \${id} not found\`);
    }
    return entity;
  }

  async update(id: number, updateDto: UpdateYourEntityDto): Promise<YourEntity> {
    // Check if entity exists
    await this.findById(id);

    const updatedEntity = await this.yourEntityRepository.update(id, updateDto);
    if (!updatedEntity) {
      throw new NotFoundException(\`YourEntity with ID \${id} not found\`);
    }
    return updatedEntity;
  }

  async delete(id: number): Promise<void> {
    const success = await this.yourEntityRepository.delete(id);
    if (!success) {
      throw new NotFoundException(\`YourEntity with ID \${id} not found\`);
    }
  }

  async searchByCriteria(
    searchDto: YourEntitySearchDto,
  ): Promise<{ yourEntities: YourEntity[]; total: number }> {
    return await this.yourEntityRepository.searchByCriteria(searchDto);
  }
}
```

### Step 9: Implement Controller Layer

**Update controller (`src/your-entity/your-entity.controller.ts`):**

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateYourEntityDto } from './dto/create-your-entity.dto';
import { UpdateYourEntityDto } from './dto/update-your-entity.dto';
import { YourEntitySearchDto } from './dto/search-your-entity.dto';
import { YourEntity } from '@prisma/client';
import { YourEntityService } from './your-entity.service';

@Controller('your-entities')
export class YourEntityController {
  constructor(private readonly yourEntityService: YourEntityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateYourEntityDto): Promise<YourEntity> {
    return await this.yourEntityService.create(createDto);
  }

  @Get()
  async findAll(): Promise<YourEntity[]> {
    return await this.yourEntityService.findAll();
  }

  @Get('search')
  async searchByCriteria(
    @Query() searchDto: YourEntitySearchDto,
  ): Promise<{ yourEntities: YourEntity[]; total: number }> {
    return await this.yourEntityService.searchByCriteria(searchDto);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<YourEntity> {
    return await this.yourEntityService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateYourEntityDto,
  ): Promise<YourEntity> {
    return await this.yourEntityService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.yourEntityService.delete(id);
  }
}
```

### Step 10: Update Module Configuration

**Update module (`src/your-entity/your-entity.module.ts`):**

```typescript
import { Module } from '@nestjs/common';
import { YourEntityController } from './your-entity.controller';
import { YourEntityService } from './your-entity.service';
import { YourEntityRepository } from './your-entity.repository';
import { PrismaService } from '../core/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [YourEntityController],
  providers: [YourEntityService, YourEntityRepository, PrismaService],
  exports: [YourEntityService, YourEntityRepository],
})
export class YourEntityModule {}
```

### Step 11: Create Comprehensive Tests

**Service Test (`src/your-entity/your-entity.service.spec.ts`):**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { YourEntityService } from './your-entity.service';
import { YourEntityRepository } from './your-entity.repository';
// ... (Complete test implementation following ticket.service.spec.ts pattern)
```

**Repository Test (`src/your-entity/your-entity.repository.spec.ts`):**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourEntityRepository } from './your-entity.repository';
import { PrismaService } from '../core/prisma/prisma.service';
// ... (Complete test implementation following ticket.repository.spec.ts pattern)
```

**Controller Test (`src/your-entity/your-entity.controller.spec.ts`):**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourEntityController } from './your-entity.controller';
import { YourEntityService } from './your-entity.service';
// ... (Complete test implementation following ticket.controller.spec.ts pattern)
```

### Step 12: Test Your Implementation

```bash
# 1. Run unit tests
npm test -- --testPathPatterns your-entity

# 2. Start the development server
npm run start:dev

# 3. Test API endpoints
curl -X POST http://localhost:3001/your-entities \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Entity", "description": "Test Description", "createdBy": "admin"}'

curl -X GET http://localhost:3001/your-entities

curl -X GET http://localhost:3001/your-entities/1

curl -X GET "http://localhost:3001/your-entities/search?name=Test&searchType=contains"
```

### Step 13: Performance Optimization (Optional)

**Add database indexes for performance:**

```prisma
model YourEntity {
  // ... fields ...

  // Add indexes for frequently queried fields
  @@index([createdAt])
  @@index([name])
  @@map("your_entities")
}
```

```bash
# Generate migration for indexes
npx prisma migrate dev --name "add-your-entity-indexes"
```

## 🎯 API Endpoints Generated

Your entity will have these RESTful endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/your-entities` | Create new entity |
| GET | `/your-entities` | Get all entities |
| GET | `/your-entities/search` | Search entities with filters |
| GET | `/your-entities/:id` | Get entity by ID |
| PUT | `/your-entities/:id` | Update entity |
| DELETE | `/your-entities/:id` | Delete entity |

## 🧪 Testing Strategy

Each entity should have:
- **Unit Tests**: Service, Repository, Controller (31 tests for Ticket module)
- **Integration Tests**: End-to-end API testing
- **Edge Cases**: Error handling, validation, not found scenarios

## 📝 Best Practices Summary

1. **Keep It Simple**: Start with basic attributes, add complexity later
2. **Follow Patterns**: Use User/Ticket modules as templates
3. **Consistent Naming**: Use clear, descriptive names across all layers
4. **Error Handling**: Always throw appropriate NestJS exceptions
5. **Validation**: Use DTOs for input validation
6. **Testing**: Write comprehensive tests before deployment
7. **Database Design**: Use proper indexes, constraints, and data types
8. **Audit Fields**: Always include createdAt, updatedAt, createdBy, updatedBy
9. **Documentation**: Update this guide when patterns evolve

## 🔄 Future Enhancements

When you need to add complexity:
1. **Relationships**: Add foreign keys and Prisma relations
2. **Validation**: Add class-validator decorators to DTOs
3. **Authentication**: Add guards and user context
4. **Caching**: Implement Redis caching for frequently accessed data
5. **Events**: Add event handling for entity lifecycle

## 📊 Success Metrics

A successful entity implementation should have:
- ✅ 100% test coverage on critical paths
- ✅ All CRUD operations working
- ✅ Search functionality with pagination
- ✅ Proper error handling
- ✅ Clean, maintainable code structure
- ✅ Following established patterns

## 🐛 Common Pitfalls to Avoid

1. **Over-engineering**: Don't add complexity upfront
2. **Inconsistent Patterns**: Always follow the established structure
3. **Missing Tests**: Write tests as you develop, not after
4. **Poor Error Messages**: Use descriptive error messages
5. **Ignoring Performance**: Consider database indexes from the start
6. **Breaking Changes**: Be careful with migrations in production

---

This guide was created during the successful rebuild of the Ticket module from a complex 89-line schema with multiple enums to a simple 8-field entity, demonstrating the power of keeping things simple and following established patterns.

**Happy coding! 🚀**