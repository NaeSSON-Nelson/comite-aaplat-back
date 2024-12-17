import { BadRequestException, Injectable,NotFoundException,
    Logger, } from "@nestjs/common";
import { CommonService } from "src/common/common.service";
import { DataSource, In, LessThan, LessThanOrEqual, TreeLevelColumn } from "typeorm";
import { CreateMultaDto } from "./dto/create-multa.dto";
import { Perfil } from "src/auth/modules/usuarios/entities";
import { PlanillaMesLectura } from "src/medidores-agua/entities/planilla-mes-lectura.entity";
import { ComprobanteDePagoDeMultas, ComprobantePago, ComprobantePorPago, MultaServicio} from "./entities";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { RegistrarPagoMultasDto } from "./dto/registrar-pago-multas.dto";
import { MedidorAsociado } from '../asociaciones/entities/medidor-asociado.entity';

import { QueryMultasIds } from "./query/query-multas";
import { Cron } from "@nestjs/schedule";
import { TarifaMultaPorRetrasosPagos } from "src/configuraciones-applat/entities/tarifa-multa-por-retrasos-pagos";
import { Estado, TipoMulta } from "src/interfaces/enum/enum-entityes";


@Injectable()
export class MultasServicioAguaService{

    constructor(
    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
    ){}




