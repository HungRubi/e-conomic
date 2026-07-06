import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(1)
  oldPassword: string;

  @ApiProperty({ example: 'NewPassword456!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
