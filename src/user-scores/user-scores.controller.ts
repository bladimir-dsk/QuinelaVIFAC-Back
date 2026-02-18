import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserScoresService } from './user-scores.service';
import { CreateUserScoreDto } from './dto/create-user-score.dto';
import { UpdateUserScoreDto } from './dto/update-user-score.dto';

@Controller('user-scores')
export class UserScoresController {
  constructor(private readonly userScoresService: UserScoresService) {}

  @Post()
  create(@Body() createUserScoreDto: CreateUserScoreDto) {
    return this.userScoresService.create(createUserScoreDto);
  }

  @Get()
  findAll() {
    return this.userScoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userScoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserScoreDto: UpdateUserScoreDto) {
    return this.userScoresService.update(+id, updateUserScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userScoresService.remove(+id);
  }
}