    private readonly logger = new Logger(MultasServicioAguaService.name);
    //REGISTRA EL AÑO DE GESTION DE SEGUIMIENTO PARA LAS LECTURAS POSTERIORES
    // @Cron('* * * * *')
      @Cron('0 3 28 * *') //SE EJECUTA LOS DIAS 28 DE CADA MES A LAS 3:00 AM
  private async verificarYRegistrarMultasPorRetrasoDePagoDeServicio(){
    
    const fechaActual=new Date();
    const vigenciaTarifaMulta =(await this.dataSource.getRepository(TarifaMultaPorRetrasosPagos).find({
        where:{
            tipoMulta:TipoMulta.retrasoPago,
            isActive:true,
            vigencia:LessThanOrEqual(fechaActual),
        },
        order:{
            id:'DESC'
        }
    }))[0];
    this.logger.log('TARIFA MULTA VIGENTE',vigenciaTarifaMulta)
    console.log('TARIFA MULTA VIGENTE',vigenciaTarifaMulta);
    const medidoresAsociados = await this.dataSource.getRepository(MedidorAsociado).find({
        where:{
            planillas:{
                lecturas:{
                    pagar:{
                        pagado:false,
                        fechaLimitePago:LessThanOrEqual(fechaActual)
                    },
                    isMulta:false,
                    // registrable:true,
                    registrado:true
                },
                // registrable:true
            },
            isActive:true,
            estado:Estado.ACTIVO,
            registrable:true
        },
        relations:{
            planillas:{
                lecturas:{
                    pagar:true
                }
            }
        }
    });
    const multasAgregadas:MultaServicio[]=[];
    let lecturasIdsMultadas:number[]=[];
    for(const asc of medidoresAsociados){
        let totalRetrasos=0;
        for(const planilla of asc.planillas){
            for(const lectura of planilla.lecturas){
                if(!lectura.pagar.pagado){
                     totalRetrasos=totalRetrasos+1;
                     lecturasIdsMultadas.push(lectura.id);
                    };
                if(totalRetrasos>=vigenciaTarifaMulta.mesesDemora){
                    const createMultaRetraso = this.dataSource.getRepository(MultaServicio).create({
                        tipoMulta:TipoMulta.retrasoPago,
                        monto:vigenciaTarifaMulta.monto,
                        moneda:vigenciaTarifaMulta.moneda,
                        medidorAsociado:asc,
                        motivo:`Retraso de pagos de servicio por ${totalRetrasos} meses`,
                        tarifaRetraso:vigenciaTarifaMulta,
                        pagado:false,
                    });
                    multasAgregadas.push(createMultaRetraso);
                    // await this.dataSource.getRepository(MultaServicio).save(createMultaRetraso);
                    await this.dataSource.getRepository(PlanillaMesLectura).update(lecturasIdsMultadas,{
                        isMulta:true
                    });
                    this.logger.log('multa creada',asc.id);
                    totalRetrasos=0;
                    lecturasIdsMultadas=[];
                }
            }
        }
    }
    if(multasAgregadas.length>0){

        await this.dataSource.getRepository(MultaServicio).save(multasAgregadas);
        
    }
    this.logger.log('total multas creadas',multasAgregadas.length)
  }
    // async createMultaServicioAgua(multasDto: CreateMultaDto){
    //     const {lecturasMultadas,perfilMultadoId,medidorAsociadoId,...dataMultas} = multasDto;
    //     const perfil = await this.dataSource.getRepository(Perfil).findOneBy({id:perfilMultadoId});
    //     if(!perfil) throw new BadRequestException(`Perfil with Id ${perfilMultadoId} not found`);
    //     const lecturas = await this.dataSource.getRepository(PlanillaMesLectura).find({
    //         where:{
    //             id:In(lecturasMultadas.map(lct=>lct.id)),
    //             multa:false,
    //             pagar:{
    //                 pagado:false
    //             },
    //             planilla:{
    //                 medidor:{
    //                     id:medidorAsociadoId,
    //                     afiliado:{
    //                         perfil:{
    //                             id:perfilMultadoId
    //                         }
    //                     }
    //                 }
    //             }
    //         },
    //         relations:{
    //             pagar:true,
    //             planilla:{
    //                 medidor:{
    //                     medidor:true
    //                 }
    //             }
    //         }
    //     });
    //     // console.log(lecturas);
    //     if(lecturas.length===0) throw new BadRequestException(`Sin lecturas para multar`);
    //     else if(lecturas.length<3) throw new BadRequestException(`Debe ver 3 lecturas  como minimo sin pagar para registrarse la multa`);
    //     else if(lecturas.length>5) throw new BadRequestException(`Maximo de 5 lecturas registrar la multa`);
    //     const queryRunner = this.dataSource.createQueryRunner();
    //     await queryRunner.connect();
    //     await queryRunner.startTransaction();
    //     const multa = queryRunner.manager.create(MultaServicio,{
    //         medidorAsociado:lecturas[0].planilla.medidor,
    //         lecturasMultadas:lecturas,
    //         ...dataMultas
    //     })
    //     try {
    //         await queryRunner.manager.update(PlanillaMesLectura,lecturas.map(lect=>lect.id),{isMulta:true})
    //         await queryRunner.manager.save(multa);  
    //         await queryRunner.manager.save(multa);  
            
    //         await queryRunner.commitTransaction();
    //         return {
    //             OK:true,
    //             message:'MULTAS CREADAS CON EXITO!'
    //         }
    //     } catch (error) {
    //         await queryRunner.rollbackTransaction();
    //         this.commonService.handbleDbErrors(error);
    //     } finally{
    //         await queryRunner.release();
    //     }
    // }
    // async findMultas(idPerfil:number){
    // const multas = await this.dataSource.getRepository(MultaServicio).find({
    //     where:{
    //         pagado:false,
            
    //             lecturasMultadas:{
    //                 planilla:{
    //                     medidor:{
    //                         afiliado:{
    //                             perfil:{
    //                                 id:idPerfil
    //                             }
    //                         }
                        
    //                 }
    //             }
    //         }
    //     },
    //     select:{
    //         created_at:true,id:true,moneda:true,monto:true,motivo:true,pagado:true,
            
    //             lecturasMultadas:{
    //                 id:true,isMulta:true,consumoTotal:true,estadoMedidor:true,estado:true,
    //                 isActive:true,lectura:true,medicion:true,
    //                 planilla:{
    //                     id:true,estado:true,gestion:true,medidor:{
    //                         id:true,estado:true,isActive:true,estadoMedidorAsociado:true,
    //                         medidor:{
    //                             id:true,isActive:true,estado:true,nroMedidor:true,
    //                         },
    //                         afiliado:{
                                
