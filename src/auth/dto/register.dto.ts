import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
export class RegisterDto {
  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  //transform nos sirve para validar que no envien espacios en blanco
  @Transform(({ value }) => value.trim()) //el value.trim limpia los caracteres en blanco
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  @IsOptional()
  middleName?: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  @IsOptional()
  code?: string;

  @ApiProperty()
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  @IsOptional()
  phone?: string;
}
