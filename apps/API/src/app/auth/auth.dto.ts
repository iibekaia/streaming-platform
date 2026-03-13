import { IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export class LoginDto {
  @IsString()
  @MinLength(2)
  identifier!: string;

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
  @Matches(strongPasswordPattern, {
    message: 'Password must include upper, lower, number, and special character.',
  })
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @Matches(strongPasswordPattern, {
    message: 'New password must include upper, lower, number, and special character.',
  })
  nextPassword!: string;
}
