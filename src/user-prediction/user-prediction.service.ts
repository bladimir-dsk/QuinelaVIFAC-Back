import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPrediction } from './entities/user-prediction.entity';
import { CreateUserPredictionDto } from './dto/create-user-prediction.dto';
import { UpdateUserPredictionDto } from './dto/update-user-prediction.dto';
import { Match } from 'src/matches/entities/match.entity';
import { Team } from 'src/team/entities/team.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserPredictionService {
  constructor(
    @InjectRepository(UserPrediction)
    private predictionRepository: Repository<UserPrediction>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ================= CREATE =================
  async create(
    createUserPredictionDto: CreateUserPredictionDto,
    user: UserActiveInterface,
  ) {
    const { id_match, id_team } = createUserPredictionDto;

    // 1. Validar empresa
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    // 2. Buscar partido con relaciones
    const match = await this.matchRepository.findOne({
      where: {
        id_match,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['teamA', 'teamB'],
    });

    if (!match) {
      throw new BadRequestException('Partido no encontrado');
    }

    // 3. Validar estado del partido
    if (match.isFinished) {
      throw new BadRequestException(
        'El partido ya fue cerrado, no puedes votar',
      );
    }

    const now = new Date();
    if (now >= new Date(match.matchDate)) {
      throw new BadRequestException(
        'El partido ya inició, no se permiten predicciones',
      );
    }

    // 4. Validar que el equipo pertenece al partido
    if (id_team !== match.teamA.id_team && id_team !== match.teamB.id_team) {
      throw new BadRequestException(
        'El equipo seleccionado no pertenece a este partido',
      );
    }

    // 5. Verificar si ya votó
    const existingPrediction = await this.predictionRepository.findOne({
      where: {
        match: { id_match },
        userEmail: user.email,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    if (existingPrediction) {
      throw new BadRequestException(
        'Ya realizaste una predicción para este partido',
      );
    }

    // 6. Buscar equipo seleccionado
    const team = await this.teamRepository.findOne({
      where: {
        id_team: id_team,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    if (!team) {
      throw new BadRequestException('Equipo no encontrado');
    }

    // 7. Crear predicción
    const prediction = this.predictionRepository.create({
      match,
      selectedTeam: team,
      empresa,
      userEmail: user.email,
      points: 0,
      isCorrect: false,
    });

    return this.predictionRepository.save(prediction);
  }

  // ================= FIND ALL WITH PREDICTIONS =================
  async findAllWithUserPredictions(user: UserActiveInterface) {
    const matches = await this.matchRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['phase', 'group', 'teamA', 'teamB', 'winner'],
      order: {
        matchDate: 'ASC',
      },
    });

    // Para cada partido, verificar si el usuario ya votó
    const matchesWithPredictions = await Promise.all(
      matches.map(async (match) => {
        const userPrediction = await this.predictionRepository.findOne({
          where: {
            match: { id_match: match.id_match },
            userEmail: user.email,
          },
          relations: ['selectedTeam'],
        });

        return {
          ...match,
          userPrediction: userPrediction || null,
          canVote: !match.isFinished && new Date() < new Date(match.matchDate),
        };
      }),
    );

    return matchesWithPredictions;
  }

  // ================= FIND ALL (MIS PREDICCIONES) =================
  async findAll(user: UserActiveInterface) {
    return this.predictionRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
        userEmail: user.email,
      },
      relations: [
        'match',
        'match.teamA',
        'match.teamB',
        'match.phase',
        'match.group',
        'selectedTeam',
      ],
      order: {
        match: {
          matchDate: 'ASC',
        },
      },
    });
  }

  // ================= FIND ONE =================
  async findOne(id: number, user: UserActiveInterface) {
    const prediction = await this.predictionRepository.findOne({
      where: {
        id_userPrediction: id,
        empresa: { id_empresa: user.id_empresa },
        userEmail: user.email,
      },
      relations: [
        'match',
        'match.teamA', // ✅ CRÍTICO: Necesario para el update
        'match.teamB', // ✅ CRÍTICO: Necesario para el update
        'selectedTeam',
      ],
    });

    if (!prediction) {
      throw new BadRequestException('Predicción no encontrada');
    }

    return prediction;
  }

  // ================= UPDATE =================
  async update(
    id: number,
    updateUserPredictionDto: UpdateUserPredictionDto,
    user: UserActiveInterface,
  ) {
    const prediction = await this.findOne(id, user);

    // Validar que el partido no esté cerrado
    if (prediction.match.isFinished) {
      throw new BadRequestException(
        'No se puede modificar una predicción de un partido cerrado',
      );
    }

    // Validar que el partido no haya iniciado
    if (new Date() >= new Date(prediction.match.matchDate)) {
      throw new BadRequestException(
        'El partido ya inició, no se permiten cambios',
      );
    }

    // Si se envió un nuevo equipo
    if (updateUserPredictionDto.id_team) {
      // Validar que el equipo pertenezca al partido
      if (
        updateUserPredictionDto.id_team !== prediction.match.teamA.id_team &&
        updateUserPredictionDto.id_team !== prediction.match.teamB.id_team
      ) {
        throw new BadRequestException('Equipo inválido para este partido');
      }

      // Buscar el nuevo equipo
      const team = await this.teamRepository.findOne({
        where: {
          id_team: updateUserPredictionDto.id_team,
          empresa: { id_empresa: user.id_empresa },
        },
      });

      if (!team) {
        throw new BadRequestException('Equipo no encontrado');
      }

      prediction.selectedTeam = team;
    }

    return this.predictionRepository.save(prediction);
  }

  // ================= REMOVE =================
  async remove(id: number, user: UserActiveInterface) {
    const prediction = await this.findOne(id, user);

    if (prediction.match.isFinished) {
      throw new BadRequestException(
        'No se puede eliminar una predicción de un partido cerrado',
      );
    }

    if (new Date() >= new Date(prediction.match.matchDate)) {
      throw new BadRequestException(
        'El partido ya inició, no se pueden eliminar predicciones',
      );
    }

    return this.predictionRepository.remove(prediction);
  }

  // ================= CLOSE MATCH =================
  async closeMatch(
    id_match: number,
    id_teamWinner: number,
    user: UserActiveInterface,
  ) {
    return this.matchRepository.manager.transaction(async (manager) => {
      // Buscar el partido
      const match = await manager.findOne(Match, {
        where: {
          id_match,
          empresa: { id_empresa: user.id_empresa },
        },
        relations: ['teamA', 'teamB'],
      });

      if (!match) {
        throw new BadRequestException('Partido no encontrado');
      }

      if (match.isFinished) {
        throw new BadRequestException('El partido ya fue cerrado');
      }

      // Validar que el ganador pertenezca al partido
      if (
        id_teamWinner !== match.teamA.id_team &&
        id_teamWinner !== match.teamB.id_team
      ) {
        throw new BadRequestException('El ganador no pertenece a este partido');
      }

      // Buscar el equipo ganador
      const winner = await manager.findOne(Team, {
        where: {
          id_team: id_teamWinner,
          empresa: { id_empresa: user.id_empresa },
        },
      });

      if (!winner) {
        throw new BadRequestException('Equipo ganador no encontrado');
      }

      // Actualizar partido
      match.winner = winner;
      match.isFinished = true;
      await manager.save(match);

      // Buscar todas las predicciones del partido
      const predictions = await manager.find(UserPrediction, {
        where: {
          match: { id_match },
          empresa: { id_empresa: user.id_empresa },
        },
        relations: ['selectedTeam'],
      });

      // Asignar puntos
      for (const prediction of predictions) {
        if (prediction.selectedTeam.id_team === winner.id_team) {
          prediction.isCorrect = true;
          prediction.points = 1;
        } else {
          prediction.isCorrect = false;
          prediction.points = 0;
        }
        await manager.save(prediction);
      }

      return {
        message: 'Partido cerrado y puntos asignados',
        totalPredictions: predictions.length,
        correctPredictions: predictions.filter((p) => p.isCorrect).length,
      };
    });
  }

  // ================= RANKINGS =================
  async getGlobalRanking(user: UserActiveInterface) {
    const result = await this.predictionRepository
      .createQueryBuilder('p')
      .select('p.userEmail', 'user')
      .addSelect('SUM(p.points)', 'points')
      .addSelect('COUNT(p.id_userPrediction)', 'totalPredictions')
      .addSelect(
        'SUM(CASE WHEN p.isCorrect = true THEN 1 ELSE 0 END)',
        'correctPredictions',
      )
      .where('p.id_empresa = :empresa', {
        empresa: user.id_empresa,
      })
      .groupBy('p.userEmail')
      .orderBy('points', 'DESC')
      .addOrderBy('correctPredictions', 'DESC')
      .getRawMany();

    return result.map((row, index) => ({
      position: index + 1,
      user: row.user,
      points: parseInt(row.points) || 0,
      totalPredictions: parseInt(row.totalPredictions) || 0,
      correctPredictions: parseInt(row.correctPredictions) || 0,
      accuracy:
        row.totalPredictions > 0
          ? ((row.correctPredictions / row.totalPredictions) * 100).toFixed(2)
          : '0.00',
    }));
  }

  async getRankingByPhase(id_phase: number, user: UserActiveInterface) {
    const result = await this.predictionRepository
      .createQueryBuilder('p')
      .innerJoin('p.match', 'm')
      .innerJoin('m.phase', 'phase')
      .select('p.userEmail', 'user')
      .addSelect('SUM(p.points)', 'points')
      .addSelect('COUNT(p.id_userPrediction)', 'totalPredictions')
      .addSelect(
        'SUM(CASE WHEN p.isCorrect = true THEN 1 ELSE 0 END)',
        'correctPredictions',
      )
      .where('phase.id_phase = :id_phase', { id_phase })
      .andWhere('p.id_empresa = :empresa', {
        empresa: user.id_empresa,
      })
      .groupBy('p.userEmail')
      .orderBy('points', 'DESC')
      .addOrderBy('correctPredictions', 'DESC')
      .getRawMany();

    return result.map((row, index) => ({
      position: index + 1,
      user: row.user,
      points: parseInt(row.points) || 0,
      totalPredictions: parseInt(row.totalPredictions) || 0,
      correctPredictions: parseInt(row.correctPredictions) || 0,
      accuracy:
        row.totalPredictions > 0
          ? ((row.correctPredictions / row.totalPredictions) * 100).toFixed(2)
          : '0.00',
    }));
  }
}
