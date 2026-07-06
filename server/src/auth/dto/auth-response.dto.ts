import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'customer' })
  role: string;

  @ApiProperty({ example: '2026-07-06T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-06T10:00:00.000Z' })
  updatedAt: Date;
}

export class AuthResponse {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}

export class TokenPayload {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  sub: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 1720000000 })
  iat: number;

  @ApiProperty({ example: 1720604800 })
  exp: number;
}
