import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { Authentication, Authorization, AuthorizationResource } from "src/auth/decorators";
import { MultasServicioAguaService } from "./multas-agua.service";
import { CreateMultaDto } from "./dto/create-multa.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { RegistrarPagoMultasDto } from "./dto/registrar-pago-multas.dto";
import { QueryMultasIds } from "./query/query-multas";
import { ItemMenuProtected, MenusProtected } from "src/auth/decorators/valid-protected.decorator";
import { ValidItemMenu, ValidMenu } from "src/interfaces/valid-auth.enum";

@Controller('multas-de-servicio')
@AuthorizationResource()
@Authorization()
@Authentication()
export class MultasAguaController {
    constructor(private readonly multasAguaService: MultasServicioAguaService) {}


    @Post('create')
    @MenusProtected(ValidMenu.cobros)
    @ItemMenuProtected(ValidItemMenu.cobrosMultasRegistrarNuevo)
    createMulta(@Body() multasDto: CreateMultaDto){
        return this.multasAguaService.createMultaServicioAgua(multasDto);
    }
    @Post('pago')
    @MenusProtected(ValidMenu.cobros)
    @ItemMenuProtected(ValidItemMenu.cobrosRegistrarPagoMultasSelected)
    registrarPagoDeMultaWithLecturas(@Body() registros: RegistrarPagoMultasDto){
        return this.multasAguaService.registrarPagoMultaWithMesLectura(registros)
    }
    
    @MenusProtected(ValidMenu.cobros)
    @ItemMenuProtected(ValidItemMenu.cobrosMultasActivas)
    @Get('activos/:id')
    multasActivas(@Param('id', ParseIntPipe) id: number){
        
        return this.multasAguaService.findMultas(id);
    }
    @Get('historial/:id')
    @MenusProtected(ValidMenu.cobros)
    @ItemMenuProtected(ValidItemMenu.cobrosMultasHistorial)
    historialMultas(@Param('id', ParseIntPipe) id: number,@Query() paginationDto:PaginationDto){
        return this.multasAguaService.historialMultas(id,paginationDto);
        
    }
    @Get('lecturas-retrasos/:perfilId/:medidorAscId')
    @MenusProtected(ValidMenu.cobros)
    findLecturasRetrasados(@Param('perfilId', ParseIntPipe) perfilId: number,@Param('medidorAscId', ParseIntPipe) medidorAscId: number){
        return this.multasAguaService.obtenerMesLecturasConRetrasoDePago(perfilId,medidorAscId);
    }
    @Get('medidores-perfil/:id')
    @MenusProtected(ValidMenu.cobros)
    findMedidoresAsociados(@Param('id', ParseIntPipe) id: number){
        return this.multasAguaService.obtenerMedidoresPerfil(id);
    }
    
    @Get('multa-perfil/:id')
    @MenusProtected(ValidMenu.cobros)
    findMulta(@Param('id', ParseIntPipe) id: number){
        return this.multasAguaService.findMulta(id);
    }
    @Get('multas-perfil/:id')
    @MenusProtected(ValidMenu.cobros)
    findMultasIds(@Param('id', ParseIntPipe) perfilId: number,@Query() query: QueryMultasIds){
        return this.multasAguaService.findMultaIds(perfilId,query);
    }
}