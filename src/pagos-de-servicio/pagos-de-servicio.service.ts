import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common/exceptions';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ComprobanteDePagoDeMultas, ComprobantePago, ComprobantePorPago, MultaServicio } from './entities';
import { DataSource, FindOptionsOrder, FindOptionsWhere, ILike, In, IsNull, LessThanOrEqual, Like, MoreThanOrEqual, Repository, OrderByCondition, Brackets} from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { AnioSeguimientoLectura } from 'src/medidores-agua/entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from 'src/medidores-agua/entities/mes-seguimiento-registro-lectura.entity';
import { EstadoAsociacion, Mes, Monedas, RetrasoTipo, TipoAccion, TipoMulta } from 'src/interfaces/enum/enum-entityes';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { Afiliado, Perfil } from 'src/auth/modules/usuarios/entities';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PlanillaMesLectura } from 'src/medidores-agua/entities/planilla-mes-lectura.entity';
import { PagosServicesDto } from './dto/pagos-services.dto';
import { SearchPerfil } from 'src/auth/modules/usuarios/querys/search-perfil';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { FechasParametrosDto } from './dto/fechas-parametros.dto';
import { RetrasosPagosDto } from './dto/retrasos-pagos.dto';
import { RegistrarCortesRealizadosDto } from './dto/registrar-cortes-realizados.dto';
import { MedidorAsociado } from 'src/asociaciones/entities/medidor-asociado.entity';
import { HistorialConexiones } from 'src/asociaciones/entities/historial-cortes.entity';
import { RegistrarReconexionesRealizadasDto } from './dto/registrar-reconecciones-realizadas.dto';
import { TarifaMultaPorRetrasosPagos } from 'src/configuraciones-applat/entities/tarifa-multa-por-retrasos-pagos';

@Injectable()
export class PagosDeServicioService {
  //     }
  //   }
  // ],
  // relations:{
  //   afiliado:{
  //     medidorAsociado:{
  //       planillas:{
  //         lecturas:{
  //           pagar:true
  //         }
  //       },
  //       multasAsociadas
  //     }
  //   }
  // }
  // });
  
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
    const {perfilId,multas,comprobantes} = pagosDto;
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    // const perfil = await this.dataSource.getRepository(Perfil).findOne({
    //   where:[{
    //     id:perfilId,
    //     afiliado:{
    //       medidorAsociado:{
    //         planillas:{
    //           lecturas:{
    //             pagar:{
    //               pagado:false,
    //             }
    //           }
    //         }
    //       }
    //     }
    //   },
    //   {
    //     id:perfilId,
    //     afiliado:{
    //       medidorAsociado:{
    //         multasAsociadas:{
    //           pagado:false,
    //         }
    //       }
    //     }
    //   }
    // ],
    // relations:{
    //   afiliado:{
    //     medidorAsociado:{
    //       planillas:{
    //         lecturas:{
    //           pagar:true
    //         }
    //       },
    //       multasAsociadas
    //     }
    //   }
    // }
    // });
    const perfil = await qb
                          .innerJoinAndSelect('perfil.afiliado','afiliado','afiliado.perfilId = perfil.id AND afiliado.isActive = true')
                          .innerJoinAndSelect('afiliado.medidorAsociado','medidor','medidor.afiliadoId = afiliado.id')
                          .innerJoinAndSelect('medidor.planillas','planilla','planilla."medidorId" = medidor.id')
                          .innerJoinAndSelect('planilla.lecturas','lectura','lectura."planillaId" = planilla.id AND lectura.registrado = true')
                          .innerJoinAndSelect('lectura.pagar','pagar','pagar."lecturaId" = lectura.id AND pagar.pagado = false')
                          .leftJoinAndSelect('medidor.multasAsociadas','multas','multas."medidorAsociadoId" = medidor.id AND multas.pagado = false')
                          
                          .where('perfil.id = :id',{id:perfilId})
                          .andWhere('perfil.isActive = true')
                          .getOne();
    if(!perfil) throw new BadRequestException(`Perfil ${pagosDto.perfilId} not found`);
    
