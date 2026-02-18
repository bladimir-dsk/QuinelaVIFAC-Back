import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Match } from 'src/matches/entities/match.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('phase')
export class Phase {
  @PrimaryGeneratedColumn()
  id_phase: number;

  @Column()
  name: string;

  @Column()
  order: number;

  @OneToMany(() => Group, (group) => group.phase)
  groups: Group[];

  @OneToMany(() => Match, (match) => match.phase)
  matches: Match[];

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  //creamos una columna para el email de referencedcolumn
  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
