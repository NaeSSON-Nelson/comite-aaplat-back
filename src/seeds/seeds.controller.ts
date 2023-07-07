import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { Authentication } from '../auth/decorators/auth.decorator';
import { ValidRole } from 'src/interfaces/valid-auth.enum';

@Controller('seeds')
// @Authentication(ValidRole.root)
export class SeedsController {
  constructor(private readonly seedsService: SeedsService) {}

  @Get('execute')
  executeSeeds() {
    return this.seedsService.executeSeed();
  }
}
