import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly config;
    private readonly refreshTokenSecret;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    me(userId: string): Promise<{
        email: string;
        name: string;
        id: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        email: string;
        name: string;
        id: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    refresh(refreshToken: string): Promise<{
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
        token?: undefined;
    } | {
        message: string;
        token: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private generateTokens;
    private buildAuthResponse;
}