    //                         }
    //                     }
    //                 },
    //                 pagar:{
    //                     id:true,created_at:true,estado:true,estadoComprobate:true,moneda:true,monto:true,motivo:true,pagado:true,
    //                 }
                
    //         },
    //         medidorAsociado:{
    //             id:true,
    //             isActive:true,estado:true,
    //             medidor:{
    //                 id:true,nroMedidor:true
    //             }
    //         }
    //     },
    //     relations:{
            
    //             lecturasMultadas:{
    //                 planilla:{
    //                     medidor:{
    //                         medidor:true,
    //                         afiliado:{
    //                             perfil:true
    //                         }
                        
    //                 }
    //             }
    //         },medidorAsociado:{medidor:true}
    //     },
    //     order:{
    //         id:'ASC'
    //     }
    // });
    // return {
    //     OK:true,
    //     message:'multas de perfil activas',
    //     data:multas.map(multas=>{
    //         const {lecturasMultadas,...dataMulta}=multas;
    //         return {
    //             lecturasMultadasTotal:lecturasMultadas.length,
    //             ...dataMulta
    //         }
    //     })
    // }
    // }
    // async historialMultas(idPerfil:number,paginationDto:PaginationDto){
        
    // const { offset = 0, limit = 10,order='DESC' } = paginationDto;
    //     const {"0":data,"1":size} = await this.dataSource.getRepository(MultaServicio).findAndCount({
    //         where:{
                
    //                 lecturasMultadas:{
    //                     planilla:{
    //                         medidor:{
    //                             afiliado:{
    //                                 perfil:{
    //                                     id:idPerfil
    //                                 }
    //                             }
    //                         }
                        
    //                 }
    //             }
    //         },
    //         select:{
    //             created_at:true,id:true,moneda:true,monto:true,motivo:true,pagado:true,
    //             comprobante:{
    //                 id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,nroRecibo:true
    //             },
                
    //                 lecturasMultadas:{
    //                     id:true,isMulta:true,consumoTotal:true,estadoMedidor:true,estado:true,
    //                     isActive:true,lectura:true,medicion:true,
    //                     planilla:{
    //                         id:true,estado:true,gestion:true,medidor:{
    //                             id:true,estado:true,isActive:true,estadoMedidorAsociado:true,
    //                             medidor:{
    //                                 id:true,isActive:true,estado:true,nroMedidor:true,
    //                             },
    //                             afiliado:{}
    //                         }
    //                     },
    //                     pagar:{
    //                         id:true,created_at:true,estado:true,estadoComprobate:true,moneda:true,monto:true,motivo:true,pagado:true,
    //                         metodoRegistro:true,
    //                         comprobante:{
    //                             id:true,moneda:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,nroRecibo:true,montoPagado:true
    //                         }
    //                     }
                    
    //             }
    //         },
    //         relations:{
                
    //                 lecturasMultadas:{
    //                     planilla:{
    //                         medidor:{
    //                             medidor:true,
    //                             afiliado:{
    //                                 perfil:true
    //                             }
    //                         }
                        
    //                 }
    //             }
    //         },
    //         take:limit,
    //         skip:offset,
    //         order:{id:order}
    //     });
    //     return {
    //         OK:true,
    //         message:'historia de multas del perfil',
    //         data: {
    //             data,
    //             size,
    //             offset,
    //             limit,
    //             order,
    //           },
    //     }
    // }

