import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ComprobantePago, ComprobantePorPago } from './entities';
import { DataSource, In, IsNull, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { AnioSeguimientoLectura } from 'src/medidores-agua/entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from 'src/medidores-agua/entities/mes-seguimiento-registro-lectura.entity';
import { Mes, Monedas } from 'src/interfaces/enum/enum-entityes';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { Afiliado, Perfil } from 'src/auth/modules/usuarios/entities';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MesLectura } from 'src/medidores-agua/entities/mes-lectura.entity';
import { PagosServicesDto } from './dto/pagos-services.dto';
import { SearchPerfil } from 'src/auth/modules/usuarios/querys/search-perfil';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';

@Injectable()
export class PagosDeServicioService {
  constructor(
    // @InjectRepository(PlanillaPagos)
    // private readonly planillasPagosService: Repository<PlanillaPagos>,
    @InjectRepository(ComprobantePorPago)
    private readonly comprobantePorPagarService: Repository<ComprobantePorPago>,
    @InjectRepository(ComprobantePago)
    private readonly comprobantePagoService: Repository<ComprobantePago>,
    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
  ) {}

  
  //* TASK SCHEDULING
  private readonly logger = new Logger(PagosDeServicioService.name);
  private readonly TARIFA_MINIMA = 10;
  private readonly LECTURA_MINIMA = 10;
  private readonly COSTO_ADICIONAL = 2;
  
