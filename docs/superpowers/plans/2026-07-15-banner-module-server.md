# Banner Module — Server Implementation Plan (Round 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build complete Banner server — Prisma model, migration, CRUD API, public endpoints, file upload, seed data.

**Architecture:** New `BannerModule` following the existing CatalogModule pattern (NestJS controller + service + Prisma). Public endpoints for client, admin endpoints for dashboard. multer for file upload, @nestjs/serve-static for serving uploads.

**Tech Stack:** NestJS 11, Prisma 5, PostgreSQL, multer 2.x, @nestjs/serve-static

---

### File Structure

**Create:**
- `server/prisma/schema.prisma` — add Banner model + BannerType enum
- `server/src/banners/banners.module.ts`
- `server/src/banners/banners.service.ts`
- `server/src/banners/banners.controller.ts`
- `server/src/banners/public-banners.controller.ts`
- `server/src/banners/dto/create-banner.dto.ts`
- `server/src/banners/dto/update-banner.dto.ts`

**Modify:**
- `server/src/app.module.ts` — import BannerModule + ServeStaticModule
- `server/prisma/seed.ts` — add banner seed data

**Create directories:**
- `server/uploads/banners/`

---

### Task 1: Prisma schema — add Banner model + BannerType enum

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Add BannerType enum and Banner model before the closing `}` of schema**

Add after the `ProductCategoryMap` model:

```prisma
enum BannerType {
  HERO
  BANNER
}

model Banner {
  id        String     @id @default(uuid())
  imageUrl  String
  linkUrl   String?
  altText   String?
  type      BannerType @default(BANNER)
  sortOrder Int        @default(0)
  active    Boolean    @default(true)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@map("banners")
}
```

- [ ] **Run migration**

```bash
cd server
npx prisma migrate dev --name add_banners --skip-seed
```

Expected: `Your migration has been created and applied to the database.`

- [ ] **Regenerate Prisma client**

```bash
npx prisma generate
```

Expected: `Prisma Client generated`

---

### Task 2: Install dependencies

**Files:**
- Modify: `server/package.json`

- [ ] **Install multer + types + serve-static**

```bash
cd server
pnpm add multer @nestjs/serve-static
pnpm add -D @types/multer
```

---

### Task 3: Create DTOs

**Files:**
- Create: `server/src/banners/dto/create-banner.dto.ts`
- Create: `server/src/banners/dto/update-banner.dto.ts`

- [ ] **Create create-banner.dto.ts**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ description: 'URL của ảnh banner' })
  @IsString()
  imageUrl!: string;

  @ApiPropertyOptional({ description: 'Link khi click vào banner' })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Alt text cho SEO' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiProperty({ enum: BannerType, default: 'BANNER' })
  @IsEnum(BannerType)
  type!: BannerType;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
```

- [ ] **Create update-banner.dto.ts**

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateBannerDto } from './create-banner.dto';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
```

---

### Task 4: Create BannersService

**Files:**
- Create: `server/src/banners/banners.service.ts`

- [ ] **Create banners.service.ts**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: { type?: string } = {}) {
    const where: Prisma.BannerWhereInput = {};
    if (query.type) where.type = query.type as any;
    return this.prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async listPublic(type?: string) {
    const where: Prisma.BannerWhereInput = { active: true };
    if (type) where.type = type as any;
    return this.prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getById(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto });
  }

  async update(id: string, dto: UpdateBannerDto) {
    await this.getById(id);
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.getById(id);
    return this.prisma.banner.delete({ where: { id } });
  }
}
```

- [ ] **Create barrel export `dto/index.ts`**

```typescript
// server/src/banners/dto/index.ts
export { CreateBannerDto } from './create-banner.dto';
export { UpdateBannerDto } from './update-banner.dto';
```

---

### Task 5: Create BannersController (admin CRUD + upload)

**Files:**
- Create: `server/src/banners/banners.controller.ts`

- [ ] **Create banners.controller.ts**

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuid } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto } from './dto';

@ApiTags('Admin Banners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/banners')
export class BannersController {
  constructor(private readonly banners: BannersService) {}

  @Get()
  list(@Query() query: any) {
    return this.banners.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.banners.getById(id);
  }

  @Post()
  create(@Body() dto: CreateBannerDto) {
    return this.banners.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.banners.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.banners.delete(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'banners'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `banner-${uuid()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return { url: `/uploads/banners/${file.filename}` };
  }
}
```

**Note:** Import `BadRequestException` from `@nestjs/common` at top.

---

### Task 6: Create PublicBannersController

**Files:**
- Create: `server/src/banners/public-banners.controller.ts`

- [ ] **Create public-banners.controller.ts**

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';

@ApiTags('Banners')
@Controller('banners')
export class PublicBannersController {
  constructor(private readonly banners: BannersService) {}

  @Get()
  list(@Query('type') type?: string) {
    return this.banners.listPublic(type);
  }
}
```

