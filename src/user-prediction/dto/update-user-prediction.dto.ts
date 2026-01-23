import { PartialType } from '@nestjs/swagger';
import { CreateUserPredictionDto } from './create-user-prediction.dto';

export class UpdateUserPredictionDto extends PartialType(CreateUserPredictionDto) {}
