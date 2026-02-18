import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsDateString, IsNumber } from 'class-validator';

export class CreateMatchDto {
  @IsNumber()
  @ApiProperty()
  id_phase: number;

  @IsNumber()
  @ApiProperty()
  id_group?: number;

  @IsNumber()
  @ApiProperty()
  id_teamA: number;

  @IsNumber()
  @ApiProperty()
  id_teamB: number;

  @IsDateString()
  @ApiProperty()
  matchDate: Date;
}
