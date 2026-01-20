import { Injectable } from '@nestjs/common';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Injectable()
export class PhasesService {
  create(createPhaseDto: CreatePhaseDto) {
    return 'This action adds a new phase';
  }

  findAll() {
    return `This action returns all phases`;
  }

  findOne(id: number) {
    return `This action returns a #${id} phase`;
  }

  update(id: number, updatePhaseDto: UpdatePhaseDto) {
    return `This action updates a #${id} phase`;
  }

  remove(id: number) {
    return `This action removes a #${id} phase`;
  }
}
