import { Match } from 'src/matches/entities/match.entity';
import { Empresa } from './../../empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from 'src/team/entities/team.entity';

@Entity('user_predictions')
export class UserPrediction {
  @PrimaryGeneratedColumn()
  id_userPrediction: number;

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ default: 0 })
  points: number;

  @ManyToOne(() => Match, (match) => match.predictions)
  match: Match;

  @ManyToOne(() => Team)
  selectedTeam: Team;

  // ❌ ELIMINAR 'usuario' - solo necesitas una relación con User
  @ManyToOne(() => User, (user) => user.predictions)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
