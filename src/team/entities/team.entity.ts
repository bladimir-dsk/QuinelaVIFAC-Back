import { Empresa } from 'src/empresa/entities/empresa.entity';
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

@Entity('team')
export class Team {
  @PrimaryGeneratedColumn()
  id_team: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  flagUrl: string;

  @OneToMany(() => Match, (match) => match.teamA)
  matchesA: Match[];

  @OneToMany(() => Match, (match) => match.teamB)
  matchesB: Match[];

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
