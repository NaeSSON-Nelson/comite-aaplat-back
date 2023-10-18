import { Injectable, Logger } from '@nestjs/common';
import {BadRequestException} from '@nestjs/common/exceptions'
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ComprobantePago, ComprobantePorPago, PlanillaPagos } from './entities';
import { DataSource, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { AnioSeguimientoLectura } from 'src/medidores-agua/entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from 'src/medidores-agua/entities/mes-seguimiento-registro-lectura.entity';
import { Mes, Monedas } from 'src/interfaces/enum/enum-entityes';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { Afiliado, Perfil } from 'src/auth/modules/usuarios/entities';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PagosDeServicioService {
    constructor(
    @InjectRepository(PlanillaPagos)
    private readonly planillasPagosService: Repository<PlanillaPagos>,
    @InjectRepository(ComprobantePorPago)
    private readonly comprobantePorPagarService: Repository<ComprobantePorPago>,
    @InjectRepository(ComprobantePago)
    private readonly comprobantePagoService: Repository<ComprobantePago>,
    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
    ){}
  
    async findAllAfiliadosWidthPlanillasDePagos(paginationDto: PaginationDto) {
      const { offset = 0, limit = 10, order = 'ASC', q = '' } = paginationDto;
      // console.log(paginationDto);
      const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
      const { '0': data, '1': size } = await qb
        .innerJoinAndSelect(
          'perfil.afiliado',
          'afiliado',
          'afiliado."perfilId" = perfil.id',
        )
        .innerJoin(
          'afiliado.planillasPagos',
          'planillas',
          'planillas."afiliadoId" = afiliado.id',
        )
        .where('perfil.nombre_primero LIKE :query', { query: `${q}%` })
        .orWhere('perfil.nombre_segundo LIKE :query', { query: `${q}%` })
        .orWhere('perfil.apellido_primero LIKE :query', { query: `${q}%` })
        .orWhere('perfil.apellido_segundo LIKE :query', { query: `${q}%` })
        .orWhere('perfil.cedula_identidad LIKE :query', { query: `${q}%` })
        .offset(offset)
        .limit(limit)
        .orderBy('perfil.id', 'ASC')
        .getManyAndCount();
      // console.log(data,size);
      return {
        OK: true,
        message: 'listado de afiliados con planillas de pagos',
        data: {
          data,
          size,
          offset,
          limit,
          order,
        },
      };
    }
    async afiliadoWidthPlanillasPagos(idPerfil:number){

      const perfil = await this.dataSource.getRepository(Perfil).createQueryBuilder('perfil')
                              .innerJoinAndSelect(
                                'perfil.afiliado',
                                'afiliado',
                                'afiliado."perfilId" = perfil.id',
                              )
                              .where('perfil.id = :idPerfil',{idPerfil})
                              .getOne();
      if(!perfil) throw new BadRequestException(`perfil no encontrado!`);
      if(!perfil.isActive) throw new BadRequestException(`el perfil se encuentra deshabilitado!`);
      else if(!perfil.afiliado.isActive) throw new BadRequestException(`La afiliacion se encuentra deshabilidad del perfil ${perfil.nombrePrimero} ${perfil.apellidoPrimero} width id: ${perfil.id}`);
      return{
        OK:true,
        message:`perfil encontrado`,
        data:perfil,
      } 
    }
//* TASK SCHEDULING
private readonly logger = new Logger(PagosDeServicioService.name);
private readonly TARIFA_MINIMA = 10;
private readonly LECTURA_MINIMA = 10;
private readonly COSTO_ADICIONAL = 2;
//@Cron('15 * * * * *')
@Cron(CronExpression.EVERY_YEAR)
private async registrarPlanillasDeMedidores(){
    const yearAct = new Date().getFullYear();
      const afiliados = await this.dataSource.getRepository(Afiliado).find({where:{isActive:true}});
      //this.logger.verbose(afiliados,'papitas :3');
      for(const afiliado of afiliados){
          const planillaExist = await this.planillasPagosService.findOneBy({gestion:yearAct,afiliado:{id:afiliado.id}});
          if(planillaExist){
            this.logger.warn(`Planilla de pago ${yearAct} del afiliado ${afiliado.id} ya existe`);
          }else{
            const planilla = this.planillasPagosService.create({gestion:yearAct,afiliado});
            try {
              await this.planillasPagosService.save(planilla);
              this.logger.log(`Planilla de pago ${yearAct} afiliad creada!!`);
            } catch (error) {
              this.logger.warn('OCURRIO UN ERROR AL REGISTRAR');
              this.logger.warn(error);
            }
          }
        
      }

      //this.logger.error(`Year ${yearAct} no registered!`)
    
  }
  
    // @Cron('15 * * * * *')
    // At 00:00 on day-of-month 7.
    @Cron('0 0 7 * *')
    private async ComprobantesPorPagarAutomatizado(){
        const fechaActual = new Date(new Date().getFullYear(),new Date().getMonth()-1);
        const seguimientoAnioActual = await this.dataSource.getRepository(AnioSeguimientoLectura).findOne({where:{anio:fechaActual.getFullYear()},relations:{meses:true}});
        if(!seguimientoAnioActual){
          this.logger.error(`this date ${fechaActual.getFullYear()} not registered`); 
          return;
        }
        const month = fechaActual.toLocaleString('default', { month: 'long' }).toUpperCase();
        const seguimientoMesAnterior = seguimientoAnioActual.meses.find(
          mes=>mes.mes === (month.includes('ENERO')?Mes.enero:
                month.includes('FEBRERO')?Mes.febrero:
                month.includes('MARZO')?Mes.marzo:
                month.includes('ABRIL')?Mes.abril:
                month.includes('MAYO')?Mes.mayo:
                month.includes('JUNIO')?Mes.junio:
                month.includes('JULIO')?Mes.julio:
                month.includes('AGOSTO')?Mes.agosto:
                month.includes('SEPTIEMBRE')?Mes.septiembre:
                month.includes('OCTUBRE')?Mes.octubre:
                month.includes('NOVIEMBRE')?Mes.noviembre:
                month.includes('DICIEMBRE')?Mes.diciembre:
                Mes.enero))
        if(!seguimientoMesAnterior) {
          this.logger.warn(`month ${seguimientoMesAnterior} not exist for ${fechaActual.getFullYear()}`);
          return;
        }
        const planQr = this.dataSource.getRepository(Afiliado).createQueryBuilder('afiliados');
        try {
          
          const afiliados = await planQr
          .innerJoinAndSelect('afiliados.medidores','medidor','medidor."afiliadoId" = afiliados.id')
          .innerJoinAndSelect('afiliados.planillasPagos','planillasPagos','planillasPagos.gestion = :year',{year:fechaActual.getFullYear()})
          .innerJoinAndSelect('medidor.planillas','planillas','planillas.gestion = :year',{year:fechaActual.getFullYear()})
          .innerJoinAndSelect('planillas.lecturas','lecturas','lecturas.mesLecturado = :month',{month})                                        
          .where('planillas.gestion = :year',{year:fechaActual.getFullYear()})                                               
          .andWhere('planillas.isActive = true')
          .getMany();
          // console.log(afiliados);  
          for(const afiliado of afiliados){
            
            for(const medidor of afiliado.medidores){
              const comprobante = await this.comprobantePorPagarService.findOneBy({lectura:{id:medidor.planillas[0].lecturas[0].id}});
              if(comprobante){
                this.logger.warn(`el mes lectura ${medidor.planillas[0].lecturas[0].mesLecturado} del medidor de agua con NRO:${medidor.nroMedidor} ya tiene un comprobante por pagar registrado`);
              }else{
                const comprobantePorPagar = this.comprobantePorPagarService.create(
                  { lectura:medidor.planillas[0].lecturas[0],
                    planilla:afiliado.planillasPagos[0],
                    //TODO: MONTO A PAGAR MINIMO ES DE 10 BS SI EL REGISTRO DE LECTURA ES INFERIOR A 10 M3, SE COBRA 2 BS POR CADA M3
                    monto:medidor.planillas[0].lecturas[0].consumoTotal>this.LECTURA_MINIMA?
                    this.TARIFA_MINIMA+(medidor.planillas[0].lecturas[0].consumoTotal-this.LECTURA_MINIMA)*this.COSTO_ADICIONAL:
                    this.TARIFA_MINIMA,
                    motivo:`PAGO DE SERVICIO, GESTION:${medidor.planillas[0].gestion}, MES: ${medidor.planillas[0].lecturas[0].mesLecturado}`,
                    metodoRegistro:'REGISTRO AUTOMATIZADO',
                    moneda:Monedas.Bs,
                  });
                  try {
                    await this.comprobantePorPagarService.save(comprobantePorPagar)
                    this.logger.log(`COMPROBANTE DE PAGO REGISTRADO!`)
                  } catch (error) {
                    this.logger.error(error);
                  }
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
        }
}
