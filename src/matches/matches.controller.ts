import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';

@ApiBasicAuth('jwt')
@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @Auth(Role.ADMIN)
  create(
    @Body() createMatchDto: CreateMatchDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.matchesService.create(createMatchDto, user);
  }

  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.matchesService.findOne(id);
  }

  // @Get('available-for-prediction')
  // @Auth(Role.PARTICIPANTE)
  // async getAvailableMatches(@ActiveUser() user: UserActiveInterface) {
  //   return this.matchesService.findAvailableForPrediction(user);
  // }

  // @Get('set-winner/:id/:id_teamWinner')
  // @Auth(Role.ADMIN)
  // setWinner(
  //   @Param('id') id: number,
  //   @Param('id_teamWinner') id_teamWinner: number,
  //   @ActiveUser() user: UserActiveInterface,
  // ) {
  //   return this.matchesService.setWinner(id, id_teamWinner, user);
  // }

  @Patch(':id')
  @Auth(Role.ADMIN)
  update(
    @Param('id') id: number,
    @Body() updateMatchDto: UpdateMatchDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.matchesService.update(id, updateMatchDto, user);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.matchesService.remove(id, user);
  }
}
