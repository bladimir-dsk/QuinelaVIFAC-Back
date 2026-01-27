import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserPredictionDto {
  @IsNumber()
  @ApiProperty()
  id_match: number;
  @IsNumber()
  @ApiProperty()
  id_team: number;
}
