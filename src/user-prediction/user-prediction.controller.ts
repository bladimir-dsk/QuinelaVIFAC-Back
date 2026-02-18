import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserPredictionService } from './user-prediction.service';
import { CreateUserPredictionDto } from './dto/create-user-prediction.dto';
import { UpdateUserPredictionDto } from './dto/update-user-prediction.dto';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { RankingFiltersDto } from './dto/ranking-filters.dto';

@ApiBasicAuth('jwt')
@ApiTags('Usuario predicciones')
@Controller('user-prediction')
export class UserPredictionController {
  constructor(private readonly userPredictionService: UserPredictionService) {}

  // ==================== CREAR PREDICCIÓN ====================
  @Post()
  @Auth(Role.PARTICIPANTE)
  create(
    @Body() createUserPredictionDto: CreateUserPredictionDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.userPredictionService.create(createUserPredictionDto, user);
  }

  // ==================== RANKINGS ====================
  // ⚠️ IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros

  @Get('ranking/global')
  @Auth(Role.PARTICIPANTE)
  getGlobalRanking(@ActiveUser() user: UserActiveInterface) {
    return this.userPredictionService.getGlobalRanking(user);
  }

  @Get('ranking/phase/:id_phase')
  @Auth(Role.PARTICIPANTE)
  getRankingByPhase(
    @Param('id_phase', ParseIntPipe) id_phase: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.userPredictionService.getRankingByPhase(id_phase, user);
  }

  @Get('public/ranking/global')
  async getPublicGlobalRanking(@Query() filters: RankingFiltersDto) {
    return this.userPredictionService.getPublicGlobalRanking(filters);
  }

  // ==================== ADMIN: CERRAR PARTIDO ====================
  @Patch('close-match/:id_match/:id_teamWinner')
  @Auth(Role.ADMIN)
  closeMatch(
    @Param('id_match', ParseIntPipe) id_match: number,
    @Param('id_teamWinner', ParseIntPipe) id_teamWinner: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.userPredictionService.closeMatch(id_match, id_teamWinner, user);
  }

  // ==================== VER MIS PREDICCIONES ====================
  @Get()
  @Auth(Role.PARTICIPANTE)
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.userPredictionService.findAll(user);
  }

  // ==================== VER UNA PREDICCIÓN ====================
  @Get(':id')
  @Auth(Role.PARTICIPANTE) // ✅ Cambiado: los usuarios pueden ver sus propias predicciones
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.userPredictionService.findOne(id, user);
  }

  // ==================== ACTUALIZAR PREDICCIÓN ====================
  @Patch(':id')
  @Auth(Role.PARTICIPANTE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserPredictionDto: UpdateUserPredictionDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.userPredictionService.update(id, updateUserPredictionDto, user);
  }

  // ==================== ELIMINAR PREDICCIÓN ====================
  @Delete(':id')
  @Auth(Role.PARTICIPANTE) // ✅ Cambiado: los usuarios pueden eliminar sus propias predicciones
  remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.userPredictionService.remove(id, user);
  }
}