    const pagados: ComprobantePago[]=[];
    const updateComprobantesPagados :ComprobantePorPago[]=[];
    const comprobanteMultas:ComprobanteDePagoDeMultas[]=[];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    for(const medidorAsc of perfil.afiliado.medidorAsociado){
      if(medidorAsc.planillas?.length>0){
        for(const planilla of medidorAsc.planillas){
          for(const lectura of planilla.lecturas){
            console.log('lectura',lectura);
            if(!lectura.pagar.pagado && comprobantes.includes(lectura.pagar.id)){
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
      if(medidorAsc.multasAsociadas?.length>0){
        for(const multa of medidorAsc.multasAsociadas){
          if(multas.includes(multa.id)){
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
      }
      }
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
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    // const perfil = await qb.select([
    //                       'perfil.id',
    //                       'perfil.nombrePrimero',
    //                       'perfil.nombreSegundo',
    //                       'perfil.apellidoPrimero',
    //                       'perfil.apellidoSegundo',
    //                       'perfil.CI',
    //                       'afiliado.id',
    //                       'afiliado.ubicacion.barrio',
    //                       'afiliado.ubicacion.numeroVivienda',
    //                       'asociado.id',
    //                       'medidor.id',
    //                       'medidor.nroMedidor',
    //                       'planilla.id',
    //                       'planilla.gestion',
    //                       'lectura.id',
    //                       'lectura.PlanillaMesLecturar',
    //                       'lectura.consumoTotal',
    //                       'lectura.lectura',
    //                       'lectura.estadoMedidor',
    //                       'lectura.medicion',
    //                       'lectura.isMulta',
    //                       'multas.id',
    //                       'multas.pagado',
    //                       'multas.monto',
    //                       'multas.motivo',
    //                       'multas.moneda',
    //                       'multas.tipoMulta',
    //                       'pagar.id',
    //                       'pagar.pagado',
    //                       'pagar.moneda',
    //                       'pagar.monto',
    //                       'pagar.pagado',
    //                       ])
    //                       .innerJoin('perfil.afiliado','afiliado','perfil.id = afiliado."perfilId"')
    //                       .innerJoin('afiliado.medidorAsociado','asociado','asociado."afiliadoId" = afiliado.id')
    //                       .innerJoin('asociado.medidor', 'medidor','medidor.id = asociado."medidorId"')
    //                       .innerJoin('asociado.planillas', 'planilla','planilla."medidorId" = asociado.id')
    //                       .innerJoin('planilla.lecturas','lectura','lectura."planillaId" = planilla.id AND lectura.registrado = true')
    //                       .innerJoin('lectura.pagar','pagar','pagar."lecturaId" = lectura.id AND pagar.pagado = false')
    //                       .leftJoin('asociado.multasAsociadas','multas','multas."medidorAsociadoId" = asociado.id AND multas.pagado = false')
    //                       .where('perfil.id = :perfilid',{perfilid:idPerfil})
    //                       .orderBy({'lectura.id':'ASC'})
    //                       .getOne();
    const perfilSend = await this.dataSource.getRepository(Perfil).findOne({
      where:{id:idPerfil},
      select:{id:true,isActive:true,estado:true,nombrePrimero:true,nombreSegundo:true,apellidoPrimero:true,apellidoSegundo:true,
        CI:true,contacto:true,
        afiliado:{
          id:true,ubicacion:{
            barrio:true,numeroVivienda:true
          },
          medidorAsociado:{
            id:true,
            isActive:true,
          }
        }
      },
      relations:{
        afiliado:{
          medidorAsociado:{
            medidor:true,
            
          }
        }
      }
    });
    if(!perfilSend) throw new NotFoundException(`El perfil solicitado no existe`);
    if(!perfilSend.afiliado) throw new BadRequestException(`El Perfil solicitado no es afiliado`);
    if(perfilSend.afiliado.medidorAsociado.length===0) throw new BadRequestException(`El afiliado no tiene medidores asociados`);
    for(const asc of perfilSend.afiliado.medidorAsociado){
      const planillas = await this.dataSource.getRepository(PlanillaLecturas).find({
        where:{
          medidor:{
            id:asc.id
          },
          lecturas:{
            pagar:{
              pagado:false
            }
          }
        },
        select:{
          id:true,gestion:true,
          lecturas:{
            id:true,
            consumoTotal:true,
            isMulta:true,
            isActive:true,
            lectura:true,
            medicion:true,
            PlanillaMesLecturar:true,
            estadoMedidor:true,
            pagar:{
              id:true,
              moneda:true,
              monto:true,
              pagado:true,
            }
          }
        },
        relations:{
          lecturas:{
            pagar:true
          }
        }
      });
      asc.planillas=planillas;
      const multasActivas = await this.dataSource.getRepository(MultaServicio).find({
        where:{
          medidorAsociado:{
            id:asc.id
          },
          pagado:false
        },
        select:{
          id:true,motivo:true,moneda:true,monto:true,pagado:true,tipoMulta:true,
        }
      });
      asc.multasAsociadas=multasActivas;
    }
    return{
      OK:true,
      message:'Tarifas por pagar de perfil',
      data:perfilSend
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

  private async findPlanillasMultasById(comprobantesLecturasPagadas:ComprobantePago[],comprobantesMultas:ComprobanteDePagoDeMultas[]){
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
      },
      order:{
        lecturas:{
          id:'ASC',
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
          id:true,motivo:true,moneda:true,monto:true
        }
      },
      relations:{
        multaServicio:true
      },
      order:{
        id:'ASC'
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
        // 3 MESES O MAS
        // if(dateActual.getDate()<=this.DIA_LIMITE_PAGO){
        //   if(dateActual.getMonth()===0){
        //     fechaInit= new Date(dateActual.getFullYear()-1,9,1,0,0,0,0);
        //   }else if(dateActual.getMonth() ===1){
        //     fechaInit= new Date(dateActual.getFullYear()-1,10,1,0,0,0,0);
        //   }else if(dateActual.getMonth() === 2){
        //     fechaInit = new Date(dateActual.getFullYear()-1,11,1,0,0,0,0);
        //   }
        //   else{
        //     fechaInit= new Date(dateActual.getFullYear(),dateActual.getMonth()-3,1,0,0,0,0);
        //   }
        // }else{
        //   if(dateActual.getMonth() === 0){
        //     fechaInit= new Date(dateActual.getFullYear()-1,10,1,0,0,0,0);
        //   }else if(dateActual.getMonth()===1){
        //     fechaInit= new Date(dateActual.getFullYear()-1,11,1,0,0,0,0);
        //   }else{
        //     fechaInit= new Date(dateActual.getFullYear(),dateActual.getMonth()-3,1,0,0,0,0);
        //   }
        // }
        const qbuilder = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
        
        const perfil3Meses = await qbuilder 
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
                            'multas.motivo',
                            ])
                            .innerJoin('perfil.afiliado','afiliado','perfil.id = afiliado."perfilId"')
                            .innerJoin('afiliado.medidorAsociado','asociado','asociado."afiliadoId" = afiliado.id')
                            .innerJoin('asociado.planillas', 'planilla','planilla."medidorId" = asociado.id')
                            .innerJoin('asociado.medidor', 'medidor','medidor.id = asociado."medidorId"')
                            .innerJoin('planilla.lecturas','lectura','lectura."planillaId" = planilla.id AND lectura.registrado = true')
                            .innerJoin('lectura.pagar','pagar','pagar."lecturaId" = lectura.id AND pagar.pagado = false')
                            .leftJoin('asociado.multasAsociadas','multas','multas."medidorAsociadoId" = asociado.id AND multas.pagado = false')
                            // .where('pagar.fechaLimitePago BETWEEN :fechaInit AND :dateActual',{fechaInit,dateActual})
                            .where('pagar.fechaLimitePago < :limitePago',{limitePago:dateActual})
                            .orderBy({
                              'afiliado.ubicacion.manzano':'ASC',
                              'afiliado.ubicacion.numeroManzano':'ASC',
                              'afiliado.ubicacion.nroLote':'ASC',
                              'planilla.gestion':'ASC',
                              'lectura.id':'ASC',
                              'multas.id':'ASC',
                            })
                            // .groupBy('perfil.id, asociado.id,planilla.id')
                            // .having(`COUNT(DISTINCT TO_CHAR(pagar.fechaLimitePago, 'YYYY-MM'))>= 3`)
                            .getMany();
        const filterPerfiles:Perfil[]=[];
        for(const perfil of perfil3Meses){
          const asociaciones:MedidorAsociado[]=[];
          for(const asc of perfil.afiliado.medidorAsociado){
            const planillas3:PlanillaLecturas[]=[];
            for(const planilla of asc.planillas){
              if(planilla.lecturas.length>=3){
                planillas3.push(planilla);
              }
            }
            if(planillas3.length>0) {
              asociaciones.push({
                ...asc,
                planillas:planillas3
              })
            }
          }
          if(asociaciones.length>0) {
            const post =perfil;
            post.afiliado.medidorAsociado=asociaciones;
            filterPerfiles.push(post)
          }

        }
        return{
        OK:true,
        message:`LISTADO DE PERFILES CON 3 RETRASOS DE PAGO O MAS`,
        data:filterPerfiles
        }    
        
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
                            'multas.motivo',
                            ])
                            .innerJoin('perfil.afiliado','afiliado','perfil.id = afiliado."perfilId"')
                            .innerJoin('afiliado.medidorAsociado','asociado','asociado."afiliadoId" = afiliado.id')
                            .innerJoin('asociado.planillas', 'planilla','planilla."medidorId" = asociado.id')
                            .innerJoin('asociado.medidor', 'medidor','medidor.id = asociado."medidorId"')
                            .innerJoin('planilla.lecturas','lectura','lectura."planillaId" = planilla.id AND lectura.registrado = true')
                            .innerJoin('lectura.pagar','pagar','pagar."lecturaId" = lectura.id AND pagar.pagado = false')
                            .leftJoin('asociado.multasAsociadas','multas','multas."medidorAsociadoId" = asociado.id AND multas.pagado = false')
                            // .where('pagar.fechaLimitePago BETWEEN :fechaInit AND :dateActual',{fechaInit,dateActual})
                            .orderBy({
                              'afiliado.ubicacion.manzano':'ASC',
                              'afiliado.ubicacion.numeroManzano':'ASC',
                              'afiliado.ubicacion.nroLote':'ASC',
                              'planilla.gestion':'ASC',
                              'lectura.id':'ASC',
                              'multas.id':'ASC',
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
                            .innerJoin('planilla.lecturas','lectura','lectura."planillaId" = planilla.id AND lectura.registrado = true')
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


  async listarAfiliadosParaCorteServicio(){
    const fechaActual:Date = new Date(); // DE ACUERDO A LA FECHA PRESENTE SE OBTENDRAS LAS DEUDAS POR PAGAR
    const limiteParaCortesServicio = (await this.dataSource.getRepository(TarifaMultaPorRetrasosPagos).find({
      where:{
        vigencia:LessThanOrEqual(fechaActual),
        isActive:true
      },
      order:{
        id:'DESC'
      }
    }))[0]; //OBTENEMOS EL PRIMER REGISTRO
    if(!limiteParaCortesServicio) throw new NotFoundException(`No hay ningun registro de limite para corte de servicio para realizar el filtro de busqueda`);
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    const perfilesMulta = await qb
                            .select([
                              'perfil.id',
                              'perfil.nombrePrimero',
                              'perfil.nombreSegundo',
                              'perfil.apellidoPrimero',
                              'perfil.apellidoSegundo',
                              'perfil.CI',
                              'perfil.contacto',
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
                              'asociado.corte',
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
                              ])
                              .innerJoin('perfil.afiliado','afiliado','perfil.id = afiliado."perfilId"')
                              .innerJoin('afiliado.medidorAsociado','asociado','asociado."afiliadoId" = afiliado.id AND asociado.estadoMedidorAsociado != :estado',{estado:EstadoAsociacion.desconectado})
                              .leftJoin('asociado.planillas', 'planilla','planilla."medidorId" = asociado.id')
                              .leftJoin('asociado.medidor', 'medidor','medidor.id = asociado."medidorId"')
                              .leftJoin('planilla.lecturas','lectura','lectura."planillaId" = planilla.id AND lectura.registrado = true')
                              .leftJoin('lectura.pagar','pagar','pagar."lecturaId" = lectura.id AND pagar.pagado = false')
                              
                              .where('pagar.fechaLimitePago < :fechaActual',{fechaActual})
                              // .orderBy({
                              //   'afiliado.ubicacion.manzano':'ASC',
                              //   'afiliado.ubicacion.numeroManzano':'ASC',
                              //   'afiliado.ubicacion.nroLote':'ASC',
                              //   'planilla.gestion':'ASC',
                              //   'lectura.id':'ASC',
                              //   'multadas.id':'ASC',
                              // })
                              .getMany();
    const cortesPorCierre = await this.dataSource.getRepository(Perfil).find({
      where:{
        afiliado:{
          medidorAsociado:{
            corte:true // ACCION QUE INDICA QUE EL MEDIDOR DE AGUA SERA QUITADO POR CIERRE DE ASOCIACION
          }
        }
      },
      select:{
        id:true,nombrePrimero:true,nombreSegundo:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,contacto:true,
        afiliado:{id:true,ubicacion:{barrio:true,manzano:true,nroLote:true,numeroManzano:true,numeroVivienda:true},
        medidorAsociado:{id:true,ubicacion:{barrio:true,manzano:true,nroLote:true,numeroManzano:true,numeroVivienda:true},corte:true,
        medidor:{id:true,nroMedidor:true}}}
      },
      relations:{
        afiliado:{
          medidorAsociado:{
            medidor:true
          }
        }
      }
    })
    
    const perfilesConRetrasoPagos:Perfil[]=[];
    for(const perfil of perfilesMulta){
      const asociaciones:MedidorAsociado[]=[];
      for(const asc of perfil.afiliado.medidorAsociado){
        const planillas:PlanillaLecturas[]=[];
        for(const plan of asc.planillas){
          if(plan.lecturas.length>=limiteParaCortesServicio.mesesDemora){
            planillas.push(plan);
          }
        }
        if(planillas.length>0){
          asociaciones.push({
            ...asc,
            planillas
          })
        }
      }
      if(asociaciones.length>0){
        const perf =perfil;
        perf.afiliado.medidorAsociado=asociaciones;
        perfilesConRetrasoPagos.push(perf)
      }
    }
    const listado:any[]=perfilesConRetrasoPagos.map(perfil=>{
      const {nombrePrimero,nombreSegundo,apellidoPrimero,apellidoSegundo,contacto,CI,afiliado}=perfil;
      const {id,medidorAsociado,ubicacion} = afiliado
      return{
        nombrePrimero,nombreSegundo,apellidoPrimero,apellidoSegundo,contacto,CI,
        afiliado:{
          id,
          ubicacion:{...ubicacion},
          medidorAsociado:medidorAsociado.map(asc=>{
            const {medidor,planillas,id,ubicacion}=asc;
            return{
              id,
              medidor,
              ubicacion,
              motivo:'Retraso de pago de servicio por',
              tipo:'MULTA',
              totalPagosRetrasos:this.obtenerTotalRetrasos(planillas)
            }
          })
        }
      }
    });
    listado.push(
      ...cortesPorCierre.map(perfil=>{
        const {nombrePrimero,nombreSegundo,apellidoPrimero,apellidoSegundo,contacto,CI,afiliado}=perfil;
      const {id,medidorAsociado,ubicacion} = afiliado
      return{
        nombrePrimero,nombreSegundo,apellidoPrimero,apellidoSegundo,contacto,CI,
        afiliado:{
          id,
          ubicacion:{...ubicacion},
          medidorAsociado:medidorAsociado.map(asc=>{
            const {medidor,id,corte,ubicacion}=asc;
            return{
              id,
              medidor,
              motivo:'Cierre de asociación',
              corte,
              ubicacion,
              tipo:'CIERRE'
            }
          })
        }
      }
      })
    )
    return {
      OK:true,
      message:'Lista de afiliados para recortes de servicio',
      data:listado
    }
  }
  MONTO_MULTA_RECONECCION:number=50;
  MONEDA_MULTA_RECONECCION:Monedas=Monedas.Bs;
  // MOTIVO_MULTA_RECONECCION:string=''
  async registrarCortesRealizados(registrarCortesDto:RegistrarCortesRealizadosDto){
    const {medidoresCortados}=registrarCortesDto;
    // console.log(medidoresCortados);
    const asociaciones = await this.dataSource.getRepository(MedidorAsociado).find(
      {where:{
        id:In(medidoresCortados.map(asc=>asc.id))
      },
      relations:{
        planillas:{
          lecturas:true
        }
      }
    });
    if(asociaciones.length===0) throw new NotFoundException(`No se encontraron asociaciones con los parametros enviados`);
    const multasPorReconeccion:MultaServicio[]=[]
    const agregarCorteAsociacion:HistorialConexiones[]=[];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    for(const asc of asociaciones){
      if(!asc.isActive) throw new BadRequestException(`NO SE PUEDE REALIZAR UN CORTE A UNA ASOCIACION DESHABILITADA`);
      if(asc.estadoMedidorAsociado === EstadoAsociacion.desconectado) throw new BadRequestException(`LA ASOCIACION ${asc.id} YA SE ENCEUNTRA CORTADA`);
      const registrarDto = medidoresCortados.find(mds=>mds.id === asc.id)!;
      
      if(!registrarDto) throw new NotFoundException(`El asociado con id ${asc.id} no fue encontrado`);
      if(registrarDto.tipoCorte ==='MULTA'){

        const multaReconeccion= this.dataSource.getRepository(MultaServicio).create({
          monto:this.MONTO_MULTA_RECONECCION,
          moneda:this.MONEDA_MULTA_RECONECCION,
          motivo:'Multa para realizar la reconexión de medidor de agua por demora de pagos de servicio',
          tipoMulta:TipoMulta.reconexion,
          medidorAsociado:asc
        })
        multasPorReconeccion.push(multaReconeccion);
        const corte = this.dataSource.getRepository(HistorialConexiones).create({
          fechaRealizada: new Date(),
          motivo:'Corte de servicio por demora de pago',
          asociacion:asc,
          tipoAccion:TipoAccion.desconexion
        })
        agregarCorteAsociacion.push(corte);
      }else if(registrarDto.tipoCorte ==='CIERRE'){
        const corte = this.dataSource.getRepository(HistorialConexiones).create({
          fechaRealizada: new Date(),
          motivo:asc.motivoTipoConexion,
          asociacion:asc,
          tipoAccion:TipoAccion.desconexion
        });
        agregarCorteAsociacion.push(corte);
      }
      await queryRunner.manager.update(MedidorAsociado,asc.id,{estadoMedidorAsociado:EstadoAsociacion.desconectado,corte:false,registrable:false,motivoTipoConexion:null,reconexion:false});
      await queryRunner.manager.update(PlanillaLecturas,asc.planillas.find(plan=>plan.gestion === (new Date()).getFullYear()).id,{registrable:false})
    }
    try {
      // console.log(pagados);
      await queryRunner.manager.save(multasPorReconeccion);
      await queryRunner.manager.save(agregarCorteAsociacion);
      await queryRunner.commitTransaction();
      return{
        OK:true,
        message:'Registros de cortes exitoso!',
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally{
      await queryRunner.release();
    }
  }
  private obtenerTotalRetrasos(planillas: PlanillaLecturas[]): any {
    let totalLecturas:number=0;
    for(const planilla of planillas){
      for(const lectura of planilla.lecturas){
        if(!lectura.pagar.pagado) totalLecturas++;
      }
    };
    return totalLecturas;
  }

  async listarAfiliadosParaReconexion(){
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    // const perfiles = await this.dataSource.getRepository(Perfil).find({
    //   relations:{
    //     afiliado:{
    //       medidorAsociado:{
    //         multasAsociadas:true,
    //         medidor:true,
    //         planillas:{
    //           lecturas:{
    //             pagar:true
    //           }
    //         }
    //       }
    //     }
    //   },
    //   where:[{
    //     afiliado:{ //
    //       medidorAsociado:{
    //         estadoMedidorAsociado:EstadoAsociacion.desconectado,
    //         multasAsociadas:{
    //           tipoMulta:TipoMulta.reconexion
    //         }
    //       }
    //     }
    //   },
    //   {afiliado:{
    //     medidorAsociado:{
    //       reconexion:true,
    //       estadoMedidorAsociado:EstadoAsociacion.desconectado,
    //     }
    //   }},{
    //     afiliado:{
    //       medidorAsociado:{
          
    //       }
    //     }
    //   }
    // ],
    // select:{
    //   id:true,estado:true,isActive:true,nombrePrimero:true,nombreSegundo:true,CI:true,
    //   contacto:true,apellidoPrimero:true,apellidoSegundo:true,
    //   afiliado:{
    //     id:true,ubicacion:{barrio:true,manzano:true,numeroManzano:true,numeroVivienda:true,nroLote:true}
        
    //     ,medidorAsociado:{id:true,corte:true,medidor:{id:true,nroMedidor:true}
    //     ,estadoMedidorAsociado:true,reconexion:true,motivoTipoConexion:true,
    //     ubicacion:{barrio:true,manzano:true,nroLote:true,numeroManzano:true,numeroVivienda:true}
    //     ,multasAsociadas:{id:true,tipoMulta:true,motivo:true,pagado:true}}}}});
    const perfiles = await qb
                            .select([
                              'perfil.id',
                              'perfil.nombrePrimero',
                              'perfil.nombreSegundo',
                              'perfil.apellidoPrimero',
                              'perfil.apellidoSegundo',
                              'perfil.CI',
                              'perfil.contacto',
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
                              'asociado.corte',
                              'asociado.reconexion',
                              'asociado.estadoMedidorAsociado',
                              'multa.id',
                              'multa.motivo',
                              'multa.tipoMulta',
                              'multa.pagado',
                              'multa.isActive',
                              'multa.estado',
                              'medidor.id',
                              'medidor.nroMedidor',
                              'planilla.id',
                              'planilla.gestion',
                              'lectura.id',
                              'lectura.PlanillaMesLecturar',
                              'lectura.registrado',
                              'pagar.id',
                              'pagar.pagado',
                              'pagar.monto',
                              'pagar.moneda',
                              'pagar.fechaLimitePago',
                            ])
                            .innerJoin('perfil.afiliado','afiliado','afiliado.perfilId = perfil.id AND afiliado.isActive = true')
                            .innerJoin('afiliado.medidorAsociado','asociado','asociado.afiliadoId = afiliado.id AND asociado.isActive = true AND asociado.estadoMedidorAsociado = :estadoMedidor',{estadoMedidor:EstadoAsociacion.desconectado})
                            .innerJoin('asociado.medidor','medidor','medidor.id = asociado.medidorId')
                            .leftJoin('asociado.multasAsociadas','multa','multa.medidorAsociadoId = asociado.id AND multa.isActive = true')
                            .leftJoin('asociado.planillas','planilla','planilla.medidorId = asociado.id AND planilla.isActive = true')
                            .leftJoin('planilla.lecturas','lectura','lectura.planillaId = planilla.id AND lectura.registrado = true')
                            .leftJoin('lectura.pagar','pagar','pagar.lecturaId = lectura.id')
                            .where('perfil.isActive = true')
                            .getMany()
                              ;
    const perfilesReconeccion:Perfil[]=[];
    for(const perfil of perfiles){
      console.log('perfil :',perfil.nombrePrimero);
      const asociaciones:MedidorAsociado[]=[];
      for(const asc of perfil.afiliado.medidorAsociado){
        if(asc.reconexion){
          
        asociaciones.push(asc);
        break;
        }
        const multas = asc.multasAsociadas.filter(multa=>!multa.pagado);
        console.log('multas',multas);
        if(multas.length>0) break;
        const planillasSinPagar = asc.planillas.filter(planilla=>
          // planilla.lecturas.some(lectu=>!lectu.pagar.pagado)
          {
          const lecturasSinPagar = planilla.lecturas.filter(lectu=>!lectu.pagar.pagado);
          console.log('sus lectura sin pagar',lecturasSinPagar);
          if(lecturasSinPagar.length>0){
            planilla.lecturas=lecturasSinPagar;
            return true;
          }
          return false;
        }
      );
        // console.log('planillas sin pagar',planillasSinPagar);
        if(planillasSinPagar.length>0) break;
        
        
        asociaciones.push(asc);

      }
      if(asociaciones.length>0){
        const perfilS=perfil;
        perfilS.afiliado.medidorAsociado=asociaciones;
        perfilesReconeccion.push(perfilS);
      }
    }
    return{
      OK:true,
      message:'lista de afiliados para su reconexion',
      // data:perfilesReconeccion
      data:perfilesReconeccion
    }
  }
  async registrarReconexiones(reconeccionesDto: RegistrarReconexionesRealizadasDto) {
    const {reconexionesList}=reconeccionesDto;
    const asociaciones =await this.dataSource.getRepository(MedidorAsociado).find({
      where:{
        id:In(reconexionesList.map(res=>res.id))
      },
      relations:{
        planillas:{lecturas:{pagar:true}},
        multasAsociadas:true
      }
    });
    if(asociaciones.length===0) throw new NotFoundException(`No se encontraron asociaciones para reconexión`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const reconexiones:HistorialConexiones[]=[]
    for(const asc of asociaciones){
      if(!asc.isActive) throw new BadRequestException(`NO SE PUEDE REALIZAR LA RECONEXIÓN DE UNA ASOCIACION QUE ESTA CERRADO`);
      if(asc.estadoMedidorAsociado === EstadoAsociacion.conectado) throw new BadRequestException(`LA ASOCIACION ${asc.id} YA SE ENCUENTRA CONECTADA`);
      
      for(const planilla of asc.planillas){
       for(const lectura of planilla.lecturas){
         if(lectura.registrado && !lectura.pagar.pagado) throw new BadRequestException(`LA ASOCIACIÓN TIENE DEUDAS DE LECTURAS POR PAGAR, NO SE PUEDE REALIZAR LA RECONEXION`);
       } 
      }
      for(const multa of asc.multasAsociadas){
        if(!multa.pagado) throw new BadRequestException(`LA ASOCIACION TIENE MULTAS POR PAGAR, NO SE PUEDE REALIZAR LA RECONEXIÓN`);
      }
      if(asc.reconexion){
        const conexion = this.dataSource.getRepository(HistorialConexiones).create({
          tipoAccion:TipoAccion.conexion,
          fechaRealizada:new Date(),
          motivo:asc.motivoTipoConexion,
          asociacion:asc
        });
        reconexiones.push(conexion);
        await queryRunner.manager.update(MedidorAsociado,asc.id,{motivoTipoConexion:null,reconexion:false,corte:false,estadoMedidorAsociado:EstadoAsociacion.conectado});
        const gestion = asc.planillas?.find(plan=>plan.gestion === (new Date()).getFullYear());
        if(gestion){
          await queryRunner.manager.update(PlanillaLecturas,gestion.id,{registrable:true});
        }else{
          const gestionCreada = queryRunner.manager.create(PlanillaLecturas,{
            gestion:(new Date()).getFullYear(),
            registrable:true,
            medidor:asc
          });
          await queryRunner.manager.save(gestionCreada);
        }
      }else { //RECONEXION POR PAGAR MULTAS Y LECTURAS, ESTANDO AL DIA
        const conexion = this.dataSource.getRepository(HistorialConexiones).create({
          tipoAccion:TipoAccion.conexion,
          fechaRealizada:new Date(),
          motivo:'Reconexión de servicio por pagos de deudas al dia',
          asociacion:asc
        });
        reconexiones.push(conexion);
        await queryRunner.manager.update(MedidorAsociado,asc.id,{motivoTipoConexion:null,reconexion:false,corte:false,estadoMedidorAsociado:EstadoAsociacion.conectado});
        const gestion = asc.planillas?.find(plan=>plan.gestion === (new Date()).getFullYear());
        if(gestion){
          await queryRunner.manager.update(PlanillaLecturas,gestion.id,{registrable:true});
        }else{
          const gestionCreada = queryRunner.manager.create(PlanillaLecturas,{
            gestion:(new Date()).getFullYear(),
            registrable:true,
            medidor:asc
          });
          await queryRunner.manager.save(gestionCreada);
        }
      }
    };
    try {
      await queryRunner.manager.save(reconexiones);
      await queryRunner.commitTransaction()
      return{
        OK:true,
        message:'Se han registrados las reconexiones correctamente!',
      }
    } catch (error) {
      
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally{
      await queryRunner.release();
    }
  }
}
