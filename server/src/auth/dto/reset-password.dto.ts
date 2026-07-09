import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  @IsString()
  @MinLength(1)
  token: string;

  @ApiProperty({ example: 'NewPassword456!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)',
  })
  password: string;
}
