import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ComprobanteDePagoDeMultas, ComprobantePago, ComprobantePorPago, MultaServicio } from './entities';
import { DataSource, FindOptionsOrder, FindOptionsWhere, ILike, In, IsNull, LessThanOrEqual, Like, MoreThanOrEqual, Repository, OrderByCondition, Brackets} from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { AnioSeguimientoLectura } from 'src/medidores-agua/entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from 'src/medidores-agua/entities/mes-seguimiento-registro-lectura.entity';
import { Mes, Monedas, RetrasoTipo } from 'src/interfaces/enum/enum-entityes';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { Afiliado, Perfil } from 'src/auth/modules/usuarios/entities';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PlanillaMesLectura } from 'src/medidores-agua/entities/planilla-mes-lectura.entity';
import { PagosServicesDto } from './dto/pagos-services.dto';
import { SearchPerfil } from 'src/auth/modules/usuarios/querys/search-perfil';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { FechasParametrosDto } from './dto/fechas-parametros.dto';
import { RetrasosPagosDto } from './dto/retrasos-pagos.dto';

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
          'afiliados.medidorAsociado',
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
          'lecturas.PlanillaMesLecturar = :month AND lecturas.isActive = true',
          { month },
        )
        .where('planillas.isActive = true')
        .getMany();
      // console.log(afiliados);
      // for (const afiliado of afiliados) {
      //   for (const medidor of afiliado.medidorAsociado) {
      //     const comprobante = await this.comprobantePorPagarService.findOneBy({
      //       lectura: { id: medidor.planillas[0].lecturas[0].id },
      //     });
      //     if (comprobante) {
      //       this.logger.warn(
      //         `el mes lectura ${medidor.planillas[0].lecturas[0].PlanillaMesLecturar} del medidor de agua con NRO:${medidor.medidor.nroMedidor} ya tiene un comprobante por pagar registrado`,
      //       );
      //     } else {
      //       const comprobantePorPagar = this.comprobantePorPagarService.create({
      //         lectura: medidor.planillas[0].lecturas[0],
      //         //TODO: MONTO A PAGAR MINIMO ES DE 10 BS SI EL REGISTRO DE LECTURA ES INFERIOR A 10 M3, SE COBRA 2 BS POR CADA M3
      //         monto:
      //           medidor.planillas[0].lecturas[0].consumoTotal >
      //           this.LECTURA_MINIMA
      //             ? this.TARIFA_MINIMA +
      //               (medidor.planillas[0].lecturas[0].consumoTotal -
      //                 this.LECTURA_MINIMA) *
      //                 this.COSTO_ADICIONAL
      //             : this.TARIFA_MINIMA,
      //         motivo: `PAGO DE SERVICIO, GESTION:${gestion}, MES: ${month}`,
      //         metodoRegistro: 'REGISTRO AUTOMATIZADO',
      //         moneda: Monedas.Bs,
      //       });
      //       try {
      //         await this.comprobantePorPagarService.save(comprobantePorPagar);
      //         this.logger.log(`COMPROBANTE DE PAGO REGISTRADO!`);
      //       } catch (error) {
      //         this.logger.error(error);
      //       }
      //     }
      //   }
      // }
    } catch (error) {
      console.log(error);
    }
  }

  async comprobantesPorPagarPerfil(idPerfil:number){

    const perfil = await this.dataSource.getRepository(Perfil).findOne({
      where:{id:idPerfil,isActive:true,afiliado:{isActive:true,medidorAsociado:{isActive:true,}}},
      select:{id:true,nombrePrimero:true,nombreSegundo:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,isActive:true,profesion:true,
              afiliado:{id:true,isActive:true,ubicacion:{barrio:true,numeroVivienda:true},
                medidorAsociado:{
                  ubicacion:{barrio:true,numeroVivienda:true},
                  planillas:{id:true,gestion:true,isActive:true,
                    lecturas:{id:true,consumoTotal:true,PlanillaMesLecturar:true,isActive:true,estadoMedidor:true,lectura:true,
                      pagar:{id:true,created_at:true,estado:true,estadoComprobate:true,pagado:true,moneda:true,monto:true,motivo:true,
                        comprobante:{id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,montoPagado:true,nroRecibo:true,},}}
                },
                medidor:{id:true,nroMedidor:true,
              }}},

                },
      relations:{afiliado:{medidorAsociado :{medidor:true,planillas:{lecturas:{pagar:{comprobante:true}}}}}}
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
                          .innerJoinAndSelect('afiliado.medidorAsociado','medidor','medidor.afiliadoId = afiliado.id AND medidor.isActive = true')
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
    const multasPerfil = await this.dataSource.getRepository(MultaServicio).find({
      where:{
        medidorAsociado:{
          afiliado:{
            perfil:{
              id:perfil.id
            }
          }
        },
        id:In(pagosDto.multas),
        pagado:false,
      },
      relations:{
        lecturasMultadas:true
      },
    })
    console.log('mutlas de perfil',multasPerfil);
    const pagados: ComprobantePago[]=[];
    const updateComprobantesPagados :ComprobantePorPago[]=[];
    const planillasValidMultas:PlanillaLecturas[]=[];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    for(const medidorAsc of perfil.afiliado.medidorAsociado){
      for(const planilla of medidorAsc.planillas){
        planillasValidMultas.push(planilla);
        for(const lectura of planilla.lecturas){
          if(!(lectura.pagar.pagado) && pagosDto.comprobantes.includes(lectura.pagar.id)){
            const registroPagado = this.comprobantePagoService.create({
              comprobantePorPagar:lectura.pagar,
              
              entidadPago:'NINGUNO',
              fechaEmitida: new Date(),
              metodoPago:'PAGO POR CAJA - PRESENCIAL',
              montoPagado:lectura.pagar.monto,
              moneda:lectura.pagar.moneda,
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
    const comprobanteMultas:ComprobanteDePagoDeMultas[]=[];
    
    for(const multa of multasPerfil){
      let totalMultas:number=0;
      for(const gest of planillasValidMultas){
        for(const lctMult of multa.lecturasMultadas){
          console.log('lectura de multa:',lctMult);
          console.log('lectura de gestion:',gest.lecturas);
          const lt = gest.lecturas.find(res=>res.id===lctMult.id);
          console.log('hay lecto lt:',lt);
          if(lt){
            totalMultas++;
          }
        }
      }
      if(totalMultas !== multa.lecturasMultadas.length) throw new BadRequestException(`NO SE ENCUENTRAN TODAS LAS LECTURAS MULTADAS DE LA MULTA ENVIADA PARA PAGAR.`)
      const comprobanteMulta = queryRunner.manager.create(ComprobanteDePagoDeMultas,{
        fechaEmitida: new Date(),
        metodoPago:'PAGO POR CAJA - PRESENCIAL',
        entidadPago:'NINGUNO',
        montoPagado:multa.monto,
        moneda:multa.moneda,
        multaServicio:multa
    })
    comprobanteMultas.push(comprobanteMulta);
    await queryRunner.manager.update(MultaServicio,multa.id,{pagado:true});
    }
    try {
      // console.log(pagados);
      await queryRunner.manager.save(pagados);
      await queryRunner.manager.save(comprobanteMultas);
      await queryRunner.manager.save(updateComprobantesPagados);
      await queryRunner.commitTransaction();
      return {
        OK:true,
        message:'RESULT PAGE',
        data: await this.findPlanillasMultasById(pagados,comprobanteMultas)
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally{
      await queryRunner.release();
    }
  }
  async ComprobanteDetalles(idLectura: number) {
    const lecturaPorPagar = await this.dataSource.getRepository(PlanillaMesLectura).findOne({
      where: { id:idLectura},
      relations: { pagar:{comprobante:true} },
      select:{
        consumoTotal:true,created_at:true,estadoMedidor:true,id:true,isActive:true,lectura:true,PlanillaMesLecturar:true,estado:true,medicion:true,
        pagar: {created_at:true,estado:true,estadoComprobate:true,fechaPagada:true,id:true,metodoRegistro:true,moneda:true,monto:true,fechaLimitePago:true,motivo:true,pagado:true,
          comprobante:{created_at:true,entidadPago:true,fechaEmitida:true,id:true,metodoPago:true,montoPagado:true,nroRecibo:true,moneda:true,},
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
  // async generarComprobantes(){
  //   const fechaActual = new Date()
  //   let gestion = fechaActual.getFullYear();
  //   let index=fechaActual.getMonth()-1;
  //   if(fechaActual.getMonth()===0){
  //     gestion = fechaActual.getFullYear()-1;
  //     index=11;
  //   }
  //   const mes=index===0?Mes.enero
  //   :index===1?Mes.febrero
  //   :index===2?Mes.marzo
  //   :index===3?Mes.abril
  //   :index===4?Mes.mayo
  //   :index===5?Mes.junio
  //   :index===6?Mes.julio
  //   :index===7?Mes.agosto
  //   :index===8?Mes.septiembre
  //   :index===9?Mes.octubre
  //   :index===10?Mes.noviembre
  //   :index===11?Mes.diciembre
  //   :Mes.enero;
  //   const month = new Date(gestion,index).toLocaleString('default', { month: 'long' }).toUpperCase();
  //   const mesRegistrar = await this.dataSource.getRepository(MesSeguimientoRegistroLectura).findOne({
  //     where:[
  //       {
  //         mes,
  //         anioSeguimiento:{
  //           anio:gestion,
  //         }
  //       },
  //     ],relations:{anioSeguimiento:true}
  //   })
  //   if(!mesRegistrar) throw new BadRequestException(`Mes no registrado ${month} año ${gestion}`);
  //   if(fechaActual.getTime()<=mesRegistrar.fechaRegistroLecturas.getTime() || fechaActual.getTime()>= mesRegistrar.fechaFinRegistroLecturas.getTime())
  //   throw new BadRequestException(`No se encuentra en el rango de fecha establecida permitada para generar los comprobantes`)
  
  //   const planillasLecturas = await this.dataSource.getRepository(PlanillaLecturas)
  //           .find({where:
  //             {gestion:mesRegistrar.anioSeguimiento.anio,
  //               lecturas:{PlanillaMesLecturar:mesRegistrar.mes,isActive:true},
  //               isActive:true},
  //           relations:{lecturas:{pagar:true}}});
  //   const lecturas:PlanillaMesLectura[]=[];
  //   planillasLecturas.forEach(plan=>{
  //     plan.lecturas.forEach(lect=>{
        
  //       if(lect.pagar===null)
  //       lecturas.push(lect);
  //     })
  //   })
  //   const comprobantesGenerados:ComprobantePorPago[]=[];
  //   for(const lectu of lecturas){
  //     const comp = this.comprobantePorPagarService.create({
  //       lectura:lectu,
  //       metodoRegistro:'GENERADO POR LA CAJA',
  //       monto:lectu.consumoTotal >this.LECTURA_MINIMA
  //               ? this.TARIFA_MINIMA +(lectu.consumoTotal -this.LECTURA_MINIMA) *this.COSTO_ADICIONAL
  //               : this.TARIFA_MINIMA,
  //       motivo: `PAGO DE SERVICIO, GESTION:${gestion}, MES: ${month}`,
  //       moneda: Monedas.Bs,
  //     })
  //     try {
  //       await this.comprobantePorPagarService.save(comp);
  //       comprobantesGenerados.push(comp);
  //     } catch (error) {
  //       this.logger.error('error al registrar un comprobante',error);
  //     }
  //   }
  //   return {
  //     OK:true,
  //     message:'Comprobantes creados con exito',
  //     data:comprobantesGenerados.length,
  //   };
  // }
  async findAllPefiles(paginationDto: SearchPerfil) {
    const { offset = 0, limit = 10, order = 'ASC', q = '',sort } = paginationDto;
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    let arg =[''];
    if(q.length>0){
      arg =q.toLocaleLowerCase().split(/\s/).filter(val=>val.length>0);
    }
    if(arg.length===0) arg=[''];
    
    let orderOption:OrderByCondition={'perfil.id':order};
    if((sort!== null || sort !==undefined) && sort !=='id'){
      if(sort==='nombres') orderOption={'perfil.nombre_primero':order};
      if(sort ==='apellidos') orderOption={'perfil.apellido_primero':order}
      else if (sort ==='ci') orderOption={'perfil.cedula_identidad':order};
      else if (sort ==='estado') orderOption={'perfil.estado':order};
    }
    // console.log(arg);
    const finders:FindOptionsWhere<Perfil>[] = [];
    for(const data of arg){
      finders.push(
        { nombrePrimero:   ILike(`%${data}%`) },
        { nombreSegundo:   ILike(`%${data}%`) },
        { apellidoPrimero: ILike(`%${data}%`) },
        { apellidoSegundo: ILike(`%${data}%`) },
        { CI:              ILike(`%${data}%`) },
      )
    }
    const { '0': data, '1': size } = await qb
      .innerJoinAndSelect(
        'perfil.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfil.id',
      ).innerJoinAndSelect(
        'afiliado.medidorAsociado',
        'medidores',
        'medidores."afiliadoId" = afiliado.id'
      )
      .orWhere(finders)
      .offset(offset)
      .limit(limit)
      .orderBy(orderOption)
      .getManyAndCount();
    return {
      OK: true,
      message: 'listado de afiliados con medidores asignados',
      data: {
        data:data.map(perfil=>{
          const {CI,nombrePrimero, nombreSegundo,apellidoPrimero,apellidoSegundo,contacto,estado,id,isActive,

          }=perfil;
          return{
            CI,nombrePrimero, nombreSegundo,apellidoPrimero,apellidoSegundo,contacto,estado,id,isActive,
            afiliado:{
              id:perfil.afiliado.id,
              estado:perfil.afiliado.estado,
              isActive:perfil.afiliado.isActive,
            }            
          }
        }),
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
              medidorAsociado:{id:true,medidor:{nroMedidor:true,id:true,},ubicacion:{barrio:true,numeroVivienda:true},
                
              }}},
      relations:{afiliado:{medidorAsociado:{medidor:true}}}
    })
    if(!perfil || !perfil.isActive) throw new BadRequestException(`Perfil ${idPerfil} not found`);
    if(!perfil.afiliado || !perfil.afiliado.isActive) throw new BadRequestException(`The perfil isn't afiliado`);
    if(perfil.afiliado.medidorAsociado.length===0) throw new BadRequestException(`The perfil not have medidores de agua asociados`)
    const perfilSend = {}
    for(const medidor of perfil.afiliado.medidorAsociado){
      const deudas = await this.dataSource.getRepository(PlanillaLecturas).find({
        where:{
          medidor:{id:medidor.id},
          lecturas:{pagar:{pagado:false}},
        },
        select:{
          gestion:true,id:true,
          lecturas:{estadoMedidor:true,medicion:true,id:true,lectura:true,isMulta:true,PlanillaMesLecturar:true,consumoTotal:true,
            multa:{
              id:true,created_at:true,estado:true,isActive:true,monto:true,moneda:true,motivo:true,pagado:true
            },
            pagar:{id:true,metodoRegistro:true,moneda:true,monto:true,motivo:true,pagado:true,created_at:true,estadoComprobate:true,
            }},
            
        },
        relations:{
          lecturas:{
            pagar:true,
            multa:true
          }
        },
        order:{
          lecturas:{
            id:'ASC'
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
            medidorAsociado:{
              medidor:{
                id:true,
                isActive:true,
                nroMedidor:true,
              },
              id:true,
              isActive:true,
            },
          }
        },
        relations:{afiliado:{medidorAsociado:{medidor:true}}}
      })
    // if(!perfil.isActive) throw new BadRequestException(`This perfil isn't activated, please select another perfil or contact  the administrator`)
    if(!perfil.afiliado) throw new BadRequestException(`This perfil is'nt afiliado,`)
    // if(!perfil.afiliado.medidorAsociado.length===0) throw new BadRequestException(`This perfil is'nt afiliado,`)
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
          medidor:{
            nroMedidor,
          },
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
    const lecturas = await this.dataSource.getRepository(PlanillaMesLectura).find({
      where:{
        planilla:{
          id:idPlanilla,
          
          medidor:{
            medidor:{
              nroMedidor,
            }
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

  async findPlanillasMultasById(comprobantesLecturasPagadas:ComprobantePago[],comprobantesMultas:ComprobanteDePagoDeMultas[]){
    const planillasPagadas=await this.dataSource.getRepository(PlanillaLecturas).find({
      select:{id:true,gestion:true,lecturas:{
        id:true,consumoTotal:true,lectura:true,estadoMedidor:true,medicion:true,PlanillaMesLecturar:true,
        pagar:{id:true,fechaPagada:true,moneda:true,monto:true,motivo:true,pagado:true,
          comprobante:{id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,nroRecibo:true}
        }
      }},
      where:{
        lecturas:{
          pagar:{
            comprobante:{
              id:In(comprobantesLecturasPagadas.map(val=>val.id))},
            }
          }
        },
      relations:{
        lecturas:{
          pagar:{
            comprobante:true,
          }
        }
      }
    });
    const multasPagadas = await this.dataSource.getRepository(ComprobanteDePagoDeMultas).find({
      where:{
        id:In(comprobantesMultas.map(comp=>comp.id))
      },
      select:{
        id:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,
        multaServicio:{
          id:true,motivo:true,moneda:true,monto:true,lecturasMultadas:{
            id:true,isMulta:true,consumoTotal:true,lectura:true,PlanillaMesLecturar:true,medicion:true,
          }
        }
      },
      relations:{
        multaServicio:{lecturasMultadas:true}
      }
    });
    return{
      multasPagadas,
      planillasPagadas
    }
  }


  async reportePagosDeServicio(parametros:FechasParametrosDto){
    const {fechaFin,fechaInicio} = parametros;
    console.log('fecha inicio query',fechaInicio);
    console.log('fecha fin query',fechaFin);
    const fechaInicioFn = new Date(fechaInicio);
    const fechaFinFn = new Date(fechaFin);
    console.log('fecha inicio',fechaInicio);
    console.log('fecha fin',fechaFin);
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    const perfil = await qb .select([
                            'perfil.id',
                            'perfil.nombrePrimero',
                            'perfil.nombreSegundo',
                            'perfil.apellidoPrimero',
                            'perfil.apellidoSegundo',
                            'perfil.CI',
                            'afiliado.id',
                            'asociado.id',
                            'medidor.id',
                            'medidor.nroMedidor',
                            'planilla.id',
                            'planilla.gestion',
                            'lectura.id',
                            'multas.id',
                            'multas.pagado',
                            'multa_comprobante.id',
                            'multa_comprobante.montoPagado',
                            'multa_comprobante.moneda',
                            'multa_comprobante.fechaEmitida',
                            'pagar.id',
                            'pagar.pagado',
                            'comprobante.id',
                            'comprobante.montoPagado',
                            'comprobante.moneda',
                            'comprobante.fechaEmitida',
                            ])
                            .innerJoin('perfil.afiliado','afiliado','perfil.id = afiliado."perfilId"')
                            .innerJoin('afiliado.medidorAsociado','asociado','asociado."afiliadoId" = afiliado.id')
                            .innerJoin('asociado.planillas', 'planilla','planilla."medidorId" = asociado.id')
                            .innerJoin('asociado.medidor', 'medidor','medidor.id = asociado."medidorId"')
                            .innerJoin('planilla.lecturas','lectura','lectura."planillaId" = planilla.id')
                            .innerJoin('lectura.pagar','pagar','pagar."lecturaId" = lectura.id AND pagar.pagado = true')
                            .leftJoin('pagar.comprobante','comprobante','comprobante."comprobantePorPagarId" = pagar.id')
                            .leftJoin('asociado.multasAsociadas','multas','multas."medidorAsociadoId" = asociado.id AND multas.pagado = true')
                            .leftJoin('multas.comprobante','multa_comprobante','multa_comprobante."multaServicioId" = multas.id')
                            // .where('comprobante."fechaEmitida" < :fechaInicio',{fechaInicio:new Date()})
                            //PAGOS DE LECTURAS
                            .where(new Brackets((qb)=>{
                              qb.where('comprobante."fechaEmitida"  >=:fechaInicioFn',{fechaInicioFn})
                              .andWhere('comprobante."fechaEmitida" <=:fechaFin',{fechaFin})
                              // .andWhere(`pagar.pagado = 'true'`)
                            }))
                            //PAGOS DE MULTAS
                            .orWhere(new Brackets((qb)=>{
                              qb.where('multa_comprobante."fechaEmitida"  >=:fechaInicioFn',{fechaInicioFn})
                              .andWhere('multa_comprobante."fechaEmitida" <=:fechaFinFn',{fechaFinFn})
                              // .andWhere(`multas.pagado = 'true'`)
                            })).getMany();
                          // console.log(perfil);
    return {
      OK:true,
      message:'perfiles pagos',
      data:perfil
    }
  }

  RETRASO_90_DIAS_MILISEGUNDOS:number=7776000000;
  DIA_LIMITE_PAGO:number=28;

  async reportAfiliadosConRetrasoPago(retrasoTipo:RetrasosPagosDto){
    // const fechaRq =  retrasoTipo.tipo === RetrasoTipo.mensual?1
    //                 :retrasoTipo.tipo === RetrasoTipo.bimestral?2
    //                 :retrasoTipo.tipo === RetrasoTipo.trimestral?2
    //                 :retrasoTipo.tipo === RetrasoTipo.demas?2
    //                 :0
    let fechaInit:Date;
    const dateActual = new Date();
    switch (retrasoTipo.tipo) {
      case RetrasoTipo.mensual:
        // 1 MES
        if(dateActual.getDate()<=this.DIA_LIMITE_PAGO){
          if(dateActual.getMonth()===0){
            fechaInit= new Date(dateActual.getFullYear()-1,11,1,0,0,0,0);
          }else{
            fechaInit= new Date(dateActual.getFullYear(),dateActual.getMonth()-1,1,0,0,0,0);
          }
        }else{
          fechaInit = new Date(dateActual.getFullYear(),dateActual.getMonth(),1,0,0,0,0);
        }
        break;
      case RetrasoTipo.bimestral:
        //2 MESES
        if(dateActual.getDate()<=this.DIA_LIMITE_PAGO){
          if(dateActual.getMonth()===0){
            fechaInit= new Date(dateActual.getFullYear()-1,10,1,0,0,0,0);
          }else if(dateActual.getMonth() ===1){
            fechaInit= new Date(dateActual.getFullYear()-1,11,1,0,0,0,0);
          }
          else{
            fechaInit= new Date(dateActual.getFullYear(),dateActual.getMonth()-2,1,0,0,0,0);
          }
        }else{
          if(dateActual.getMonth() === 0){
            fechaInit= new Date(dateActual.getFullYear()-1,11,1,0,0,0,0);
          }else{
            fechaInit= new Date(dateActual.getFullYear(),dateActual.getMonth()-2,1,0,0,0,0);
            
          }
        }
        break;
      case RetrasoTipo.trimestral:
        // 3 MESES
        if(dateActual.getDate()<=this.DIA_LIMITE_PAGO){
          if(dateActual.getMonth()===0){
            fechaInit= new Date(dateActual.getFullYear()-1,9,1,0,0,0,0);
          }else if(dateActual.getMonth() ===1){
            fechaInit= new Date(dateActual.getFullYear()-1,10,1,0,0,0,0);
          }else if(dateActual.getMonth() === 2){
            fechaInit = new Date(dateActual.getFullYear()-1,11,1,0,0,0,0);
          }
          else{
            fechaInit= new Date(dateActual.getFullYear(),dateActual.getMonth()-3,1,0,0,0,0);
          }
        }else{
          if(dateActual.getMonth() === 0){
            fechaInit= new Date(dateActual.getFullYear()-1,10,1,0,0,0,0);
          }else if(dateActual.getMonth()===1){
            fechaInit= new Date(dateActual.getFullYear()-1,11,1,0,0,0,0);
          }else{
            fechaInit= new Date(dateActual.getFullYear(),dateActual.getMonth()-3,1,0,0,0,0);
          }
        }
        break;
      case RetrasoTipo.demas:
        // TODOS: TODOSPUES

        const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
        const perfil = await qb 
                          .select([
                            'perfil.id',
                            'perfil.nombrePrimero',
                            'perfil.nombreSegundo',
                            'perfil.apellidoPrimero',
                            'perfil.apellidoSegundo',
                            'perfil.CI',
                            'afiliado.id',
                            'afiliado.ubicacion.barrio',
                            'afiliado.ubicacion.numeroVivienda',
                            'afiliado.ubicacion.manzano',
                            'afiliado.ubicacion.numeroManzano',
                            'afiliado.ubicacion.nroLote',
                            'asociado.id',
                            'asociado.ubicacion.barrio',
                            'asociado.ubicacion.numeroVivienda',
                            'asociado.ubicacion.manzano',
                            'asociado.ubicacion.numeroManzano',
                            'asociado.ubicacion.nroLote',
                            'medidor.id',
                            'medidor.nroMedidor',
                            'planilla.id',
                            'planilla.gestion',
                            'lectura.id',
                            'lectura.PlanillaMesLecturar',
                            'pagar.id',
                            'pagar.pagado',
                            'pagar.monto',
                            'pagar.moneda',
                            'pagar.fechaLimitePago',
                            'multas.id',
                            'multas.pagado',
                            'multas.monto',
                            'multas.moneda',
                            'multadas.id',
                            'multadas.PlanillaMesLecturar',
                            'gestion_multadas.id',
                            'gestion_multadas.gestion',
                            ])
                            .innerJoin('perfil.afiliado','afiliado','perfil.id = afiliado."perfilId"')
                            .innerJoin('afiliado.medidorAsociado','asociado','asociado."afiliadoId" = afiliado.id')
                            .innerJoin('asociado.planillas', 'planilla','planilla."medidorId" = asociado.id')
                            .innerJoin('asociado.medidor', 'medidor','medidor.id = asociado."medidorId"')
                            .innerJoin('planilla.lecturas','lectura','lectura."planillaId" = planilla.id')
                            .innerJoin('lectura.pagar','pagar','pagar."lecturaId" = lectura.id AND pagar.pagado = false')
                            .leftJoin('asociado.multasAsociadas','multas','multas."medidorAsociadoId" = asociado.id AND multas.pagado = false')
                            .leftJoin('multas.lecturasMultadas','multadas','multadas."multaId" = multas.id')
                            .leftJoin('multadas.planilla','gestion_multadas','gestion_multadas.id = multadas."planillaId"')
                            // .where('pagar.fechaLimitePago BETWEEN :fechaInit AND :dateActual',{fechaInit,dateActual})
                            .orderBy({
                              'afiliado.ubicacion.manzano':'ASC',
                              'afiliado.ubicacion.numeroManzano':'ASC',
                              'afiliado.ubicacion.nroLote':'ASC',
                              'planilla.gestion':'ASC',
                              'lectura.id':'ASC',
                              'multadas.id':'ASC',
                            })
                            .getMany();
                            return{
                              OK:true,
                              message:`LISTADO DE PERFILES CON TODOS LOS RETRASOS DE PAGOS`,
                              data:perfil
                            }            
      default:
        throw new BadRequestException(`Tipo no valido`);
    }
    // const date90Retraso = new Date(dateActual.getTime()-this.RETRASO_90_DIAS_MILISEGUNDOS);
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    const perfil = await qb 
                          .select([
                            'perfil.id',
                            'perfil.nombrePrimero',
                            'perfil.nombreSegundo',
                            'perfil.apellidoPrimero',
                            'perfil.apellidoSegundo',
                            'perfil.CI',
                            'afiliado.id',
                            'afiliado.ubicacion.barrio',
                            'afiliado.ubicacion.numeroVivienda',
                            'afiliado.ubicacion.manzano',
                            'afiliado.ubicacion.numeroManzano',
                            'afiliado.ubicacion.nroLote',
                            'asociado.id',
                            'asociado.ubicacion.barrio',
                            'asociado.ubicacion.numeroVivienda',
                            'asociado.ubicacion.manzano',
                            'asociado.ubicacion.numeroManzano',
                            'asociado.ubicacion.nroLote',
                            'medidor.id',
                            'medidor.nroMedidor',
                            'planilla.id',
                            'planilla.gestion',
                            'lectura.id',
                            'lectura.PlanillaMesLecturar',
                            'pagar.id',
                            'pagar.pagado',
                            'pagar.monto',
                            'pagar.moneda',
                            'pagar.fechaLimitePago',
                            'multas.id',
                            'multas.pagado',
                            'multas.monto',
                            'multas.moneda',
                            'multadas.id',
                            'multadas.PlanillaMesLecturar',
                            'gestion_multadas.id',
                            'gestion_multadas.gestion',
                            ])
                            .innerJoin('perfil.afiliado','afiliado','perfil.id = afiliado."perfilId"')
                            .innerJoin('afiliado.medidorAsociado','asociado','asociado."afiliadoId" = afiliado.id')
                            .innerJoin('asociado.planillas', 'planilla','planilla."medidorId" = asociado.id')
                            .innerJoin('asociado.medidor', 'medidor','medidor.id = asociado."medidorId"')
                            .innerJoin('planilla.lecturas','lectura','lectura."planillaId" = planilla.id')
                            .innerJoin('lectura.pagar','pagar','pagar."lecturaId" = lectura.id AND pagar.pagado = false')
                            .leftJoin('asociado.multasAsociadas','multas','multas."medidorAsociadoId" = asociado.id AND multas.pagado = false')
                            .leftJoin('multas.lecturasMultadas','multadas','multadas."multaId" = multas.id')
                            .leftJoin('multadas.planilla','gestion_multadas','gestion_multadas.id = multadas."planillaId"')
                           
                            .where('pagar.fechaLimitePago BETWEEN :fechaInit AND :dateActual',{fechaInit,dateActual})
                            .orderBy({
                              'afiliado.ubicacion.manzano':'ASC',
                              'afiliado.ubicacion.numeroManzano':'ASC',
                              'afiliado.ubicacion.nroLote':'ASC',
                              'planilla.gestion':'ASC',
                              'lectura.id':'ASC',
                              'multadas.id':'ASC',
                            })
                            .getMany();
  return{
    OK:true,
    message:`LISTADO DE PERFILES CON RETRASO DE PAGOS ${retrasoTipo.tipo}`,
    data:perfil
  }
  }
}
