import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

import {IdeaEntity} from './idea.entity';
import {UserEntity} from '../user/user.entity';

import {IdeaDTO, IdeaRO} from './idea.dto';
import {Votes} from '../shared/votes.enum';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
  }

  /* Private Methods */

  private toResponseObject(idea: IdeaEntity): IdeaRO {
    const responseObject: any = {
      ...idea,
      author: idea.author.toResponseObject(false),
    };

    if (responseObject.upvotes) {
      responseObject.upvotes = idea.upvotes.length;
    }

    if (responseObject.downvotes) {
      responseObject.downvotes = idea.downvotes.length;
    }

    return responseObject;
  }

  private ensureOwnership(idea: IdeaEntity, userId: string) {
    if (idea.author.id !== userId) {
      throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
    }
  }

  private async voteIdea(idea: IdeaEntity, user: UserEntity, vote: Votes) {
    const invertedVote = vote === Votes.UP ? Votes.DOWN : Votes.UP;

    if (idea[invertedVote].filter(voter => voter.id === user.id).length > 0
      || idea[vote].filter(voter => voter.id === user.id).length > 0) {

      idea[invertedVote] = idea[invertedVote].filter(
        voter => voter.id !== user.id,
      );
      idea[vote] = idea[vote].filter(voter => voter.id !== user.id);

      await this.ideaRepository.save(idea);
    } else if (idea[vote].filter(voter => voter.id === user.id).length < 1) {
      idea[vote].push(user);
      await this.ideaRepository.save(idea);
    } else {
      throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
    }

    return idea;
  }

  /* Public Methods */

  public async showAll(): Promise<IdeaRO[]> {
    const ideasList = await this.ideaRepository.find({
      relations: ['author', 'upvotes', 'downvotes'],
    });

    if (!ideasList || ideasList.length === 0) {
      throw new HttpException('No Registers Found', HttpStatus.NOT_FOUND);
    }

    return ideasList.map(idea => this.toResponseObject(idea));
  }

  public async create(userId: string, data: IdeaDTO): Promise<{ author: any }> {
    const user = await this.userRepository.findOne({where: {id: userId}});
    const idea = await this.ideaRepository.create({...data, author: user});
    await this.ideaRepository.save(idea);
    return {...idea, author: idea.author.toResponseObject(false)};
  }

  public async read(id: string): Promise<IdeaDTO> {
    const idea = await this.ideaRepository.findOne({
      where: {id},
      relations: ['author', 'upvotes', 'downvotes'],
    });

    if (!idea) {
      throw new HttpException('No Register Found', HttpStatus.NOT_FOUND);
    }

    return this.toResponseObject(idea);
  }

  public async update(
    id: string,
    userId: string,
    data: Partial<IdeaDTO>,
  ): Promise<IdeaDTO> {
    let idea = await this.ideaRepository.findOne({
      where: {id},
      relations: ['author'],
    });

    if (!idea) {
      throw new HttpException('No Register Found', HttpStatus.NOT_FOUND);
    }

    this.ensureOwnership(idea, userId);

    await this.ideaRepository.update({id}, data);
    idea = await this.ideaRepository.findOne({
      where: {id},
      relations: ['author'],
    });

    return this.toResponseObject(idea);
  }

  public async delete(id: string, userId: string): Promise<IdeaDTO> {
    const idea = await this.ideaRepository.findOne({
      where: {id},
      relations: ['author'],
    });

    if (!idea) {
      throw new HttpException('No Register Found', HttpStatus.NOT_FOUND);
    }

    this.ensureOwnership(idea, userId);

    await this.ideaRepository.delete({id});

    return this.toResponseObject(idea);
  }

  public async upvoteIdea(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: {id},
      relations: ['author', 'upvotes', 'downvotes'],
    });
    const user = await this.userRepository.findOne({where: {id: userId}});

    idea = await this.voteIdea(idea, user, Votes.UP);
    return this.toResponseObject(idea);
  }

  public async downvoteIdea(id: string, userId: string) {
    let idea = await this.ideaRepository.findOne({
      where: {id},
      relations: ['author', 'upvotes', 'downvotes'],
    });
    const user = await this.userRepository.findOne({where: {id: userId}});

    idea = await this.voteIdea(idea, user, Votes.DOWN);
    return this.toResponseObject(idea);
  }

  public async bookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({where: {id}});
    const user = await this.userRepository.findOne({
      where: {id: userId},
      relations: ['bookmarks'],
    });

    if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1) {
      user.bookmarks.push(idea);
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Idea already bookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.toResponseObject(false);
  }

  public async unBookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({where: {id}});
    const user = await this.userRepository.findOne({
      where: {id: userId},
      relations: ['bookmarks'],
    });

    if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0) {
      user.bookmarks = user.bookmarks.filter(
        bookmark => bookmark.id !== idea.id,
      );
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Idea already unbookmarked',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.toResponseObject(false);
  }
}
