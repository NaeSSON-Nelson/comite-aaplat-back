import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from 'typeorm';
import { Perfil, Usuario } from "./entities";
import { CommonService } from "src/common/common.service";
import { PlanillaLecturas } from "src/medidores-agua/entities/planilla-lecturas.entity";
import { PlanillaMesLectura } from "src/medidores-agua/entities/planilla-mes-lectura.entity";
import { MedidorAsociado } from "src/asociaciones/entities/medidor-asociado.entity";
import { NotFoundError } from "rxjs";
import { MultaServicio } from "src/pagos-de-servicio/entities";
import { Afiliado } from './entities/afiliado.entity';
import { PaginationDto } from "src/common/dto/pagination.dto";

@Injectable()
export class UserService{

    constructor(private readonly dataSource:DataSource,
        
    private readonly commonService: CommonService,
    ){}
    
  async medidoresAfiliadoInSelect(user:Usuario){
    // console.log(user);
    const perfil = await this.dataSource.getRepository(Perfil).findOne(
      {where:{ usuario:{id:user.id,isActive:true},isActive:true,afiliado:{isActive:true}},
      select:{usuario:{id:true,isActive:true},isActive:true,id:true,afiliado:{isActive:true,id:true,medidorAsociado:{id:true,isActive:true,medidor:{id:true,nroMedidor:true,}}}},
      relations:{usuario:true,afiliado:{medidorAsociado:{medidor:true}},}
    })
    return {
      OK:true,
      message:'medidores Asociados seleccionados',
      data:perfil.afiliado.medidorAsociado}
  }

  async obtenerComprobantesPorPagar(user:Usuario,nroMedidor:string){
    const perfil = await this.dataSource.getRepository(Perfil).findOne({
      where:{usuario:{id:user.id},afiliado:{medidorAsociado:{medidor:{nroMedidor}}}},
      select:{id:true,isActive:true,
        usuario:{id:true,isActive:true},
        afiliado:{id:true,isActive:true,
          medidorAsociado:{
            medidor:{id:true,isActive:true,nroMedidor:true},
            planillas:{id:true,isActive:true,gestion:true,
              lecturas:{id:true,isActive:true,lectura:true,PlanillaMesLecturar:true,consumoTotal:true,created_at:true,
                pagar:{id:true,created_at:true,pagado:true,moneda:true,monto:true,motivo:true,estado:true,estadoComprobate:true,
                  }}}
                }},

          },
      relations:{usuario:true,afiliado:{medidorAsociado:{medidor:true,planillas:{lecturas:{pagar:true}}}}}
    })
    if(!perfil) throw new BadRequestException(`No se encontro datos de medidor con Numero: ${nroMedidor}`)
    const medidorRes = Object.assign({},perfil.afiliado.medidorAsociado[0]);
    medidorRes.planillas=Object.assign({},perfil.afiliado.medidorAsociado[0].planillas);
    medidorRes.planillas=[];
    for(const planilla of perfil.afiliado.medidorAsociado[0].planillas){
      for(const lectura of planilla.lecturas){
        if(lectura.pagar){
          if(!lectura.pagar.pagado){
            const planillita = medidorRes.planillas.find(pl=>pl.gestion===planilla.gestion);
            if(!planillita) {
              const {lecturas,...resPlanilla}=planilla;
              medidorRes.planillas.push({...resPlanilla,lecturas:[]})
            }
            
              medidorRes.planillas.find(plan=>plan.gestion === planilla.gestion).lecturas.push(lectura)
            
          }
        }
      }
    }
    return {
      OK:true,
      message:'resultado de dudas',
      data:medidorRes
    };
  }

  async lecturasPlanilla(id:number){
    const planilla = await this.dataSource.getRepository(PlanillaLecturas).findOne({
    where:{
      id,
      isActive:true,
      lecturas:{
        registrado:true
      }
    },
    select:{id:true,isActive:true,gestion:true,lecturas:{
      consumoTotal:true,lectura:true,PlanillaMesLecturar:true,id:true,
      editable:true,isMulta:true,registrable:true,registrado:true,medicion:true,
      isActive:true,estado:true,
      pagar:{monto:true,moneda:true,pagado:true,}
    }},
    relations:{lecturas:{pagar:true}}
    })
    if(!planilla) throw new BadRequestException(`Planilla ${id} not found`)    
    return {
      OK:true,
      message:'lecturas de la planilla',
      data:planilla,
    }
  }
  async lecturaDetails(id:number){
    const lectura = await this.dataSource.getRepository(PlanillaMesLectura).findOne({
      where:{
        id,isActive:true,
      },
      select:{consumoTotal:true,created_at:true,estadoMedidor:true,id:true,isActive:true,lectura:true,PlanillaMesLecturar:true,estado:true,medicion:true,
        pagar:{created_at:true,fechaLimitePago:true,metodoRegistro:true,estado:true,estadoComprobate:true,fechaPagada:true,id:true,moneda:true,motivo:true,monto:true,pagado:true,
          comprobante:{
            created_at:true,entidadPago:true,fechaEmitida:true,id:true,metodoPago:true,montoPagado:true,nroRecibo:true,
            moneda:true,
        }}},
      relations:{
        pagar:{
          comprobante:true,
        }
      }
    })
    return {
      OK:true,
      message:'Lectura',
      data:lectura
    }
  }

