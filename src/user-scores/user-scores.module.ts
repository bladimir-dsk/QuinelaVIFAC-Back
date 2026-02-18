import { Module } from '@nestjs/common';
import { UserScoresService } from './user-scores.service';
import { UserScoresController } from './user-scores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserScore } from './entities/user-score.entity';
import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserScore, User, Empresa])],
  controllers: [UserScoresController],
  providers: [UserScoresService],
  exports: [UserScoresService],
})
export class UserScoresModule {}
