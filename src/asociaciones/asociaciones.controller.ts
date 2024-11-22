import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { AsociacionesService } from './asociaciones.service';
import { CreateMedidorAsociadoDto } from './dto/create-medidor-asociado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateMedidorAsociadoDto } from './dto/update-medidor-asociado.dto';
import { CreateGestionMedidorAsociadoDto } from './dto/create-gestion-medidor-asociacion.dto';
import { UpdateStatusGestion } from './dto/update-status-planilla.dto';

@Controller('asociaciones')
export class AsociacionesController {
  constructor(private readonly asociacionesService: AsociacionesService) {}

 
  @Post()
  create(@Body() createMedidorAsociado:CreateMedidorAsociadoDto){
    return this.asociacionesService.create(createMedidorAsociado);
  }
  @Post('gestion')
  createGestion(@Body() createGestionMedidorAsociado:CreateGestionMedidorAsociadoDto){
    return this.asociacionesService.createGestionActual(createGestionMedidorAsociado)
  }
  @Get()
  getAfiliados(@Query() paginationDto: PaginationDto){
    return this.asociacionesService.findAll(paginationDto);
  }
  @Get('list/gestiones/:id')
  getGestiones(@Param('id', ParseIntPipe) id: number,@Query() paginationDto: PaginationDto){
    return this.asociacionesService.findGestiones(id,paginationDto)
  }
  @Get('sin-asociaciones')
  medidoresWithoutAsociacion(@Query() paginationDto: PaginationDto){
    return this.asociacionesService.findMedidoresWithoutAsociacion(paginationDto);
  } 
  @Get('perfil/:id')
  findPerfilAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.findOnePerfil(id);
  } 
  @Get('gestiones/:id')
  getGestionesLecturasAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.getGestionesLecturasAsociacion(id);
  }
  @Get('lectura/:id')
  getLecturaAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.getLecturaDetails(id);
  }
  @Get('lecturas/:id')
  getLecturasAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.getLecturasAsociacion(id);
  }
  @Get('medidor/:id')
  findMedidorWithAsociationById(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.findMedidorWithAsociation(id);
  }
  @Get('gestion/:id')
  verificarGestion(@Param('id', ParseIntPipe) id:number){
    return this.asociacionesService.verificarGestion(id);
  }
  @Get('gestion/:id/:gestion')
  findGestionByIdAsociacion(@Param('id', ParseIntPipe) id:number,
                            @Param('gestion', ParseIntPipe) gestion:number){
    return this.asociacionesService.findGestionById(id,gestion);
  }
  @Get(':id')
  findAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.findOne(id);
  }
  @Patch(':id')
  updateAsociacion(@Param('id', ParseIntPipe) id: number,@Body() updst: UpdateMedidorAsociadoDto){
    return this.asociacionesService.update(id,updst);
  }
  
  @Patch('status/:id')
  updateStatusAsociacion(@Param('id', ParseIntPipe) id: number,@Body() updateMedidorAsociadoDto:UpdateMedidorAsociadoDto){
    return this.asociacionesService.updateStatus(id,updateMedidorAsociadoDto);
  }
  @Patch('gestion/:id')
  updateStatusGestion(@Param('id', ParseIntPipe) id: number,@Body() updateStatusGestion:UpdateStatusGestion){
    return this.asociacionesService.updateStatusGestion(id,updateStatusGestion)
  }
}