  async medidorAsociadoSelect(user:Usuario,nroMedidor:string){
    const medidorAsc = await this.dataSource.getRepository(MedidorAsociado).findOne(
      {
        where:{
            afiliado:{
              perfil:{
                usuario:{id:user.id,isActive:true},
                // isActive:true
              },
              // isActive:true
            },
          medidor:{
            nroMedidor
          }
        },
        select:{
          medidor:{
            estado:true,id:true,
            nroMedidor:true,
          },
            isActive:true,
            estado:true,
            estadoMedidorAsociado:true,
            id:true,
            planillas:{id:true,gestion:true,isActive:true,estado:true,registrable:true,},
            // afiliado:{id:true,isActive:true,
            //   perfil:{id:true,isActive:true,
            //     usuario:{id:true,isActive:true}}
            //   },
            afiliado:{},
          
          },
        relations:{afiliado:{perfil:{usuario:true}},planillas:true,medidor:true,}
      })
      if(!medidorAsc) throw new BadRequestException(`No se encontro ningun medidor con el Nro. ${nroMedidor} relacionado al usuario`)
      const {afiliado,...dataAsc} = medidorAsc;
      return {
        OK:true,
        message:'Medidor asociado encontrado',
        data:dataAsc
      }
  }
  async profileUser(user:Usuario){
    const perfil = await this.dataSource.getRepository(Perfil).findOne({
      where:{
        usuario:{id:user.id,isActive:true},
        isActive:true,
      },
      select:{nombrePrimero:true,nombreSegundo:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,contacto:true,direccion:true,fechaNacimiento:true,genero:true,id:true,isActive:true,tipoPerfil:true,profesion:true,
        usuario:{id:true,correo:true,username:true,roleToUsuario:{id:true,role:{nombre:true,id:true}},correoVerify:true,},
        afiliado:{id:true,isActive:true,ubicacion:{barrio:true,latitud:true,longitud:true},}
      },
      relations:{usuario:{roleToUsuario:{role:true}},afiliado:true}
    });
    // const {usuario,...dataPerfil} = perfil;
    const usuario = perfil.usuario;
    const {roleToUsuario,...dataUsuario}=usuario;
    return{
      OK:true,
      message:'perfil de usuario',
      data:{
        ...perfil,
        usuario:{
          roles:roleToUsuario.map(toUsuario=>toUsuario.role.nombre),
          ...dataUsuario,
        }
      }
    }
  }
  async medidorAsociadoDetalles(user:Usuario,id:number){
    const asociado = await this.dataSource.getRepository(MedidorAsociado).findOne({
        where:{
            id,
            afiliado:{
                perfil:{
                    usuario:{
                        id:user.id
                    }
                }
            }
        },
        select:{
            id:true,estado:true,isActive:true,
            estadoMedidorAsociado:true,fechaInstalacion:true,lecturaInicial:true,lecturaSeguimiento:true,registrable:true,ubicacion:{barrio:true,latitud:true,longitud:true,manzano:true,nroLote:true,numeroManzano:true,numeroVivienda:true},
            medidor:{id:true,estado:true,isActive:true,funcionamiento:true,marca:true,nroMedidor:true,}
        },
        relations:{
            afiliado:{perfil:{usuario:true}},
            medidor:true
        }
    });
    if(!asociado) throw new NotFoundException(`Medidor asociado no encontrado o no pertenece al usuario`);
    return{
        OK:true,
        message:'medidor asociado selected',
        data:asociado,
    }
  }

  async multasMedidorAsociado(user:Usuario,idAsociado:number,paginationDto:PaginationDto){
    
    const { offset = 0, limit = 10,order='DESC' } = paginationDto;
    const {"0":data,"1":size} = await this.dataSource.getRepository(MultaServicio).findAndCount({
        where:{
            medidorAsociado:{
                id:idAsociado,
                afiliado:{
                    perfil:{
                        usuario:{
                            id:user.id
                        }
                    }
                }
            }
        },
        relations:{
            lecturasMultadas:true
        },
        select:{
            id:true,motivo:true,moneda:true,pagado:true,isActive:true,estado:true,monto:true,

        },
        order:{
            id:order,pagado:'ASC'
        },
        take:limit,
        skip:offset
    });
    return {
        OK:true,
        message:'Historial de multas del medidor asociado',
        data:{
            data,
            size,
            offset,
            limit,
            order,
        }
    }
  }
}