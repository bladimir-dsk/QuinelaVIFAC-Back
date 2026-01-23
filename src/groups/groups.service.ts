import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Phase } from 'src/phases/entities/phase.entity';
import { Team } from 'src/team/entities/team.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(Phase)
    private phaseRepository: Repository<Phase>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}
  async create(createGroupDto: CreateGroupDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const team = await this.teamRepository.findByIds(createGroupDto.id_team);
    if (team.length !== createGroupDto.id_team.length) {
      throw new BadRequestException('Algunos equipos no existen');
    }
    const existinGroup = await this.groupRepository.findOne({
      where: {
        name: createGroupDto.name,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (existinGroup) {
      throw new BadRequestException('Grupo ya existe');
    }
    const phase = await this.phaseRepository.findOne({
      where: {
        id_phase: createGroupDto.id_phase,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!phase) {
      throw new BadRequestException('Fase no encontrada');
    }

    const newGroup = await this.groupRepository.create({
      ...createGroupDto,
      phase,
      empresa,
      teams: team,
      userEmail: user.email,
    });
    return this.groupRepository.save(newGroup);
  }

  findAll() {
    return this.groupRepository.find({
      relations: ['phase', 'teams'],
    });
  }
  private async findGroupById(id: number, user: UserActiveInterface) {
    const group = await this.groupRepository.findOne({
      where: {
        id_group: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['phase', 'teams'],
    });
    if (!group) {
      throw new BadRequestException('Grupo no encontrado');
    }
    return group;
  }

  async findOne(id: number) {
    return this.findGroupById(id, { id_empresa: 1 } as UserActiveInterface);
  }

  async update(
    id: number,
    updateGroupDto: UpdateGroupDto,
    user: UserActiveInterface,
  ) {
    const group = await this.groupRepository.findOne({
      where: {
        id_group: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['phase', 'teams'],
    });

    if (!group) {
      throw new BadRequestException('Grupo no encontrado');
    }

    if (updateGroupDto.id_team) {
      const teams = await this.teamRepository.findByIds(updateGroupDto.id_team);

      if (teams.length !== updateGroupDto.id_team.length) {
        throw new BadRequestException('Algunos equipos no existen');
      }

      group.teams = teams;
    }

    if (updateGroupDto.name && updateGroupDto.name !== group.name) {
      const existingGroup = await this.groupRepository.findOne({
        where: {
          name: updateGroupDto.name,
          empresa: { id_empresa: user.id_empresa },
        },
      });

      if (existingGroup) {
        throw new BadRequestException('Grupo ya existe');
      }

      group.name = updateGroupDto.name;
    }

    const { id_team, ...rest } = updateGroupDto;
    Object.assign(group, rest);

    group.userEmail = user.email;

    return this.groupRepository.save(group);
  }

  async remove(id: number, user: UserActiveInterface) {
    const group = await this.findGroupById(id, user);
    return this.groupRepository.remove(group);
  }
}
