import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  id_phase: number;

  //ids de los teams
  @ApiProperty()
  @IsArray()
  id_team: number[];
}
