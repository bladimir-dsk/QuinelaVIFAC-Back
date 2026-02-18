import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Phase } from 'src/phases/entities/phase.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Team } from 'src/team/entities/team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Empresa, User, Phase, Group, Team]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
