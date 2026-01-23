import { IsNumber } from 'class-validator';

export class CreateUserPredictionDto {
  @IsNumber()
  id_match: number;
  @IsNumber()
  id_team: number;
}
