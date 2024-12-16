import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { Authentication } from '../auth/decorators/authentication.decorator';
import { ValidRole } from 'src/interfaces/valid-auth.enum';

@Controller('seeds')
// @Authentication(ValidRole.root)
export class SeedsController {
  constructor(private readonly seedsService: SeedsService) {}

  @Get('execute-zero')
  executeSeedsZero() {
    return this.seedsService.executeSeedZero(); //REGISTRAR CONFIGURACIONES
  }
  @Get('execute')
  executeSeeds() {
    return this.seedsService.executeSeed(); // REGISTRA LA DATA QUE USA EL SISTEMA
  }
  @Get('execute-two')
  executeSeedsTwo() {
    return this.seedsService.executeSeedPartTwo(); // REGISTRA LAS RELACIONES ENTRE TABLAS
  }
  @Get('execute-three')
  executeSeedsThree() {
    return this.seedsService.executeSeedPartThree(); // ACTUALIZA LA INFORMACION DE ALGUNAS TABLAS
  }
}
