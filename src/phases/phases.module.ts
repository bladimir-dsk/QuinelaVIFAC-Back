import { Module } from '@nestjs/common';
import { PhasesService } from './phases.service';
import { PhasesController } from './phases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phase } from './entities/phase.entity';
import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Team } from 'src/team/entities/team.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Match } from 'src/matches/entities/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Phase, User, Empresa, Team, Group, Match]),
  ],
  controllers: [PhasesController],
  providers: [PhasesService],
  exports: [PhasesService],
})
export class PhasesModule {}
