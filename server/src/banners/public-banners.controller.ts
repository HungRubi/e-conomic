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
