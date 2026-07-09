import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly refreshTokenSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.refreshTokenSecret =
      this.config.get<string>('JWT_SECRET') + '-refresh';
  }

  // ── Register ──────────────────────────────────────────────
  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException(
        'Passwords do not match',
      );
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(dto.password)) {
      throw new BadRequestException(
        'Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashed, name: dto.name },
    });

    return this.buildAuthResponse(user);
  }

  // ── Login ─────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  // ── Me ────────────────────────────────────────────────────
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  // ── Update profile ────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ── Change password ───────────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Password changed successfully' };
  }

  // ── Refresh token ─────────────────────────────────────────
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshTokenSecret,
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException('User not found');
      return this.buildAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ── Forgot password ────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    // Always return success to prevent email enumeration
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) return { message: 'If the email exists, a reset link has been sent.' };

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'reset' },
      { expiresIn: '30m' },
    );
    const resetTokenExp = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    // In production, send email here. For dev, return token in response.
    return { message: 'If the email exists, a reset link has been sent.', token: resetToken };
  }

  // ── Reset password ─────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { resetToken: dto.token },
    });
    if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  // ── Helpers ───────────────────────────────────────────────
  private generateTokens(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };

    const token = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: '30d',
    });

    return { token, refreshToken };
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }) {
    const tokens = this.generateTokens(user);
    return {
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
