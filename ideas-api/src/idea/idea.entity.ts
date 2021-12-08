import {
  Column,
  CreateDateColumn,
  Entity, JoinTable, ManyToMany, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {UserEntity} from "../user/user.entity";

@Entity('idea')
export class IdeaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @Column()
  idea: string;

  @Column()
  description: string;

  @ManyToOne(type => UserEntity, author => author.ideas)
  author: UserEntity;

  @ManyToMany(type => UserEntity, {cascade: true})
  @JoinTable()
  upvotes: UserEntity[];

  @ManyToMany(type => UserEntity, {cascade: true})
  @JoinTable()
  downvotes: UserEntity[];
}
