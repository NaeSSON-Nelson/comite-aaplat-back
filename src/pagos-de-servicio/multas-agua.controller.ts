import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { Authentication } from "src/auth/decorators";
import { MultasServicioAguaService } from "./multas-agua.service";
import { CreateMultaDto } from "./dto/create-multa.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { RegistrarPagoMultasDto } from "./dto/registrar-pago-multas.dto";
import { QueryMultasIds } from "./query/query-multas";

@Controller('multas-de-servicio')
@Authentication()
export class MultasAguaController {
    constructor(private readonly multasAguaService: MultasServicioAguaService) {}


    @Post('create')
    createMulta(@Body() multasDto: CreateMultaDto){
        return this.multasAguaService.createMultaServicioAgua(multasDto);
    }
    @Post('pago')
    registrarPagoDeMultaWithLecturas(@Body() registros: RegistrarPagoMultasDto){
        return this.multasAguaService.registrarPagoMultaWithMesLectura(registros)
    }
    

    @Get('activos/:id')
    multasActivas(@Param('id', ParseIntPipe) id: number){

        return this.multasAguaService.findMultas(id);
    }
    @Get('historial/:id')
    historialMultas(@Param('id', ParseIntPipe) id: number,@Query() paginationDto:PaginationDto){
        return this.multasAguaService.historialMultas(id,paginationDto);

    }
    @Get('lecturas-retrasos/:perfilId/:medidorAscId')
    findLecturasRetrasados(@Param('perfilId', ParseIntPipe) perfilId: number,@Param('medidorAscId', ParseIntPipe) medidorAscId: number){
        return this.multasAguaService.obtenerMesLecturasConRetrasoDePago(perfilId,medidorAscId);
    }
    @Get('medidores-perfil/:id')
    findMedidoresAsociados(@Param('id', ParseIntPipe) id: number){
        return this.multasAguaService.obtenerMedidoresPerfil(id);
    }

    @Get('multa-perfil/:id')
    findMulta(@Param('id', ParseIntPipe) id: number){
        return this.multasAguaService.findMulta(id);
    }
    @Get('multas-perfil/:id')
    findMultasIds(@Param('id', ParseIntPipe) perfilId: number,@Query() query: QueryMultasIds){
        return this.multasAguaService.findMultaIds(perfilId,query);
    }
}