import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {IdeaEntity} from '../idea/idea.entity';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {UserRO} from "./user.dto";

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @OneToMany(type => IdeaEntity, idea => idea.author)
  ideas: IdeaEntity[];

  private get token() {
    const {id, username} = this;
    return jwt.sign(
      {
        id,
        username,
      },
      process.env.SECRET,
      {expiresIn: '7d'},
    );
  }

  @BeforeInsert()
  public async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  public toResponseObject(showToken = true): any {
    const {id, created, username, token} = this;
    const responseObject: any = {
      id,
      created,
      username,
    };

    if (showToken) {
      responseObject.token = token;
    }

    return responseObject;
  }

  public async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
