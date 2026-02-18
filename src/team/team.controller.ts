import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';

@ApiBasicAuth('jwt')
@ApiTags('Team')
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @Auth(Role.ADMIN)
  create(
    @Body() createTeamDto: CreateTeamDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.teamService.create(createTeamDto, user);
  }

  @Get()
  findAll() {
    return this.teamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.teamService.findOne(+id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  update(
    @Param('id') id: number,
    @Body() updateTeamDto: UpdateTeamDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.teamService.update(+id, updateTeamDto, user);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.teamService.remove(+id, user);
  }
}
