import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

import {IdeaEntity} from './idea.entity';
import {UserEntity} from '../user/user.entity';

import {IdeaDTO} from './idea.dto';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    if (idea.author.id !== userId) {
      throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
    }
  }

  public async showAll(): Promise<IdeaEntity[]> {
    const ideasList = await this.ideaRepository.find({relations: ['author']});

    if (!ideasList || ideasList.length === 0) {
      throw new HttpException('No Registers Found', HttpStatus.NOT_FOUND);
    }

    return ideasList.map(idea => {
      idea.author = idea.author.toResponseObject(false);
      return idea;
    });
  }

  public async create(userId: string, data: IdeaDTO): Promise<{ author: any }> {
    const user = await this.userRepository.findOne({where: {id: userId}});
    const idea = await this.ideaRepository.create({...data, author: user});
    await this.ideaRepository.save(idea);
    return {...idea, author: idea.author.toResponseObject(false)};
  }

  public async read(id: string): Promise<IdeaDTO> {
    const idea = await this.ideaRepository.findOne({where: {id}});

    if (!idea) {
      throw new HttpException('No Register Found', HttpStatus.NOT_FOUND);
    }

    idea.author = idea.author.toResponseObject(false);

    return idea;
  }

  public async update(id: string, userId: string, data: Partial<IdeaDTO>): Promise<IdeaDTO> {
    let idea = await this.ideaRepository.findOne({where: {id}, relations: ['author']});

    if (!idea) {
      throw new HttpException('No Register Found', HttpStatus.NOT_FOUND);
    }

    this.ensureOwnership(idea, userId);

    await this.ideaRepository.update({id}, data);
    idea = await this.ideaRepository.findOne({where: {id}, relations: ['author']});

    idea.author = idea.author.toResponseObject(false);

    return idea;
  }

  public async delete(id: string, userId: string): Promise<IdeaDTO> {
    const idea = await this.ideaRepository.findOne({where: {id}, relations: ['author']});

    if (!idea) {
      throw new HttpException('No Register Found', HttpStatus.NOT_FOUND);
    }

    this.ensureOwnership(idea, userId);

    await this.ideaRepository.delete({id});

    idea.author = idea.author.toResponseObject(false);

    return idea;
  }
}