    // async registrarPagoMultaWithMesLectura(registrarPagoMultas:RegistrarPagoMultasDto){
    //     const {multas,perfilId}=registrarPagoMultas;
    //     const perfilExist = await this.dataSource.getRepository(Perfil).exist({where:{id:perfilId}});
    //     if(!perfilExist) throw new BadRequestException(`Perfil ${perfilId} not found`);
    //     const multasDb = await this.dataSource.getRepository(MultaServicio).find({
    //         where:{
    //             id:In(multas.map(m=>m.multaId)),
    //             pagado:false,
    //                 lecturasMultadas:{
    //                     planilla:{
    //                         medidor:{
    //                             afiliado:{
    //                                 perfil:{
    //                                     id:perfilId
    //                                 }
    //                             },
    //                             id:In(multas.map(m=>m.medidorAsociadoId))
    //                         }
                        
    //                 },
    //                 isMulta:true,
    //             }
    //         },
    //         relations:{
    //                 lecturasMultadas:{
    //                     pagar:true,
    //                     planilla:{
    //                         medidor:{
    //                             afiliado:{
    //                                 perfil:true
    //                             }
    //                         }
    //                     }
    //                 }
                
    //         }
    //     })
    //     if(multasDb.length===0) throw new BadRequestException(`No hay multas por pagar o las multas no pertenecen al perfil ${perfilId}`);
    //     for(let i =0;i<multasDb.length;i++){
    //         const mult =  multas.find(m=>m.multaId===multasDb[i].id);
    //        for(const lecM of multasDb[i].lecturasMultadas){
    //         const lect = mult.lecturasMultadas.find(e=>e.lecturaId===lecM.id);
    //         if(!lect) throw new BadRequestException(`Deben estar todas las lecturas que tengan vinculadas a la multa ${multasDb[i].id}`);
    //        }
    //     }
    //     const queryRunner = this.dataSource.createQueryRunner();
    //     await queryRunner.connect();
    //     await queryRunner.startTransaction();
    //     try{
    //         const comprobanteMultas:ComprobanteDePagoDeMultas[]=[];
    //         const comprobantePagoLecturas:ComprobantePago[]=[];
    //         for(const multa of multasDb){
    //             const comprobanteMulta = queryRunner.manager.create(ComprobanteDePagoDeMultas,{
    //                 fechaEmitida: new Date(),
    //                 metodoPago:'PAGO POR CAJA - PRESENCIAL',
    //                 entidadPago:'NINGUNO',
    //                 montoPagado:multa.monto,
    //                 moneda:multa.moneda,
    //                 multaServicio:multa
    //             })
    //             comprobanteMultas.push(comprobanteMulta);
    //             await queryRunner.manager.update(MultaServicio,multa.id,{pagado:true});
    //             for(const {pagar} of multa.lecturasMultadas){
    //                 const comprobantePagoLectura = queryRunner.manager.create(ComprobantePago,{
    //                     comprobantePorPagar:pagar,
    //                     entidadPago:'NINGUNO',
    //                     fechaEmitida: new Date(),
    //                     metodoPago:'PAGO POR CAJA - PRESENCIAL',
    //                     montoPagado:pagar.monto,
    //                     moneda:pagar.moneda,
    //                   });
    //                 comprobantePagoLecturas.push(comprobantePagoLectura);
    //                 await queryRunner.manager.update(ComprobantePorPago,pagar.id,{pagado:true})
    //             }
    //         }
    //         await queryRunner.manager.save(comprobanteMultas);
    //         await queryRunner.manager.save(comprobantePagoLecturas);
    //         await queryRunner.commitTransaction();
    //         return {
    //             OK:true,
    //             message:'MULTAS PAGADAS REGISTRADO CON EXITO!',
    //             data: await this.findMultasAwait(multasDb.map(res=>res.id))
    //         }
    //     } catch (error) {
    //         await queryRunner.rollbackTransaction();
    //         this.commonService.handbleDbErrors(error);
    //     } finally{
    //         await queryRunner.release();
    //     }
    // }
    async obtenerMesLecturasConRetrasoDePago(perfilId:number,medidorAscId:number){
        const perfil = await this.dataSource.getRepository(Perfil).findBy({id:perfilId});
        if(!perfil) throw new NotFoundException(`Perfil ${perfilId} not found`);
        const medidorAsc = await this.dataSource.getRepository(MedidorAsociado).findOne({
            where:{
                id:medidorAscId,
                afiliado:{
                    perfil:{
                        id:perfilId
                    }
                }
            }
        })
        if(!medidorAsc) throw new NotFoundException(`Medidor asociado no encontrado/o no pertenece al perfil con Id ${perfilId}`);

        const timelimit = new Date().getTime();
        const TIME_LIMIT_90_DAYS = 7776000000;
        const distancia = (timelimit-TIME_LIMIT_90_DAYS);
        // const result = (Math.round((distancia*(1.1574*Math.pow(10,-8)))*100)/100);
        const dateFault = new Date(distancia);
        // console.log(dateFault);
        const medidoresAsociados = await this.dataSource.getRepository(MedidorAsociado).findOne({
            where:{
                id:medidorAsc.id,
                afiliado:{
                    perfil:{
                        id:perfilId
                    }
                },
                planillas:{
                    lecturas:{
                        isMulta:false,
                        pagar:{
                            pagado:false,
                            fechaLimitePago:LessThan(dateFault)
                        }
                    }
                }
            },
            select:{
                id:true,estado:true,isActive:true,medidor:{id:true,estado:true,isActive:true,nroMedidor:true,},afiliado:{},
                planillas:{
                    id:true,gestion:true,
                    lecturas:{
                        id:true,isActive:true,estado:true,
                        consumoTotal:true,estadoMedidor:true,lectura:true,medicion:true,isMulta:true,
                        PlanillaMesLecturar:true,
                        pagar:{
                            id:true,estadoComprobate:true,estado:true,fechaLimitePago:true,moneda:true,monto:true,motivo:true
                        },
                    }
                },
            },
            relations:{
                planillas:{
                    lecturas:{
                        pagar:true
                    }
                },
                medidor:true,
                afiliado:{
                    perfil:true
                }
            },order:{
                planillas:{
                    lecturas:{
                        id:'ASC'
                    }
                }
            }
        })
       
        return {
            OK:true,
            message:`Lecturas con retraso del medidor Asociado ${medidorAscId} del perfil ${perfilId}`,
            data:medidoresAsociados,
        }
    }
    async obtenerMedidoresPerfil(perfilId:number){
        const perfilExist = await this.dataSource.getRepository(Perfil).exist({where:{id:perfilId}});
        if(!perfilExist) throw new NotFoundException(`Perfil ${perfilId} not found`);
        const data = await this.dataSource.getRepository(MedidorAsociado).find({
            where:{
                afiliado:{
                    perfil:{
                        id:perfilId
                    }
                }
            },
            select:{
                id:true,isActive:true,estado:true,registrable:true,medidor:{
                    id:true,isActive:true,estado:true,nroMedidor:true,
                },afiliado:{},
            },
            relations:{
                medidor:true,
                afiliado:{
                    perfil:true,
                }
            }
        })
        return {
            OK:true,
            message:'medidores de perfil',
            data
        }
    }
    // async findMulta(multaId:number){
    //     const multa = await this.dataSource.getRepository(MultaServicio).findOne({
    //         where:{id:multaId},
    //         select:{
    //             id:true,created_at:true,estado:true,isActive:true,
    //             medidorAsociado:{
    //                 id:true,isActive:true,estado:true,medidor:{id:true,nroMedidor:true}
    //             },
    //             moneda:true,monto:true,motivo:true,pagado:true,comprobante:{
    //                 id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,nroRecibo:true
    //             },
    //             lecturasMultadas:{
    //                 id:true,estado:true,isActive:true,consumoTotal:true,estadoMedidor:true,isMulta:true,lectura:true,medicion:true,PlanillaMesLecturar:true,
    //                 pagar:{
    //                     id:true,created_at:true,estado:true,estadoComprobate:true,fechaLimitePago:true,moneda:true,monto:true,motivo:true,pagado:true,comprobante:{
    //                         id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,nroRecibo:true
    //                     }
    //                 },
    //                 planilla:{
    //                     id:true,gestion:true,
    //                 }
    //             }
    //         },
    //         relations:{
    //             lecturasMultadas:{
    //                 pagar:{
    //                     comprobante:true
    //                 },
    //                 planilla:true
    //             },
    //             medidorAsociado:{
    //                 medidor:true
    //             },
    //             comprobante:true
    //         },
    //         order:{
    //             lecturasMultadas:{
    //                 id:"ASC"
    //             }
    //         }
    //     })
    //     if(!multa) throw new NotFoundException(`Multa not found ${multaId}`);
    //     return {
    //         OK:true,
    //         message:'Multa obtenida',
    //         data:multa
    //     }
    // }
    // async findMultaIds(perfilId:number,query:QueryMultasIds){
    //     const {multas} = query;
    //     const multasIds = JSON.parse(multas);
    //     const data = await this.dataSource.getRepository(MultaServicio).find({
    //         where:{id:In(multasIds),medidorAsociado:{afiliado:{perfil:{id:perfilId}}}},
    //         select:{
    //             id:true,created_at:true,estado:true,isActive:true,
    //             medidorAsociado:{
    //                 id:true,isActive:true,estado:true,medidor:{id:true,nroMedidor:true}
    //             },
    //             moneda:true,monto:true,motivo:true,pagado:true,comprobante:{
    //                 id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,nroRecibo:true
    //             },
    //             lecturasMultadas:{
    //                 id:true,estado:true,isActive:true,consumoTotal:true,estadoMedidor:true,isMulta:true,lectura:true,medicion:true,PlanillaMesLecturar:true,
    //                 pagar:{
    //                     id:true,created_at:true,estado:true,estadoComprobate:true,fechaLimitePago:true,moneda:true,monto:true,motivo:true,pagado:true,comprobante:{
    //                         id:true,created_at:true,entidadPago:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,nroRecibo:true
    //                     }
    //                 },
    //                 planilla:{
    //                     id:true,gestion:true,
    //                 }
    //             }
    //         },
    //         relations:{
    //             lecturasMultadas:{
    //                 pagar:{
    //                     comprobante:true
    //                 },
    //                 planilla:true
    //             },
    //             medidorAsociado:{
    //                 medidor:true
    //             }
    //         },
    //         order:{
    //             lecturasMultadas:{
    //                 id:"ASC"
    //             }
    //         }
    //     })
    //     if(data.length===0) throw new NotFoundException(`LAS MULTAS SOLICITADAS NO ESTA VINCULADAS AL PERFIL ${perfilId}`);
    //     return {
    //         OK:true,
    //         message:'Multas obtenidas del perfil vinculado',
    //         data
    //     }
    // }

    // private async findMultasAwait(multasIds:number[]){
    //     const data= await this.dataSource.getRepository(MultaServicio).find({
    //         where:{
    //             id:In(multasIds)
    //         },
    //         select:{
    //             id:true,moneda:true,monto:true,motivo:true,pagado:true,
    //             comprobante:{id:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,},
    //             lecturasMultadas:{
    //                 id:true,consumoTotal:true,lectura:true,medicion:true,planilla:{id:true,gestion:true},isMulta:true,PlanillaMesLecturar:true,
    //                 pagar:{id:true,estadoComprobate:true,fechaPagada:true,moneda:true,monto:true,pagado:true,
    //                     comprobante:{id:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,},
    //                 }
    //             }
    //         },
    //         relations:{
    //             lecturasMultadas:{
    //                 planilla:true,
    //                 pagar:{
    //                     comprobante:true
    //                 }
    //             },
    //             comprobante:true
    //         },
    //         order:{
    //            lecturasMultadas:{
    //             id:'ASC'
    //            } 
    //         }
    //     });
    //     return data;
    // }
}