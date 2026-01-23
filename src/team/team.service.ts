import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {}
  async create(createTeamDto: CreateTeamDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const exitingTeam = await this.teamRepository.findOne({
      where: {
        name: createTeamDto.name,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (exitingTeam) {
      throw new BadRequestException('Equipo ya existe');
    }
    const team = this.teamRepository.create({
      ...createTeamDto,
      userEmail: user.email,
      empresa,
    });
    return this.teamRepository.save(team);
  }

  async findAll() {
    return this.teamRepository.find();
  }

  async findOne(id: number) {
    const team = await this.teamRepository.findOne({
      where: {
        id_team: id,
      },
    });
    if (!team) {
      throw new BadRequestException('Equipo no encontrado');
    }
    return team;
  }

  async update(
    id: number,
    updateTeamDto: UpdateTeamDto,
    user: UserActiveInterface,
  ) {
    const team = await this.teamRepository.findOne({
      where: {
        id_team: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!team) {
      throw new BadRequestException('Equipo no encontrado');
    }
    // Actualizar el equipo con los nuevos datos
    this.teamRepository.update(id, updateTeamDto);
    return { message: 'Equipo actualizado correctamente' };
  }

  async remove(id: number, user: UserActiveInterface) {
    const team = await this.teamRepository.findOne({
      where: {
        id_team: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!team) {
      throw new BadRequestException('Equipo no encontrado');
    }
    return this.teamRepository.remove(team);
  }
}
