import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

import {IdeaEntity} from "./idea.entity";
import {IdeaDTO} from "./idea.dto";

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity)
        private ideaRepository: Repository<IdeaEntity>
    ) {
    }

    async showAll(): Promise<IdeaEntity[]> {
        const ideasList = await this.ideaRepository.find();

        if(!ideasList || ideasList.length === 0) {
            throw new HttpException('No Registers Found', HttpStatus.NOT_FOUND);
        }

        return ideasList;
    }

    async create(data: IdeaDTO): Promise<IdeaDTO> {
        const idea = await this.ideaRepository.create(data);
        await this.ideaRepository.save(idea);
        return idea;
    }

    async read(id: string): Promise<IdeaDTO> {
        const idea = await this.ideaRepository.findOne({where: {id}});

        if(!idea) {
            throw new HttpException('No Register Found', HttpStatus.NOT_FOUND);
        }

        return idea;
    }

    async update(id: string, data: Partial<IdeaDTO>): Promise<IdeaDTO> {
        let idea = await this.ideaRepository.findOne({where: {id}});
        // const idea = await this.read(id);

        if(!idea) {
            throw new HttpException('No Register Found', HttpStatus.NOT_FOUND);
        }

        await this.ideaRepository.update({id}, data);
        idea = await this.ideaRepository.findOne({where: {id}});
        return idea;
    }

    async delete(id: string): Promise<IdeaDTO> {
        const idea = await this.ideaRepository.findOne({where: {id}});

        if(!idea) {
            throw new HttpException('No Register Found', HttpStatus.NOT_FOUND);
        }

        await this.ideaRepository.delete({ id });
        return idea;
    }
}
