import { Injectable } from '@nestjs/common';
import { CreateUserScoreDto } from './dto/create-user-score.dto';
import { UpdateUserScoreDto } from './dto/update-user-score.dto';

@Injectable()
export class UserScoresService {
  create(createUserScoreDto: CreateUserScoreDto) {
    return 'This action adds a new userScore';
  }

  findAll() {
    return `This action returns all userScores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userScore`;
  }

  update(id: number, updateUserScoreDto: UpdateUserScoreDto) {
    return `This action updates a #${id} userScore`;
  }

  remove(id: number) {
    return `This action removes a #${id} userScore`;
  }
}
