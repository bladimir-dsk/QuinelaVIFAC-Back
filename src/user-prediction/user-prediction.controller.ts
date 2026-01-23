import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserPredictionService } from './user-prediction.service';
import { CreateUserPredictionDto } from './dto/create-user-prediction.dto';
import { UpdateUserPredictionDto } from './dto/update-user-prediction.dto';

@Controller('user-prediction')
export class UserPredictionController {
  constructor(private readonly userPredictionService: UserPredictionService) {}

  @Post()
  create(@Body() createUserPredictionDto: CreateUserPredictionDto) {
    return this.userPredictionService.create(createUserPredictionDto);
  }

  @Get()
  findAll() {
    return this.userPredictionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userPredictionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserPredictionDto: UpdateUserPredictionDto) {
    return this.userPredictionService.update(+id, updateUserPredictionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userPredictionService.remove(+id);
  }
}
