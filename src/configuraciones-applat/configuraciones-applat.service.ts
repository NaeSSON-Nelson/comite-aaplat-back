import { Injectable, NotFoundException } from '@nestjs/common';
import { TarifaPorConsumoAgua } from './entities/tarifa-por-consumo-agua';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TarifaMultaPorRetrasosPagos } from './entities/tarifa-multa-por-retrasos-pagos';
import { BeneficiarioDescuentos } from './entities/beneficiario-descuentos';
import { NuevaTarifaPorConsumoAguaDto } from './dto/nueva-tarifa-por-consumo-agua.dto';
import { CommonService } from 'src/common/common.service';
import { Estado } from 'src/interfaces/enum/enum-entityes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { NuevaTarifaMultaPorRetrasosPagosDto } from './dto/nueva-tarifa-multa-por-retrasos-pagos.dto';
import { NuevoBeneficiarioDescuentoDto } from './dto/nuevo-beneficiario-descuentos.dto';
import { UpdateBeneficiarioDescuentosDto } from './dto/update-beneficiario-descuentos.dto';
import { ModificarTarifaPorConsumoDto } from './dto/modificar-tarifa-por-consumo-agua.dto';
import { ModificarTarifaMultaPorRetrasoPagosDto } from './dto/modificar-tarifa-multa-por-retrasos-pagos.dto';

@Injectable()
export class ConfiguracionesApplatService {
 
  
  constructor(
    @InjectRepository(TarifaPorConsumoAgua)
    private readonly tarifaPorConsumoRepositoyService: Repository<TarifaPorConsumoAgua>,
    @InjectRepository(TarifaMultaPorRetrasosPagos)
    private readonly tarifaMultaPorRetrasosPagosRepositoyService: Repository<TarifaMultaPorRetrasosPagos>,
    @InjectRepository(BeneficiarioDescuentos)
    private readonly beneficiarioDescuentosRepositoyService: Repository<BeneficiarioDescuentos>,
    
    private readonly commonService: CommonService,
  ){}