---

### Task 7: Create BannerModule + register in AppModule

**Files:**
- Create: `server/src/banners/banners.module.ts`
- Modify: `server/src/app.module.ts`

- [ ] **Create banners.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { PublicBannersController } from './public-banners.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BannersController, PublicBannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannerModule {}
```

- [ ] **Update app.module.ts to import BannerModule and configure ServeStaticModule**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogModule } from './catalog/catalog.module';
import { BannerModule } from './banners/banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CatalogModule,
    BannerModule,
  ],
})
export class AppModule {}
```

---

### Task 8: Create seed data — 5 banners

**Files:**
- Modify: `server/prisma/seed.ts`

- [ ] **Add banner seeding at the end of the seed file, before `main()` call**

Add this function before `async function main()`:

```typescript
// ──────────────────────────────────────────────
// BANNERS — 5 banners
// ──────────────────────────────────────────────

async function seedBanners() {
  console.log('  Creating banners...');

  await prisma.banner.createMany({
    data: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=640&fit=crop',
        linkUrl: '/thoi-trang',
        altText: 'Bộ sưu tập thời trang nam cao cấp — Thu Đông 2026',
        type: 'HERO',
        sortOrder: 0,
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=640&fit=crop',
        linkUrl: '/trang-suc',
        altText: 'Trang sức & phụ kiện cao cấp — Tỏa sáng mọi khoảnh khắc',
        type: 'HERO',
        sortOrder: 1,
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=240&fit=crop',
        linkUrl: '/?sort=rating',
        altText: 'Miễn phí vận chuyển cho đơn hàng trên 500K',
        type: 'BANNER',
        sortOrder: 0,
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1553729459-afe8f2e2a7bd?w=1200&h=240&fit=crop',
        linkUrl: '/?sort=newest',
        altText: 'Sale mùa hè — Giảm đến 40% cho hàng ngàn sản phẩm',
        type: 'BANNER',
        sortOrder: 1,
        active: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=240&fit=crop',
        linkUrl: '/thoi-trang',
        altText: 'Bộ sưu tập Thu Đông 2026 — Thời thượng và đẳng cấp',
        type: 'BANNER',
        sortOrder: 2,
        active: true,
      },
    ],
  });
}
```

Then add the call inside `main()`, after clearing existing data and before category creation:

Wait — better to add banner clearing + seeding in the existing seed flow. At the top of `main()`, add banner clearing alongside existing clears:

After line `await prisma.productCategory.deleteMany();` add:
```
await prisma.banner.deleteMany();
```

And after the product creation section, add:
```
await seedBanners();
```

And add the `seedBanners` function at the bottom of the file (before `slugify`).

- [ ] **Update the seed flow in `main()`**

In the clearing section, add `await prisma.banner.deleteMany();` after line 314.

In the after-products section (around line 405), add `await seedBanners();`

Update the summary to include banner count.

---

### Task 9: Create uploads directory + configure Express static serving

- [ ] **Create uploads directory**

```bash
mkdir -p server/uploads/banners
```

Create a `.gitkeep` in `server/uploads/banners/` to track the directory:

```bash
touch server/uploads/banners/.gitkeep
```

Also add `uploads/` to `.gitignore` if not already there (check first).

---

### Task 10: Verify build & seed

- [ ] **Build to check compilation**

```bash
cd server
pnpm build
```

Expected: no errors

- [ ] **Run seed**

```bash
pnpm prisma:seed
```

Expected: `✅ Seed complete!` with banner count printed

- [ ] **Quick test — start server and hit endpoints**

```bash
pnpm dev
```

In another terminal:
```bash
curl http://localhost:4000/api/banners
curl http://localhost:4000/api/banners?type=HERO
```

Expected: returns 2 HERO + 3 BANNER banner objects
