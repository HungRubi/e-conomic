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
