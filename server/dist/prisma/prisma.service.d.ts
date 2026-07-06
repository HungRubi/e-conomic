import { OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleDestroy {
    private readonly logger;
    private isConnected;
    onModuleDestroy(): Promise<void>;
    connect(): Promise<this>;
}
