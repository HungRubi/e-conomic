import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
    }
  }

  async connect() {
    if (!this.isConnected) {
      try {
        await this.$connect();
        this.isConnected = true;
        this.logger.log('Connected to database');
      } catch (error) {
        this.logger.warn(
          `Database not available — ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        this.logger.warn('Set DATABASE_URL in .env');
      }
    }
    return this;
  }
}
