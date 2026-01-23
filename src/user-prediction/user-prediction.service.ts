import { Injectable } from '@nestjs/common';
import { CreateUserPredictionDto } from './dto/create-user-prediction.dto';
import { UpdateUserPredictionDto } from './dto/update-user-prediction.dto';

@Injectable()
export class UserPredictionService {
  create(createUserPredictionDto: CreateUserPredictionDto) {
    return 'This action adds a new userPrediction';
  }

  findAll() {
    return `This action returns all userPrediction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userPrediction`;
  }

  update(id: number, updateUserPredictionDto: UpdateUserPredictionDto) {
    return `This action updates a #${id} userPrediction`;
  }

  remove(id: number) {
    return `This action removes a #${id} userPrediction`;
  }
}
