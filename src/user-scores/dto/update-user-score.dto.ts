import { PartialType } from '@nestjs/swagger';
import { CreateUserScoreDto } from './create-user-score.dto';

export class UpdateUserScoreDto extends PartialType(CreateUserScoreDto) {}