  // @Cron('15 * * * * *')
  // At 00:00 on day-of-month 7.
  @Cron('0 0 10 * *')
  private async ComprobantesPorPagarAutomatizado() {
    const fechaActual = new Date()
    let gestion = fechaActual.getFullYear();
    let index=fechaActual.getMonth()-1;
    if(fechaActual.getMonth()===0){
      gestion = fechaActual.getFullYear()-1;
      index=11;
    }
    const seguimientoAnioActual = await this.dataSource
      .getRepository(AnioSeguimientoLectura)
      .findOne({
        where: { anio: gestion,meses:{} },
        relations: { meses: true },
      });
    if (!seguimientoAnioActual) {
      this.logger.error(
        `this date ${fechaActual.getFullYear()} not registered`,
      );
      return;
    }
    const month = new Date(gestion,index)
      .toLocaleString('default', { month: 'long' })
      .toUpperCase();
   
    const planQr = this.dataSource
      .getRepository(Afiliado)
      .createQueryBuilder('afiliados');
    try {
      const afiliados = await planQr
        .innerJoinAndSelect(
          'afiliados.medidores',
          'medidor',
          'medidor."afiliadoId" = afiliados.id AND medidor.isActive = true',
        )
        .innerJoinAndSelect(
          'medidor.planillas',
          'planillas',
          'planillas.gestion = :year AND planillas.isActive = true',
          { year: gestion },
        )
        .innerJoinAndSelect(
          'planillas.lecturas',
          'lecturas',
          'lecturas.mesLecturado = :month AND lecturas.isActive = true',
          { month },
        )
        .where('planillas.isActive = true')
        .getMany();
      // console.log(afiliados);
      for (const afiliado of afiliados) {
        for (const medidor of afiliado.medidores) {
          const comprobante = await this.comprobantePorPagarService.findOneBy({
            lectura: { id: medidor.planillas[0].lecturas[0].id },
          });
          if (comprobante) {
            this.logger.warn(
              `el mes lectura ${medidor.planillas[0].lecturas[0].mesLecturado} del medidor de agua con NRO:${medidor.nroMedidor} ya tiene un comprobante por pagar registrado`,
            );
          } else {
            const comprobantePorPagar = this.comprobantePorPagarService.create({
              lectura: medidor.planillas[0].lecturas[0],
              //TODO: MONTO A PAGAR MINIMO ES DE 10 BS SI EL REGISTRO DE LECTURA ES INFERIOR A 10 M3, SE COBRA 2 BS POR CADA M3
              monto:
                medidor.planillas[0].lecturas[0].consumoTotal >
                this.LECTURA_MINIMA
                  ? this.TARIFA_MINIMA +
                    (medidor.planillas[0].lecturas[0].consumoTotal -
                      this.LECTURA_MINIMA) *
                      this.COSTO_ADICIONAL
                  : this.TARIFA_MINIMA,
              motivo: `PAGO DE SERVICIO, GESTION:${gestion}, MES: ${month}`,
              metodoRegistro: 'REGISTRO AUTOMATIZADO',
              moneda: Monedas.Bs,
            });
            try {
              await this.comprobantePorPagarService.save(comprobantePorPagar);
              this.logger.log(`COMPROBANTE DE PAGO REGISTRADO!`);
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

  async comprobantesPorPagarPerfil(idPerfil:number){

    const perfil = await this.dataSource.getRepository(Perfil).findOne({
      where:{id:idPerfil,isActive:true,afiliado:{isActive:true,medidores:{isActive:true,}}},
      select:{id:true,nombrePrimero:true,nombreSegundo:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,isActive:true,profesion:true,
              afiliado:{id:true,isActive:true,ubicacion:{barrio:true,numeroVivienda:true},
                medidores:{id:true,nroMedidor:true,ubicacion:{barrio:true,numeroVivienda:true},
                  planillas:{id:true,gestion:true,isActive:true,
                    lecturas:{id:true,consumoTotal:true,mesLecturado:true,isActive:true,estadoMedidor:true,lectura:true,
                      pagar:{id:true,created_at:true,estado:true,estadoComprobate:true,pagado:true,moneda:true,monto:true,motivo:true,
                        comprobante:{id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,montoPagado:true,nroRecibo:true,},
                        comprobantesAdd:{id:true,estado:true,estadoComprobate:true,fechaPagada:true,metodoRegistro:true,moneda:true,monto:true,motivo:true,pagado:true,
                          comprobante:{id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,montoPagado:true,nroRecibo:true,},}}}
                }}}},
      relations:{afiliado:{medidores:{planillas:{lecturas:{pagar:{comprobantesAdd:{comprobante:true},comprobante:true}}}}}}
    })
    return{
      OK:true,
      message:'Tarifas por pagar de perfil',
      data:perfil
    }
  }
  async pagarComprobantes(pagosDto:PagosServicesDto){
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    
    const perfil = await qb
                          .innerJoinAndSelect('perfil.afiliado','afiliado','afiliado.perfilId = perfil.id AND afiliado.isActive = true')
                          .innerJoinAndSelect('afiliado.medidores','medidor','medidor.afiliadoId = afiliado.id AND medidor.isActive = true')
                          .innerJoinAndSelect('medidor.planillas','planilla','planilla.medidorId = medidor.id')
                          .innerJoinAndSelect('planilla.lecturas','lectura','lectura.planillaId = planilla.id')
                          .innerJoinAndSelect('lectura.pagar','pagar','pagar.pagado = false')
                          /*
                           * AÑADIR COMPROBANTES ADICIONAL A LA CONSULTA 
                           */
                          .where('perfil.id = :id',{id:pagosDto.perfilId})
                          .andWhere('perfil.isActive = true')
                          .getOne();
    if(!perfil) throw new BadRequestException(`Perfil ${pagosDto.perfilId} not found`);
    const pagados: ComprobantePago[]=[];
    const updateComprobantesPagados :ComprobantePorPago[]=[];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    for(const medidor of perfil.afiliado.medidores){
      for(const planilla of medidor.planillas){
        for(const lectura of planilla.lecturas){
          if(!(lectura.pagar.pagado) && pagosDto.comprobantes.includes(lectura.pagar.id)){
            const registroPagado = this.comprobantePagoService.create({
              comprobantePorPagar:lectura.pagar,
              
              entidadPago:'NINGUNO',
              fechaEmitida: new Date(),
              metodoPago:'PAGO POR CAJA - PRESENCIAL',
              montoPagado:lectura.pagar.monto,
              moneda:lectura.pagar.moneda,
              ciTitular:pagosDto.ciTitular,
              titular:pagosDto.titular,
            })
            lectura.pagar.pagado=true;
            lectura.pagar.estadoComprobate='PAGADO';
            lectura.pagar.fechaPagada = registroPagado.fechaEmitida;
            // await queryRunner.manager.save(lectura.pagar);
            updateComprobantesPagados.push(lectura.pagar);
            pagados.push(registroPagado);
          }
        }
      }
    }
    try {
      console.log(pagados);
      await queryRunner.manager.save(pagados)
      await queryRunner.manager.save(updateComprobantesPagados)
      await queryRunner.commitTransaction();
      return {
        OK:true,
        message:'Total pagados',
        data:await this.comprobantePagoService.find({
          where:{id:In(pagados.map(val=>val.id))},
          relations:{
            comprobantePorPagar:true,
          }
        }),
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally{
      await queryRunner.release();
    }
  }
  async ComprobanteDetalles(idLectura: number) {
    const lecturaPorPagar = await this.dataSource.getRepository(MesLectura).findOne({
      where: { id:idLectura},
      relations: { pagar:{comprobante:true} },
      select:{
        consumoTotal:true,created_at:true,estadoMedidor:true,id:true,isActive:true,lectura:true,mesLecturado:true,
        pagar: {created_at:true,estado:true,estadoComprobate:true,fechaPagada:true,id:true,metodoRegistro:true,moneda:true,monto:true,motivo:true,pagado:true,
          comprobante:{created_at:true,entidadPago:true,fechaEmitida:true,id:true,metodoPago:true,montoPagado:true,nroRecibo:true,},
        },
      }
    });
    if (!lecturaPorPagar)
      throw new BadRequestException(
        `la lectura: ${idLectura} no fue encontrada`,
      );
    return {
      OK: true,
      message: 'lectura con comprobante de pago ',
      data: lecturaPorPagar,
    };
  }
  async generarComprobantes(){
    const fechaActual = new Date()
    let gestion = fechaActual.getFullYear();
    let index=fechaActual.getMonth()-1;
    if(fechaActual.getMonth()===0){
      gestion = fechaActual.getFullYear()-1;
      index=11;
    }
    const mes=index===0?Mes.enero
    :index===1?Mes.febrero
    :index===2?Mes.marzo
    :index===3?Mes.abril
    :index===4?Mes.mayo
    :index===5?Mes.junio
    :index===6?Mes.julio
    :index===7?Mes.agosto
    :index===8?Mes.septiembre
    :index===9?Mes.octubre
    :index===10?Mes.noviembre
    :index===11?Mes.diciembre
    :Mes.enero;
    const month = new Date(gestion,index).toLocaleString('default', { month: 'long' }).toUpperCase();
    const mesRegistrar = await this.dataSource.getRepository(MesSeguimientoRegistroLectura).findOne({
      where:[
        {
          mes,
          anioSeguimiento:{
            anio:gestion,
          }
        },
      ],relations:{anioSeguimiento:true}
    })
    if(!mesRegistrar) throw new BadRequestException(`Mes no registrado ${month} año ${gestion}`);
    if(fechaActual.getTime()<=mesRegistrar.fechaRegistroLecturas.getTime() || fechaActual.getTime()>= mesRegistrar.fechaFinRegistroLecturas.getTime())
    throw new BadRequestException(`No se encuentra en el rango de fecha establecida permitada para generar los comprobantes`)
  
    const planillasLecturas = await this.dataSource.getRepository(PlanillaLecturas)
            .find({where:
              {gestion:mesRegistrar.anioSeguimiento.anio,
                lecturas:{mesLecturado:mesRegistrar.mes,isActive:true},
                isActive:true},
            relations:{lecturas:{pagar:true}}});
    const lecturas:MesLectura[]=[];
    planillasLecturas.forEach(plan=>{
      plan.lecturas.forEach(lect=>{
        
        if(lect.pagar===null)
        lecturas.push(lect);
      })
    })
    const comprobantesGenerados:ComprobantePorPago[]=[];
    for(const lectu of lecturas){
      const comp = this.comprobantePorPagarService.create({
        lectura:lectu,
        metodoRegistro:'GENERADO POR LA CAJA',
        monto:lectu.consumoTotal >this.LECTURA_MINIMA
                ? this.TARIFA_MINIMA +(lectu.consumoTotal -this.LECTURA_MINIMA) *this.COSTO_ADICIONAL
                : this.TARIFA_MINIMA,
        motivo: `PAGO DE SERVICIO, GESTION:${gestion}, MES: ${month}`,
        moneda: Monedas.Bs,
      })
      try {
        await this.comprobantePorPagarService.save(comp);
        comprobantesGenerados.push(comp);
      } catch (error) {
        this.logger.error('error al registrar un comprobante',error);
      }
    }
    return {
      OK:true,
      message:'Comprobantes creados con exito',
      data:comprobantesGenerados.length,
    };
  }
  async findAllPefiles(paginationDto: SearchPerfil) {
    const { offset = 0, limit = 10, order = 'ASC', q = '' } = paginationDto;
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    const { '0': data, '1': size } = await qb
      .innerJoinAndSelect(
        'perfil.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfil.id',
      ).innerJoinAndSelect(
        'afiliado.medidores',
        'medidores',
        'medidores."afiliadoId" = afiliado.id'
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
    return {
      OK: true,
      message: 'listado de afiliados con medidores asignados',
      data: {
        data,
        size,
        offset,
        limit,
        order,
      },
    };
  }
  async comprobantesPorPagarAfiliado(idPerfil:number){
    const perfil = await this.dataSource.getRepository(Perfil).findOne({
      where:{id:idPerfil,isActive:true},
      select:{id:true,nombrePrimero:true,nombreSegundo:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,isActive:true,profesion:true,
              afiliado:{id:true,isActive:true,ubicacion:{barrio:true,numeroVivienda:true},
                medidores:{id:true,nroMedidor:true,ubicacion:{barrio:true,numeroVivienda:true},
                //   planillas:{id:true,gestion:true,isActive:true,
                //     lecturas:{id:true,consumoTotal:true,mesLecturado:true,isActive:true,estadoMedidor:true,lectura:true,
                //       pagar:{id:true,created_at:true,estado:true,estadoComprobate:true,pagado:true,moneda:true,monto:true,motivo:true,
                //         comprobante:{id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,montoPagado:true,nroRecibo:true,},
                //         comprobantesAdd:{id:true,estado:true,estadoComprobate:true,fechaPagada:true,metodoRegistro:true,moneda:true,monto:true,motivo:true,pagado:true,
                //           comprobante:{id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,montoPagado:true,nroRecibo:true,},}}}
                // }
              }}},
      relations:{afiliado:{medidores:true}}
    })
    if(!perfil || !perfil.isActive) throw new BadRequestException(`Perfil ${idPerfil} not found`);
    if(!perfil.afiliado || !perfil.afiliado.isActive) throw new BadRequestException(`The perfil isn't afiliado`);
    if(perfil.afiliado.medidores.length===0) throw new BadRequestException(`The perfil not have medidores de agua`)
    const perfilSend = {}
    for(const medidor of perfil.afiliado.medidores){
      // for(const planilla of medidor.planillas){
      //   for(const lectura of planilla.lecturas){
      //     if(lectura.pagar && !lectura.pagar.pagado){

      //     }
      //   }
      // }
      const deudas = await this.dataSource.getRepository(PlanillaLecturas).find({
        where:{
          medidor:{id:medidor.id},
          lecturas:{pagar:{pagado:false}},
        },
        select:{
          gestion:true,id:true,lecturas:{estadoMedidor:true,id:true,lectura:true,mesLecturado:true,consumoTotal:true,pagar:{id:true,metodoRegistro:true,moneda:true,monto:true,motivo:true,pagado:true,created_at:true,estadoComprobate:true}}
        },
        relations:{
          lecturas:{
            pagar:true
          }
        }
      })
      // console.log(deudas);
      medidor.planillas=deudas;
    }
    return{
      OK:true,
      message:'Tarifas por pagar de perfil',
      data:perfil
    }

  }
  async findPerfil(id:number){
    const perfil = await this.dataSource.getRepository(Perfil).findOne(
      {
        where:{id},
        select:{
          id:true,isActive:true,nombrePrimero:true,nombreSegundo:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,contacto:true,direccion:true,
          afiliado:{
            id:true,
            isActive:true,
            ubicacion:{
              barrio:true,
              numeroVivienda:true,
            },
            medidores:{
              id:true,
              isActive:true,
              nroMedidor:true,
            }
          }
        },
        relations:{afiliado:{medidores:true}}
      })
    if(!perfil.isActive) throw new BadRequestException(`This perfil isn't activated, please select another perfil or contact  the administrator`)
    if(!perfil.afiliado) throw new BadRequestException(`This perfil is'nt afiliado,`)
    return {
      OK:true,
      message:'perfil con medidores',
      data:perfil,
  } 
  }
  async findPerfilMedidorHistory(idPerfil:number,nroMedidor:string){
    const planillas = await this.dataSource.getRepository(PlanillaLecturas).find({
      where:{
        medidor:{
          nroMedidor,
          afiliado:{
            perfil:{
              id:idPerfil
            }
          }
        }
      },
      select:{
          gestion:true,
          id:true,
      }
    })
    if(!planillas) throw new BadRequestException(`Medidor no encontrado o no pertenece al perfil`)
    return {
      OK:true,
      message:'planillas del medidor',
      data:planillas
  };
  }
  async historialCobros(nroMedidor:string,idPlanilla:number){
    const lecturas = await this.dataSource.getRepository(MesLectura).find({
      where:{
        planilla:{
          id:idPlanilla,
          medidor:{
            nroMedidor,
          }
        },
        pagar:{
          pagado:true,
        }
      },
      // select:{
      //   consumoTotal:true,
      //   estado:true,
      //   created_at:true,
      //   estadoMedidor:true,
      //   id:true,isActive:true,
      //   lectura:true,
      //   mesLecturado:true,
      //   pagar:{
      //     estadoComprobate:true,
      //     estado:true,
      //     fechaPagada:true,
      //     id:true,
      //     metodoRegistro:true,
      //     moneda:true,
      //     monto:true,
      //     motivo:true,
      //     pagado:true,
      //     comprobante:{
      //       ciTitular:true,
      //       created_at:true,
      //       entidadPago:true,
      //       fechaEmitida:true,
      //       id:true,
      //       metodoPago:true,
      //       moneda:true,
      //       montoPagado:true,
      //       nroRecibo:true,
      //       titular:true,
      //     }
      //   }
      // },
      relations:{
        pagar:{
          comprobante:true,
        }
      }
    })
    return {
      OK:true,
      message:'lecturas de planilla',
      data:lecturas};
  }
}
