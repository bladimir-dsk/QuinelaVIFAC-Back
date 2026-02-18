import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PhasesService } from './phases.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/enums/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
@ApiBasicAuth('jwt')
@ApiTags('Phases')
@Controller('phases')
export class PhasesController {
  constructor(private readonly phasesService: PhasesService) {}

  @Post()
  @Auth(Role.ADMIN)
  create(
    @Body() createPhaseDto: CreatePhaseDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.phasesService.create(createPhaseDto, user);
  }

  @Get()
  findAll() {
    return this.phasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.phasesService.findOne(+id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  update(
    @Param('id') id: number,
    @Body() updatePhaseDto: UpdatePhaseDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.phasesService.update(+id, updatePhaseDto, user);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.phasesService.remove(+id, user);
  }
}
