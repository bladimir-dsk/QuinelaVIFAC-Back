import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Phase } from 'src/phases/entities/phase.entity';
import { Team } from 'src/team/entities/team.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('group')
export class Group {
  @PrimaryGeneratedColumn()
  id_group: number;

  @Column()
  name: string;

  @ManyToOne(() => Phase, (phase) => phase.groups)
  @JoinColumn({ name: 'id_phase' })
  phase: Phase;

  @ManyToMany(() => Team)
  @JoinTable({
    name: 'group_teams',
    joinColumns: [{ name: 'id_group', referencedColumnName: 'id_group' }],
    inverseJoinColumns: [{ name: 'id_team', referencedColumnName: 'id_team' }],
  })
  teams: Team[];

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
