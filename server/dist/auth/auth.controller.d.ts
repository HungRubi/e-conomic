import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(dto: RefreshTokenDto): Promise<{
        token: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
}
