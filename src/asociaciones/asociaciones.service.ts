import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedidorAsociadoDto } from './dto/create-medidor-asociado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MedidorAsociado } from './entities/medidor-asociado.entity';
import { DataSource, FindOptionsOrder, FindOptionsWhere, ILike, LessThan, Like, OrderByCondition, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { Afiliado, Perfil } from 'src/auth/modules/usuarios/entities';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { UpdateMedidorAsociadoDto } from './dto/update-medidor-asociado.dto';
import { Estado } from 'src/interfaces/enum/enum-entityes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SearchPerfil } from 'src/auth/modules/usuarios/querys/search-perfil';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { PlanillaMesLectura } from 'src/medidores-agua/entities/planilla-mes-lectura.entity';
import { CreateGestionMedidorAsociadoDto } from './dto/create-gestion-medidor-asociacion.dto';
import { UpdateStatusGestion } from './dto/update-status-planilla.dto';
import { UpdatePlanillaMedidorDto } from './dto/update-planilla-medidor.dto';
import { CreatePlanillaMedidorDto } from './dto/create-planilla-medidor.dto';

@Injectable()
export class AsociacionesService {
  constructor(
    // @InjectRepository(Perfil)
    // private readonly perfilRepository: Repository<Perfil>,
    // @InjectRepository(Medidor)
    // private readonly medidorRepository: Repository<Medidor>,
    
    @InjectRepository(MedidorAsociado)
    private readonly medidorAsociadoRepository:Repository<MedidorAsociado>,
    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
  ){}
  async create(createMedidorAsociado:CreateMedidorAsociadoDto){

    const {afiliado,medidor,ubicacion,...dataAsociacion} = createMedidorAsociado;
    const afiliadoDb = await this.dataSource.getRepository(Afiliado).findOneBy({id:afiliado.id});
    if(!afiliadoDb) throw new NotFoundException(`Afiliado con ID: ${afiliado.id} not found`);
    if(!afiliadoDb.isActive) throw new BadRequestException(`No se puede asociar con afiliado deshabilitado`);
    
    const medidorDb = await this.dataSource.getRepository(Medidor).findOne({where:{id:medidor.id},relations:{medidorAsociado:true}})
    if(!medidorDb) throw new NotFoundException(`Medidor de agua con ID: ${medidor.id} not found`);
    if(!medidorDb.isActive) throw new BadRequestException(`El medidor no se encuentra Disponible para asociar`);
    for(const asc of medidorDb.medidorAsociado){
      if(asc.isActive) throw new BadRequestException(`El medidor con Nro ${medidorDb.nroMedidor} ya se encuentra en funcionamiento`)
    }
    const asociacion = this.medidorAsociadoRepository.create({
      
      afiliado:afiliadoDb,
      medidor:medidorDb,
      lecturaInicial:medidorDb.lecturaMedidor,
      lecturaSeguimiento:medidorDb.lecturaMedidor,
      ubicacion,  
      ...dataAsociacion
    })
    try {
      await this.medidorAsociadoRepository.save(asociacion);
      return {
        OK:true,
        message:`Asociacion Exitosa!`,
        data:asociacion,
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error)
    }
  }
  async update(idAsociacion:number,dataUpdate:UpdateMedidorAsociadoDto){
    const {afiliado,estado,medidor,...data}=dataUpdate
    const asociacion = await this.medidorAsociadoRepository.preload({id:idAsociacion,...data});
    if(!asociacion) throw new NotFoundException(`ASOCIACION ${idAsociacion} NOT FOUND`);
    if(!asociacion.isActive) throw new BadRequestException(`No se puede modificar los datos de una asociacion deshabilitada`)
    try {
      await this.medidorAsociadoRepository.save(asociacion);
      return {
        OK:true,
        message:`Asociacion actualizada correctamente!`,
        data:asociacion,
      }
    } catch (error) {
      
      this.commonService.handbleDbErrors(error)
    }
  }
  async updateStatus(idAsociacion:number,updateMedidorAsociadoDto:UpdateMedidorAsociadoDto){
    const {estado} =updateMedidorAsociadoDto;
    if(estado === null || estado === undefined) throw new BadRequestException(`Debe Enviar un estado!`);
    if(estado !== Estado.DESHABILITADO) throw new BadRequestException(`Solamente se puede deshabilitar la asociación`);

    const asociacion = await this.medidorAsociadoRepository.findOne({where:{id:idAsociacion},relations:{medidor:true,planillas:{lecturas:{pagar:true,multa:true}}}});
    if(!asociacion) throw new NotFoundException(`Asociacion ${idAsociacion} not found`);
    for(const planilla of asociacion.planillas){
      for(const lectura of planilla.lecturas){
        if(lectura.pagar){
          if(!lectura.pagar.pagado) throw new BadRequestException(`La asociación tiene deudas pendientes por pagar, no se puede deshabilitar`);
        }
        if(lectura.multa){
          if(!lectura.multa.pagado) throw new BadRequestException(`La asociación tienes lecturas con multas por pagar, no se puede deshabilitar`);
          
        }
      }
    }

    try {
      await this.medidorAsociadoRepository.update(asociacion.id,{isActive:false,estado,estadoMedidorAsociado:'Asociación cerrada'});
      return {
        OK:true,
        message:'Se ha deshabilitado el estado de asocición entre medidor de agua y el afiliado',
        data:await this.findAsociacionnAfiliado(asociacion.id),
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error)
    }
  }
  async findAll(paginationDto:SearchPerfil){
    const {
      offset = 0,
      limit = 10, 
      order = 'ASC',
      q = '',
      sort,
      tipoPerfil,
      accessAccount = true,
      barrio,
      genero,
    } = paginationDto;
    let arg =[''];
    if(q.length>0){
      arg =q.toLocaleLowerCase().split(/\s/).filter(val=>val.length>0);
    }
    if(arg.length===0) arg=[''];
    
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
    
    let orders:OrderByCondition={'perfil.id':order}
    if((sort!== null || sort !==undefined) && sort !=='id'){
      if(sort==='nombres') orders={'perfil.nombrePrimero':order};
      if(sort ==='apellidos') orders={'perfil.apellidoPrimero':order}
      else if (sort ==='ci') orders={'perfil.CI':order};
      else if (sort ==='estado') orders={'perfil.estado':order};
    }
    const qb = this.dataSource.getRepository(Perfil).createQueryBuilder('perfil');
    const { '0': data, '1': size } = await qb
      .innerJoinAndSelect(
        'perfil.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfil.id',
      )
      .orWhere(finders)
      .offset(offset)
      .limit(limit)
      .orderBy(orders)
      .getManyAndCount();
    return {
      OK: true,
      message: 'lista de afiliados',
      data: {
        data,
        size,
        offset,
        limit,
        order,
      },
    };
  }
  async getGestionesLecturasAsociacion(id:number){

    const data = await this.medidorAsociadoRepository.findOne({
      where:{
        id,
      },
      select:{
        id:true,isActive:true,estado:true,registrable:true,
        medidor:{id:true,isActive:true,nroMedidor:true},
        planillas:{id:true,estado:true,gestion:true,isActive:true,registrable:true,}
      },
      relations:{
        planillas:true,
        medidor:true,
      },
      order:{
        planillas:{
          gestion:'DESC'
        }
      }
    })
    if(!data) throw new BadRequestException(`Asociacion with id ${id} not found`);
    return {
      OK:true,
      message:'Planillas de asociacion',
      data
    }
  }
  async getLecturasAsociacion(id:number){
    const data = await this.dataSource.getRepository(PlanillaLecturas).findOne({
      where:{id},
      select:{
        id:true,gestion:true,isActive:true,estado:true,
        lecturas:{
          consumoTotal:true,
          id:true,estado:true,isActive:true,
          lectura:true,medicion:true,estadoMedidor:true,PlanillaMesLecturar:true,
          pagar:{pagado:true,id:true,moneda:true,monto:true,estadoComprobate:true,}
        }
      },
      relations:{
        lecturas:{
          pagar:true,
        },
      },
      order:{
        lecturas:{
          id:'ASC'
        }
      }
    })
    if(!data) throw new BadRequestException(`no asociacion`);
    return {
      OK:true,
      message:`lecturas de gestion ${data.gestion}`,
      data
    }
  }
  async getLecturaDetails(id:number){
    const data = await this.dataSource.getRepository(PlanillaMesLectura).findOne({
      where:{
        id
      },
      select:{
        id:true,isActive:true,estado:true,
        consumoTotal:true,created_at:true,estadoMedidor:true,
        lectura:true,medicion:true,PlanillaMesLecturar:true,
        pagar:{
          id:true,estado:true,estadoComprobate:true,fechaPagada:true,
          metodoRegistro:true,moneda:true,monto:true,motivo:true,
          pagado:true,created_at:true,updated_at:true,
          comprobante:{
            created_at:true,
            entidadPago:true,
            fechaEmitida:true,
            id:true,
            moneda:true,
            montoPagado:true,
            metodoPago:true,
            nroRecibo:true,
          }
        }
      },
      relations:{
        pagar:{
          comprobante:true,
        }
      }
    })
    if(!data) throw new BadRequestException(`Lectura ID:${id} not found`)
      return{
        OK:true,
        message:'lectura encontrada',
        data
      }
  }
  async findOne(id:number){
    const data = await this.medidorAsociadoRepository.findOne({
      where:{id},
      select:{
        id:true,isActive:true,estado:true,
        estadoMedidorAsociado:true,fechaInstalacion:true,lecturaInicial:true,lecturaSeguimiento:true,
        registrable:true,ubicacion:{barrio:true,manzano:true,nroLote:true,numeroManzano:true,latitud:true,longitud:true,numeroVivienda:true},
        medidor:{id:true,estado:true,marca:true,medicion:true,nroMedidor:true,isActive:true},
        afiliado:{
          id:true,isActive:true,estado:true,
          perfil:{apellidoPrimero:true,apellidoSegundo:true,CI:true,contacto:true,urlImage:true,id:true,isActive:true,estado:true,nombrePrimero:true,nombreSegundo:true,defaultClientImage:true,}
        }
      },
      relations:{
        afiliado:{perfil:true},
        medidor:true
      }
    })
    return {
      OK:true,
      message:'Asociacion encontrada',
      data
    }
  }
  async findOnePerfil(id:number){
    const data = await this.dataSource.getRepository(Perfil).findOne({
      where:{
        id
      },
      select:{
        nombrePrimero:true,nombreSegundo:true,
        apellidoPrimero:true,apellidoSegundo:true,
        CI:true,estado:true,id:true,isActive:true,
        contacto:true,urlImage:true,profileImageUri:true,
        afiliado:{
          id:true,isActive:true,estado:true,
        }
      },
      relations:{
        afiliado:true
      }
    })
    if(!data) throw new BadRequestException(`perfil id: ${id} not found`);
    return{
      OK:true,
      message:'perfil asociado',
      data
    }
  }
  async findMedidorWithAsociation(idMedidor:number){
    const medidor = await this.dataSource.getRepository(Medidor).findOne({
      where:[
        {
        id:idMedidor,
        medidorAsociado:{
        isActive:true,}
        },
        {
          id:idMedidor,
        },
      ],
      relations:{medidorAsociado:{afiliado:{perfil:true}},},
      select:{
        id:true,estado:true,funcionamiento:true,isActive:true,lecturaInicial:true,lecturaMedidor:true,marca:true,nroMedidor:true,medicion:true,
        medidorAsociado:{id:true,isActive:true,estado:true,afiliado:{id:true,isActive:true,estado:true,perfil:{id:true,isActive:true,estado:true,}}}
      }
    });
    if(!medidor) throw new BadRequestException(`Medidor not found, ID: ${idMedidor}`);
    return {
      OK:true,
      message:'Medidor encontrado',
      data:medidor,
    }
  }
  
 async findMedidoresWithoutAsociacion(paginationDto:PaginationDto){ // obtener medidores sin asociaciones y asociaciones inactivas
  const { order = 'ASC', q = '' } = paginationDto;
  const { '0': data, '1': size } = await 
  this.dataSource.getRepository(Medidor).findAndCount({
   where: [
     { nroMedidor: Like(`%${q}%`), isActive:true },
     // { nroMedidor: Like(`%${q}%`), isActive:true},
   ],
   relations:{medidorAsociado:true},
   // skip: offset,
   // take: limit,
   order: {
     id: order,
   },
 });
 const relationsMedidores:Medidor[]=[];
 for(const med of data){
   if(med.medidorAsociado.length===0) relationsMedidores.push(med);
   else
     for(let i = 0; i < med.medidorAsociado.length;i++){
       if(med.medidorAsociado[i].isActive) break;
       if(i === med.medidorAsociado.length - 1) relationsMedidores.push(med);
   }
 }
 // console.log(relationsMedidores);
 return {
   OK: true,
   message: 'Listado de medidores sin asociacion',
   data: {
     data:relationsMedidores,
     size:relationsMedidores.length,
     // data,size,
     order,
   },
 };
}
  private async findAsociacionnAfiliado(id: number) {
    
    const asociacion = await this.medidorAsociadoRepository.findOne({
      where:{id},
      select:{
        id:true,isActive:true,estado:true,estadoMedidorAsociado:true,fechaInstalacion:true,
        lecturaInicial:true,lecturaSeguimiento:true,registrable:true,ubicacion:
        {barrio:true,latitud:true,longitud:true,manzano:true,nroLote:true,numeroManzano:true,numeroVivienda:true},
        medidor:{id:true,isActive:true,estado:true,nroMedidor:true},
        afiliado:{id:true,isActive:true,estado:true,
          perfil:{id:true,isActive:true,estado:true,apellidoPrimero:true,apellidoSegundo:true,nombrePrimero:true,nombreSegundo:true,CI:true,contacto:true,defaultClientImage:true,profileImageUri:true,urlImage:true,}
        }
      
      },
      relations:{afiliado:{perfil:true},medidor:true}
    })
    return asociacion;
  }
  async verificarGestion(idAsociacion:number){
    const gestion = new Date().getFullYear();
    const asociacion= await this.medidorAsociadoRepository.findOne({
      where:{
        id:idAsociacion,
      },
      select:{id:true,isActive:true,estado:true,planillas:{
        id:true,isActive:true,gestion:true,registrable:true,estado:true
      }
      },
      relations:{
        planillas:true
      },
      order:{
        planillas:{
          gestion:'DESC'
        }
      }
    })
    if(!asociacion) throw new BadRequestException(`Asociacion not found`);
    else if(!asociacion.isActive) throw new BadRequestException(`La asociacion no se encuentra disponible`);
    // else if()
    // if(asociacion.planillas.includes({gestion,}))
    // console.log(asociacion);
    for(const gest of asociacion.planillas){
      if(gest.gestion===gestion){
        return {
          OK:true,
          message:'gestion planilla Actual de asociacion existente',
          data:gest
        }
      }
    }
    return {
      OK:false,
      message:`no se encontró la gestion actual del medidor de agua asociado: ${idAsociacion}`
    }
  }
  async createGestionActual(createAsociacion:CreateGestionMedidorAsociadoDto){
    const {asociacion:asociado} = createAsociacion;
    const gestion = new Date().getFullYear();
    const asociacion= await this.medidorAsociadoRepository.findOne({
      where:{
        id:asociado,
      },
      select:{id:true,isActive:true,estado:true,planillas:{
        id:true,isActive:true,gestion:true,registrable:true,estado:true
      }
      },
      relations:{
        planillas:true
      },
      order:{
        planillas:{
          gestion:'DESC'
        }
      }
    })
    if(!asociacion) throw new BadRequestException(`Asociacion not found`);
    else if(!asociacion.isActive) throw new BadRequestException(`La asociacion no se encuentra disponible`);
    // else if(asociacion.planillas.length>0) throw new BadRequestException(`La asociacion ya tiene la gestion del año :${gestion}`);
    for(const gest of asociacion.planillas){
      if(gest.gestion===gestion){
        throw new BadRequestException(`La asociacion ${asociacion.id} ya tiene la planilla de gestion ${gestion}`)
      }
    }
    const gestionCreate = this.dataSource.getRepository(PlanillaLecturas).create({
      gestion,medidor:asociacion,registrable:true,
    });
    await this.dataSource.getRepository(PlanillaLecturas).save(gestionCreate);
    return {
      OK:true,
      message:'Gestion creada con exito',
      data:gestionCreate
    }
  }
  
  async findAllMedidorOneAfiliado(id: number) {
   
    const afiliadoWithMedidores = await this.dataSource.getRepository(Perfil).findOne({
      where: { id },
      select:{
        id:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,contacto:true,defaultClientImage:true,direccion:true,estado:true,isActive:true,isAfiliado:true,nombrePrimero:true,nombreSegundo:true,profileImageUri:true,urlImage:true,
        afiliado:{
          id:true,estado:true,isActive:true,
        }
      },
      relations: { afiliado: true },
      // select: {},
    });
    if (!afiliadoWithMedidores)
      throw new NotFoundException(
        `Perfil de afiliado with Id: ${id} not found`,
      );
    if(!afiliadoWithMedidores.afiliado) throw new BadRequestException(`El perfil solicitado no tiene afiliación`);
    return {
      OK: true,
      message: 'afiliado encontrado',
      data: afiliadoWithMedidores,
    };
  }
  async findGestiones(idAsociacion:number,paginationDto: PaginationDto){
    const gestion = new Date().getFullYear();
    const {limit=10,offset=0} = paginationDto;
    const {"0":data,"1":size} = await this.dataSource.getRepository(PlanillaLecturas).findAndCount({
      where:[{gestion:LessThan(gestion),
        medidor:{id:idAsociacion}}],
        select:{
          id:true,estado:true,gestion:true,registrable:true,isActive:true,medidor:{id:true,}
        },
      relations:{medidor:true},
      order:{gestion:'DESC'}
    })
    return {
      OK:true,
      message:'gestiones pasadas',
      data:{
        size,
        data,
        offset,
        limit
      }
    }
  }
  async findGestionById(idAsociacion:number,gestion:number){

    const asociacion = await this.medidorAsociadoRepository.findOne({
      where:{id:idAsociacion},
      relations:{
        planillas:true
      }
    });
    if(!asociacion) throw new BadRequestException(`Asociacion ${idAsociacion} not found`);
    for(const gest of asociacion.planillas){
      if(gest.gestion === gestion) return {OK:true,msg:'Gestion de planilla de asociacion encontrada',data:gest};

    }
    return{
      OK:false,
      message:`No se encontro la planilla de gestion ${gestion} de la asociacion ${idAsociacion}`
    }
  }
  async updateStatusGestion(idPlanilla:number,updateStatusGestion:UpdateStatusGestion){
    const {registrable} =updateStatusGestion;
    const planilla = await this.dataSource.getRepository(PlanillaLecturas).preload({id:idPlanilla,registrable})
    if(!planilla) throw new BadRequestException(`Planilla ${idPlanilla} not found`);
    await this.dataSource.getRepository(PlanillaLecturas).save(planilla);
    return {
      OK:true,
      message:'REGISTRABLE ACTUALIZADO!',
      data:planilla
    }
  }


  async getAsociacionesAfiliado(idPerfil:number){
    const asociados = await this.dataSource.getRepository(MedidorAsociado).find({
      where:{
        afiliado:{
          perfil:{
            id:idPerfil
          }
        }
      },
      select:{
        id:true,estado:true,estadoMedidorAsociado:true,fechaInstalacion:true,isActive:true,lecturaInicial:true,lecturaSeguimiento:true,registrable:true,ubicacion:{barrio:true,latitud:true,longitud:true,manzano:true,nroLote:true,numeroManzano:true,numeroVivienda:true,},
        medidor:{id:true,estado:true,isActive:true,funcionamiento:true,nroMedidor:true,medicion:true,}
      },
      relations:{
        medidor:true
      },
      order:{
        isActive:'DESC',
      }
    })
    return {
      OK:true,
      message:'asocciones de perfil',
      data:asociados,
    }
  }

  //TODO: PLANILLAS DE REGISTROS DE LECTURAS DE MEDIDOR
  async createPlanillaMedidor(
    createPlanillaMedidorDto: CreatePlanillaMedidorDto,
  ) {
    const { medidor, gestion, ...dataPlanilla } = createPlanillaMedidorDto;

    const medidorDb = await this.dataSource.getRepository(MedidorAsociado).findOne({
      where: { id: medidor.id },
      relations: { planillas: true,medidor:true },
    });

    if (!medidorDb)
      throw new BadRequestException(
        `Medidor de agua width id: ${createPlanillaMedidorDto.medidor.id} not found`,
      );
    if (medidorDb.planillas.find((reg) => reg.gestion === gestion))
      throw new BadRequestException(
        `Ya existe la gestion ${gestion} registrada para el asociado de id ${medidor.id} con numero:${medidorDb.medidor.nroMedidor}`,
      );

    const planilla = this.dataSource.getRepository(PlanillaLecturas).create({
      ...dataPlanilla,
      gestion,
      medidor: medidorDb,
    });
    try {
      await this.dataSource.getRepository(PlanillaLecturas).save(planilla);
      return {
        OK: true,
        message: 'Planilla de medidor asociado regitrada',
        data: planilla,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  
  
  async updatePlanillaMedidor(
    idPlanilla: number,
    updatePlanillaMedidorDto: UpdatePlanillaMedidorDto,
  ) {
    const { medidor, gestion, ...dataPlanilla } = updatePlanillaMedidorDto;
    const planilla = await this.dataSource.getRepository(PlanillaLecturas).preload({
      id: idPlanilla,
      ...dataPlanilla,
    });
    if (!planilla)
      throw new BadRequestException(
        `Planilla con id ${idPlanilla} no encontrada`,
      );

    try {
      await this.dataSource.getRepository(PlanillaLecturas).save(planilla);
      return {
        OK: true,
        message: 'planilla actualizada',
        data: planilla,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async updateStatusPlanillaMedidor(
    idPlanilla: number,
    updatePlanillaMedidorDto: UpdatePlanillaMedidorDto,
  ) {
    const { estado } = updatePlanillaMedidorDto;
    const planilla = await this.dataSource.getRepository(PlanillaLecturas).preload({
      id: idPlanilla,
      estado,
    });
    if (!planilla)
      throw new BadRequestException(
        `Planilla con id ${idPlanilla} no encontrada`,
      );

    try {
      await this.dataSource.getRepository(PlanillaLecturas).save(planilla);
      return {
        OK: true,
        message: 'estado de planilla actualizada',
        data: planilla,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
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
}
