import { Module } from '@nestjs/common';
import { UserPredictionService } from './user-prediction.service';
import { UserPredictionController } from './user-prediction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPrediction } from './entities/user-prediction.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Match } from 'src/matches/entities/match.entity';
import { Team } from 'src/team/entities/team.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Phase } from 'src/phases/entities/phase.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPrediction,
      Empresa,
      User,
      Match,
      Team,
      Group,
      Phase,
    ]),
  ],
  controllers: [UserPredictionController],
  providers: [UserPredictionService],
  exports: [UserPredictionService],
})
export class UserPredictionModule {}
