import { Module } from '@nestjs/common';
import { UserPredictionService } from './user-prediction.service';
import { UserPredictionController } from './user-prediction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPrediction } from './entities/user-prediction.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPrediction, Empresa, User])],
  controllers: [UserPredictionController],
  providers: [UserPredictionService],
  exports: [UserPredictionService],
})
export class UserPredictionModule {}