  //FUNCIONES PARA TARIFA DE POR CONSUMO DE AGUA
  async createNuevaTarifaPorConsumoAgua(nuevaTarifaDto:NuevaTarifaPorConsumoAguaDto){
    // const {}=nuevaTarifaDto;
    const nuevaTarifa = this.tarifaPorConsumoRepositoyService.create({
      ...nuevaTarifaDto
    });
    try {
      await this.tarifaPorConsumoRepositoyService.save(nuevaTarifa);
      return {
        OK:true,
        message:'Tarifa de pago por consumo de agua registrado correctamente!'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async modificarTarifaPorConsumoAgua(idTarifa:number,modificarNuevaTarifaDto:ModificarTarifaPorConsumoDto){
    // const {}=nuevaTarifaDto;
    const tarifaModified = await this.tarifaPorConsumoRepositoyService.preload({
      id:idTarifa,
      ...modificarNuevaTarifaDto
    });
    console.log('modifcando',tarifaModified);
    if(!tarifaModified) throw new NotFoundException(`Tarifa no encontrada`);
    try {
      await this.tarifaPorConsumoRepositoyService.save(tarifaModified);
      return {
        OK:true,
        message:'Tarifa de consumo modificada correctamente!'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async updateStatusTarifaPorConsumoAgua(idTarifa:number){
    const tarifa = await this.tarifaPorConsumoRepositoyService.findOneBy({id:idTarifa});
    if(!tarifa) throw new NotFoundException(`Tarifa con numero ${idTarifa} no encontrado`);
    try {
      await this.tarifaPorConsumoRepositoyService.update(tarifa.id,{isActive:!tarifa.isActive,estado:tarifa.isActive?Estado.DESHABILITADO:Estado.ACTIVO});
      return{
        OK:true,
        message:'Actualización de estado a la tarifa por consumo de agua'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async listarTarifasPorConsumoAgua(paginationDto:PaginationDto){
    const {limit=10,offset=0} =paginationDto;
    const {"0":data,"1":size} = await this.tarifaPorConsumoRepositoyService.findAndCount({
      order:{
        id:'DESC'
      },
      take:limit,
      skip:offset
    });

    return{
      OK:true,
      message:'lista de tarifas por paginación',
      data:{
        data,
        size,
        limit,
        offset
      }
    }
  }
  //FUNCIONES PARA TARIFA MULTA POR RETRASO DE PAGOS DE SERVICIO
  async createNuevaTarifaMultaPorRetrasosPagos(nuevaTarifaDto:NuevaTarifaMultaPorRetrasosPagosDto){
    // const {}=nuevaTarifaDto;
    const nuevaTarifa = this.tarifaMultaPorRetrasosPagosRepositoyService.create({
      ...nuevaTarifaDto
    });
    try {
      await this.tarifaMultaPorRetrasosPagosRepositoyService.save(nuevaTarifa);
      return {
        OK:true,
        message:'Tarifa de multa por retraso de pago de servicio creado correctamente!'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async modificarTarifaMultaPorRetrasosPagos(idTarifa:number,modificarTarifaDto:ModificarTarifaMultaPorRetrasoPagosDto){
    // const {}=nuevaTarifaDto;
    const nuevaTarifa = await this.tarifaMultaPorRetrasosPagosRepositoyService.preload({
      id:idTarifa,
      ...modificarTarifaDto
    });
    if(!nuevaTarifa) throw new NotFoundException(`Tarifa no encontrada`);
    try {
      await this.tarifaMultaPorRetrasosPagosRepositoyService.save(nuevaTarifa);
      return {
        OK:true,
        message:'Tarifa de multa por retrasos de pagos modificada correctamente!'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async updateStatusTarifaMultaPorRetrasoPagos(idTarifa:number){
    const tarifa = await this.tarifaMultaPorRetrasosPagosRepositoyService.findOneBy({id:idTarifa});
    if(!tarifa) throw new NotFoundException(`Tarifa con numero ${idTarifa} no encontrado`);
    try {
      await this.tarifaMultaPorRetrasosPagosRepositoyService.update(tarifa.id,{isActive:!tarifa.isActive,estado:tarifa.isActive?Estado.DESHABILITADO:Estado.ACTIVO});
      return{
        OK:true,
        message:'Actualización de estado a la tarifa de multa por retraso de pago de servicio'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async listarTarifasMultasPorRetrasosPagos(paginationDto:PaginationDto){
    const {limit=10,offset=0} =paginationDto;
    const {"0":data,"1":size} = await this.tarifaMultaPorRetrasosPagosRepositoyService.findAndCount({
      order:{
        id:'DESC'
      },
      take:limit,
      skip:offset
    });

    return{
      OK:true,
      message:'lista de tarifas por paginación',
      data:{
        data,
        size,
        limit,
        offset
      }
    }
  }
  // NUEVO BENEFICAIRIOS DESCUENTOS
  async registrarNuevoBeneficiarioDescuentos(beneficiarioDto:NuevoBeneficiarioDescuentoDto){
    // const {}=nuevaTarifaDto;
    const beneficiario= this.beneficiarioDescuentosRepositoyService.create({
      ...beneficiarioDto
    });
    try {
      await this.beneficiarioDescuentosRepositoyService.save(beneficiario);
      return {
        OK:true,
        message:'Nuevo tipo de beneficario registrado correctamente!'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async obtenerTipoBeneficiario(idBeneficiario: number) {
    const beneficiario = await this.beneficiarioDescuentosRepositoyService.findOneBy({id:idBeneficiario});
    if(!beneficiario) throw new NotFoundException(`Tipo beneficiario ${idBeneficiario} no encontrado`);
    return{
      OK:true,
      message:'Beneficiario escontrado',
      data:beneficiario
    }
  }
  async updateBeneficiario(idBeneficiario:number,beneficiarioUpdateDto:UpdateBeneficiarioDescuentosDto){
    const beneficiario = await this.beneficiarioDescuentosRepositoyService.preload({
      id:idBeneficiario,
      ...beneficiarioUpdateDto
    });
    if(!beneficiario) throw new NotFoundException(`Beneficiario con numero ${idBeneficiario} no encontrado`);
    try {
      await this.beneficiarioDescuentosRepositoyService.save(beneficiario);
      return{
        OK:true,
        message:`Datos del beneficiario ${beneficiario.tipoBeneficiario} actualizados`
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async updateStatusBeneficiario(idBeneficiario:number){
    const beneficiario = await this.beneficiarioDescuentosRepositoyService.findOneBy({id:idBeneficiario});
    if(!beneficiario) throw new NotFoundException(`Beneficiario ${idBeneficiario} no fue encontrado o no esta registrado`);
    try {
      await this.beneficiarioDescuentosRepositoyService.update(beneficiario.id,{isActive:!beneficiario.isActive,estado:beneficiario.isActive?Estado.DESHABILITADO:Estado.ACTIVO});
      return{
        OK:true,
        message:'Actualización de estado del tipo de beneficiario'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async listarTiposBeneficiarios(paginationDto:PaginationDto){
    const {limit=10,offset=0} =paginationDto;
    const {"0":data,"1":size} = await this.beneficiarioDescuentosRepositoyService.findAndCount({
      order:{
        id:'DESC'
      },
      take:limit,
      skip:offset
    });

    return{
      OK:true,
      message:'lista de tipos de beneficarios por paginación',
      data:{
        data,
        size,
        limit,
        offset
      }
    }
  }

}
