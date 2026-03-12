import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  displayName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
