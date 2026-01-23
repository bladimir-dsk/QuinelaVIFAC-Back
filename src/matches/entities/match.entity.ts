import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Group } from 'src/groups/entities/group.entity';
import { Phase } from 'src/phases/entities/phase.entity';
import { Team } from 'src/team/entities/team.entity';
import { UserPrediction } from 'src/user-prediction/entities/user-prediction.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id_match: number;

  @Column({ type: 'timestamp' })
  matchDate: Date;

  @ManyToOne(() => Phase, (phase) => phase.matches)
  phase: Phase;

  @ManyToOne(() => Group, { nullable: true })
  group: Group;

  @ManyToOne(() => Team, (team) => team.matchesA)
  teamA: Team;

  @ManyToOne(() => Team, (team) => team.matchesB)
  teamB: Team;

  @ManyToOne(() => Team, { nullable: true })
  winner: Team;

  @Column({ default: false })
  isFinished: boolean;

  @OneToMany(() => UserPrediction, (prediction) => prediction.match)
  predictions: UserPrediction[];

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
