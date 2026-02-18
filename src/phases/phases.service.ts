import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Phase } from './entities/phase.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class PhasesService {
  constructor(
    @InjectRepository(Phase)
    private phaseRepository: Repository<Phase>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {}
  async create(createPhaseDto: CreatePhaseDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const phase = this.phaseRepository.create({
      ...createPhaseDto,
      userEmail: user.email,
      empresa,
    });
    return this.phaseRepository.save(phase);
  }

  async findAll() {
    return this.phaseRepository.find();
  }

  async findOne(id: number) {
    const phase = await this.phaseRepository.findOne({
      where: {
        id_phase: id,
      },
    });
    if (!phase) {
      throw new BadRequestException('Fase no encontrada');
    }
    return phase;
  }

  async update(
    id: number,
    updatePhaseDto: UpdatePhaseDto,
    user: UserActiveInterface,
  ) {
    const phase = await this.finOnePhase(id, user);
    this.phaseRepository.update(phase.id_phase, updatePhaseDto);
    return { message: 'Fase actualizada correctamente' };
  }
  //buscar phase por id
  private async finOnePhase(id: number, user: UserActiveInterface) {
    const phase = await this.phaseRepository.findOne({
      where: {
        id_phase: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!phase) {
      throw new BadRequestException('Fase no encontrada');
    }
    return phase;
  }

  async remove(id: number, user: UserActiveInterface) {
    const phase = await this.finOnePhase(id, user);
    return this.phaseRepository.remove(phase);
  }
}
