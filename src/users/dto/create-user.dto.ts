import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  password!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  displayName?: string;
}
