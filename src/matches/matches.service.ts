import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Phase } from 'src/phases/entities/phase.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Team } from 'src/team/entities/team.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Phase)
    private phaseRepository: Repository<Phase>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {}

  // ================= CREATE =================
  async create(createMatchDto: CreateMatchDto, user: UserActiveInterface) {
    const { id_phase, id_group, id_teamA, id_teamB, matchDate } =
      createMatchDto;

    if (id_teamA === id_teamB) {
      throw new BadRequestException(
        'Los equipos del partido no pueden ser iguales',
      );
    }

    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const phase = await this.phaseRepository.findOne({
      where: {
        id_phase,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!phase) {
      throw new BadRequestException('Fase no encontrada');
    }

    let group: Group = null;
    if (id_group) {
      group = await this.groupRepository.findOne({
        where: {
          id_group,
          empresa: { id_empresa: user.id_empresa },
        },
      });
      if (!group) {
        throw new BadRequestException('Grupo no encontrado');
      }
    }

    const teamA = await this.teamRepository.findOne({
      where: {
        id_team: id_teamA,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    const teamB = await this.teamRepository.findOne({
      where: {
        id_team: id_teamB,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    if (!teamA || !teamB) {
      throw new BadRequestException('Uno o ambos equipos no existen');
    }

    // Evitar duplicados
    const existMatch = await this.matchRepository.findOne({
      where: [
        {
          phase: { id_phase },
          teamA: { id_team: id_teamA },
          teamB: { id_team: id_teamB },
          empresa: { id_empresa: user.id_empresa },
        },
        {
          phase: { id_phase },
          teamA: { id_team: id_teamB },
          teamB: { id_team: id_teamA },
          empresa: { id_empresa: user.id_empresa },
        },
      ],
    });

    if (existMatch) {
      throw new BadRequestException('Este partido ya existe');
    }

    const match = this.matchRepository.create({
      matchDate,
      phase,
      group,
      teamA,
      teamB,
      empresa,
      userEmail: user.email,
    });

    return this.matchRepository.save(match);
  }

  // ================= FIND ALL =================
  async findAll() {
    return this.matchRepository.find({
      relations: ['phase', 'group', 'teamA', 'teamB', 'winner'],
      order: {
        matchDate: 'ASC', // Ordenar por fecha
      },
    });
  }

  // ================= FIND ONE =================
  async findOne(id: number) {
    const match = await this.matchRepository.findOne({
      where: {
        id_match: id,
      },
      relations: ['phase', 'group', 'teamA', 'teamB', 'winner'],
    });

    if (!match) {
      throw new BadRequestException('Partido no encontrado');
    }

    return match;
  }

  // ================= SET WINNER =================
  async setWinner(
    id: number,
    id_teamWinner: number,
    user: UserActiveInterface,
  ) {
    const match = await this.findOne(id);

    if (match.isFinished) {
      throw new BadRequestException('El partido ya fue cerrado');
    }

    if (
      id_teamWinner !== match.teamA.id_team &&
      id_teamWinner !== match.teamB.id_team
    ) {
      throw new BadRequestException(
        'El equipo ganador no pertenece a este partido',
      );
    }

    const winner = await this.teamRepository.findOne({
      where: {
        id_team: id_teamWinner,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    match.winner = winner;
    match.isFinished = true;
    match.userEmail = user.email;

    return this.matchRepository.save(match);
  }

  // ================= UPDATE =================
  async update(
    id: number,
    updateMatchDto: UpdateMatchDto,
    user: UserActiveInterface,
  ) {
    const match = await this.findOne(id);

    Object.assign(match, updateMatchDto);
    match.userEmail = user.email;

    return this.matchRepository.save(match);
  }

  // ================= REMOVE =================
  async remove(id: number, user: UserActiveInterface) {
    const match = await this.matchRepository.findOne({
      where: {
        id_match: id,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    if (!match) {
      throw new BadRequestException('Partido no encontrado');
    }

    return this.matchRepository.remove(match);
  }

  async findAvailableForPrediction(user: UserActiveInterface) {
    const now = new Date();

    return this.matchRepository
      .find({
        where: {
          empresa: { id_empresa: user.id_empresa },
          isFinished: false,
        },
        relations: ['phase', 'group', 'teamA', 'teamB'],
        order: {
          matchDate: 'ASC',
        },
      })
      .then((matches) =>
        matches.filter((match) => new Date(match.matchDate) > now),
      );
  }
}
