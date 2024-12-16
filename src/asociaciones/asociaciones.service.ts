import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedidorAsociadoDto } from './dto/create-medidor-asociado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MedidorAsociado } from './entities/medidor-asociado.entity';
import { DataSource, FindOptionsOrder, FindOptionsWhere, ILike, LessThan, Like, OrderByCondition, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { Afiliado, Perfil } from 'src/auth/modules/usuarios/entities';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { UpdateMedidorAsociadoDto } from './dto/update-medidor-asociado.dto';
import { Estado, EstadoAsociacion, TipoMulta } from 'src/interfaces/enum/enum-entityes';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SearchPerfil } from 'src/auth/modules/usuarios/querys/search-perfil';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { PlanillaMesLectura } from 'src/medidores-agua/entities/planilla-mes-lectura.entity';
import { CreateGestionMedidorAsociadoDto } from './dto/create-gestion-medidor-asociacion.dto';
import { UpdateStatusGestion } from './dto/update-status-planilla.dto';
import { UpdatePlanillaMedidorDto } from './dto/update-planilla-medidor.dto';
import { CreatePlanillaMedidorDto } from './dto/create-planilla-medidor.dto';
import { MultaServicio } from 'src/pagos-de-servicio/entities';
import { MultasVariosDto } from './dto/multas-varios.dto';
import { UpdateMultasVariosDto } from './dto/update-multas-varios.dto';
import { HistorialConexiones } from './entities/historial-cortes.entity';
import { MotivoReconexionDto } from './dto/motivo-corte.dto';

@Injectable()
export class AsociacionesService {
  constructor(
    
    @InjectRepository(MedidorAsociado)
    private readonly medidorAsociadoRepository:Repository<MedidorAsociado>,
    @InjectRepository(HistorialConexiones)
    private readonly historialConexionesRepository:Repository<HistorialConexiones>,
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
      const asociacionCreated=await this.medidorAsociadoRepository.save(asociacion);
      const planilla = this.dataSource.getRepository(PlanillaLecturas).create({
        gestion:(new Date()).getFullYear(),
        registrable:true,
        medidor:asociacionCreated
      });
      await this.dataSource.getRepository(PlanillaLecturas).save(planilla);
      return {
        OK:true,
        message:`Asociacion creata con exito!. Planilla de gestión ${planilla.gestion} generada`,
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
    if(estado === null || estado === undefined) throw new BadRequestException(`Debe enviar el estado`);
    if(estado !== Estado.DESHABILITADO) throw new BadRequestException(`Solamente se puede deshabilitar la asociación`);

    const asociacion = await this.medidorAsociadoRepository.findOne({where:{id:idAsociacion},relations:{medidor:true,multasAsociadas:true,planillas:{lecturas:{pagar:true}}}});
    if(!asociacion) throw new NotFoundException(`Asociacion ${idAsociacion} not found`);
    for(const planilla of asociacion.planillas){
      for(const lectura of planilla.lecturas){
        if(lectura.pagar){
          if(!lectura.pagar.pagado) throw new BadRequestException(`La asociación tiene deudas pendientes por pagar, no se puede deshabilitar`);
        }
        
      }
    }
    for(const multa of asociacion.multasAsociadas){
          if(!multa.pagado) throw new BadRequestException(`La asociación tiene multas por pagar, no se pude deshabilitar`);
    }

    try {
      await this.medidorAsociadoRepository.update(asociacion.id,{isActive:false,estado});
      return {
        OK:true,
        message:'Se ha deshabilitado el estado de asocición entre el medidor de agua  y el afiliado',
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
      where:{id,lecturas:{
        registrado:true
      }},
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
    if(!data) throw new BadRequestException(`La gestión no tiene ninguna lectura registrada.`);
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
   
    const {limit=10,offset=0} = paginationDto;
    const {"0":data,"1":size} = await this.dataSource.getRepository(PlanillaLecturas).findAndCount({
      where:[{
        medidor:{id:idAsociacion}}],
        select:{
          id:true,estado:true,gestion:true,registrable:true,isActive:true,medidor:{id:true,}
        },
      relations:{medidor:true},
      order:{gestion:'DESC'}
    })
    return {
      OK:true,
      message:'lista de planillas de gestiones de la asociación',
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
        id:true,estado:true,estadoMedidorAsociado:true,corte:true,reconexion:true,fechaInstalacion:true,isActive:true,lecturaInicial:true,lecturaSeguimiento:true,registrable:true,ubicacion:{barrio:true,latitud:true,longitud:true,manzano:true,nroLote:true,numeroManzano:true,numeroVivienda:true,},
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
      relations: { pagar:{comprobante:true,descuentos:true} },
      select:{
        consumoTotal:true,created_at:true,estadoMedidor:true,id:true,isActive:true,lectura:true,PlanillaMesLecturar:true,estado:true,medicion:true,
        pagar: {created_at:true,estado:true,estadoComprobate:true,
          fechaPagada:true,id:true,metodoRegistro:true,moneda:true,
          monto:true,fechaLimitePago:true,motivo:true,pagado:true,
          descuentos:true,
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

  async listarMultasAsociacion(idAsociacion:number,paginator:PaginationDto){
    const {offset=0,limit=10} =paginator;
    const {"0":data,"1":size} = await this.dataSource.getRepository(MultaServicio).findAndCount({
      where:{id:idAsociacion},
      select:{
        id:true,estado:true,isActive:true,pagado:true,monto:true,moneda:true,motivo:true,created_at:true,
      },
      take:limit,
      skip:offset,
      order:{
        pagado:'ASC',
        id:'DESC'
      }
    });
    return{
      OK:true,
      message:'Multas de medidor de agua asociado',
      data:{
        data,
        size,
        limit,
        offset,
      }
    }
  }
  async getMultaAsociacion(idMulta:number){
    const multa = await this.dataSource.getRepository(MultaServicio).findOne({
      where:{id:idMulta},
      select:{
        id:true,isActive:true,estado:true,moneda:true,monto:true,motivo:true,pagado:true,
        created_at:true,tipoMulta:true,
        comprobante:{
          id:true,entidadPago:true,fechaEmitida:true,metodoPago:true,moneda:true,montoPagado:true,nroRecibo:true,
        }
      },
      relations:{
        comprobante:true
      }
    });
    if(!multa) throw new NotFoundException(`Multa con N° ${idMulta} no encontrada`);
    return{
      OK:true,
      message:'Multa encontrada',
      data:multa
    }
  }


  //OBTENER HISTORIAL DE CORTES DE ASOCIACION
  async obtenerHistorialConexiones(idAsociacion:number,paginatorDto:PaginationDto){
    const {limit,offset} = paginatorDto;
    const {"0":data,"1":size} = await this.historialConexionesRepository.findAndCount({
      where:{
        asociacion:{
          id:idAsociacion
        }
      },
      select:{
        id:true,created_at:true,fechaRealizada:true,isActive:true,motivo:true,estado:true,tipoAccion:true,
        
      },
      order:{
        id:'DESC',
      },
      take:limit,
      skip:offset
    });

    return {
      OK:true,
      message:'HISTORIAL DE CORTES DE SERVICIO REALIZADO',
      data:{
        data,
        size,
        limit,
        offset
      }
    }
  }
  //REGISTRAR CORTE POR CIERRE DE ASOCIACION

  async cancelarCorteServicio(idAsociacion:number){
    const asociacion = await this.medidorAsociadoRepository.findOne({
      where:{id:idAsociacion},
      relations:{
        multasAsociadas:true,
        planillas:{
          lecturas:{
            pagar:true
          }
        }
      }
    });
    if(!asociacion) throw new NotFoundException(`ASOCIACION CON ID ${idAsociacion} NO ENCONTRADA`);
    if(!asociacion.isActive) throw new BadRequestException(`NO SE PUEDE REALIZAR LA ACCION DE CORTE, LA ASOCIACION SE ENCUENTRA DESHABILITADA`);
    if(!asociacion.corte) throw new BadRequestException(`NO SE PUEDE REALIZAR LA ACCION DE CORTE, LA ASOCIACION YA RECIBIO LA ORDEN DE CORTE`);
    if(asociacion.estadoMedidorAsociado !==EstadoAsociacion.conectado) throw new BadRequestException(`NO SE PUEDE REALIZAR LA ACCION DE CORTE, YA SE ENCUENTRA DESCONECTADO`);
    
    try {
      await this.medidorAsociadoRepository.update(asociacion.id,{corte:false,motivoTipoConexion:null});
      return{
        OK:true,
        message:'Se canceló la solicitud de corte de servicio de agua'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
    //REGISTRAR MULTAS TIPO VARIOS
  // async registrarMultaVarios(multaDto:MultasVariosDto){
  //   const {idAsociacion,...dataMulta} =multaDto;
  //   const asociacion = await this.medidorAsociadoRepository.findOne({
  //     where:{id:idAsociacion}
  //   });
  //   if(!asociacion) throw new BadRequestException(`Asociacion no encontrada`);
  //   if(!asociacion.isActive) throw new BadRequestException(`No se puede realizar multas a asociaciones deshabilitadas`);
  //   //MULTA TIPO VARIOS
  //   const multa = this.dataSource.getRepository(MultaServicio).create({...dataMulta,tipoMulta:TipoMulta.varios,medidorAsociado:asociacion});
  //   try {
  //     await this.dataSource.getRepository(MultaServicio).save(multa);
  //     return{
  //       OK:true,
  //       messagE:'LA MULTA FUE CREADA CON EXITO',
  //       data:multa
  //     }
  //   } catch (error) {
  //     this.commonService.handbleDbErrors(error);
  //   }
  // }
  async updateMultaAsociado(idMulta:number,updateMultasDto:UpdateMultasVariosDto){
    const {estado,idAsociacion:idAds,...dataMultaUpdate} = updateMultasDto;

    const multaPreload = await this.dataSource.getRepository(MultaServicio).preload({
      id:idMulta,
      ...dataMultaUpdate,
      estado,
      isActive:estado===Estado.ACTIVO?true:false,
    });
    if(!multaPreload) throw new NotFoundException(`MULTA ${idMulta} NO ENCONTRADA`);
    if(multaPreload.pagado) throw new BadRequestException(`LA MULTA YA FUE PAGADA, NO SE PUEDE MODIFICAR LOS DATOS`);
    try {
      await this.dataSource.getRepository(MultaServicio).save(multaPreload);
      return{
        OK:true,
        message:'MULTA ACTUALIZADA',
        data:multaPreload
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }

  }

  async solicitudCorte(idAsociacion:number,{motivo}:MotivoReconexionDto){
    const asociacion = await this.medidorAsociadoRepository.findOne({
      where:{id:idAsociacion},
      relations:{
        planillas:{
          lecturas:{
            pagar:true,
            
          }
        },
        multasAsociadas:true,
        medidor:true
      }
    });
    if(!asociacion) throw new NotFoundException(`Asociacion with ID ${idAsociacion} not found`);
    if(!asociacion.isActive) throw new BadRequestException(`No se puede realizar solicitud de corte a una asociacion cerrada`);
    if(asociacion.corte) throw new BadRequestException(`No se puede solicitar un corte a la sociacion que ya solicito nuevamente el corte`);
    if(asociacion.estadoMedidorAsociado ===EstadoAsociacion.desconectado) throw new BadRequestException(`No se puede solicitar un corte a una asociacion que ya ha sido cortada`);
    if(!asociacion.medidor.isActive) throw new BadRequestException(`No se puede realizar una solicitud de desconeccion al medidor deshabilitado`);
    //AGREGANDO SOLICITUD DE CORTE
    for(const planilla of asociacion.planillas){
      for(const lectura of planilla.lecturas){
        if(lectura.registrado)
        if(!lectura.pagar.pagado) throw new BadRequestException(`No se puede solicitar un corte de servicio sin haber pagado todos los pagos de lecturas`);
      }
    }
    for(const multas of asociacion.multasAsociadas){
      if(!multas.pagado) throw new BadRequestException(`No se puede solicitar un corte de servicio sin haber pagado las multas por pagar`);
    }
    try {
      await this.medidorAsociadoRepository.update(asociacion.id,{corte:true,motivoTipoConexion:motivo}); // SOLCIITUD DE CORTE, SE AÑADIRA EN LA FUNCION DE LISTAR AFILIADOS PARA CORTES DE SERVICIO
      return{
        OK:true,
        message:'Solicitud de corte realizado'
      }
    } catch (error) {
      throw this.commonService.handbleDbErrors(error)
    }
  }
  async realizarSolicitudReconexion(idAsociado:number,{motivo}:MotivoReconexionDto){
    const asociacion = await this.medidorAsociadoRepository.findOne({
      where:{id:idAsociado},
      relations:{
        multasAsociadas:true,
        planillas:{
          lecturas:{
            pagar:true
          }
        }
      }
    });
    if(!asociacion) throw new NotFoundException(`Asociacion no encontrada`);
    if(!asociacion.isActive) throw new BadRequestException(`La asociacion esta deshabilitada`);
    if(asociacion.corte) throw new BadRequestException(`La asociacion se encuentra en proceso de corte de servicio`);
    if(asociacion.reconexion) throw new BadRequestException(`Ya se ha solicitado la reconexión de servicio`);
    // SOLAMENTE SI SE SOLICTA RECONECION TRUE
      for(const multas of asociacion.multasAsociadas){
        if(!multas.pagado) throw new BadRequestException(`No se puede solicitar una reconexión hasta que se paguen deudas por pagar`);
      }
      for(const planilla of asociacion.planillas){
        for(const lectura of planilla.lecturas){
          if(lectura.registrado)
            if(!lectura.pagar.pagado) throw new BadRequestException(`No se puede solicitar una reconexión hasta que se paguen deudas por pagar`);
        }
      }
    
    try {
      await this.medidorAsociadoRepository.update(asociacion.id,{reconexion:true,motivoTipoConexion:motivo});
      return{
        OK:true,
        message:'SE REALIZARA LA RECONEXIÓN DEL MEDIDOR DE AGUA'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async cancelarReconexion(idAsociacion:number){
    const asociacion = await this.medidorAsociadoRepository.findOne({
      where:{id:idAsociacion},
      relations:{
        multasAsociadas:true,
        planillas:{
          lecturas:{
            pagar:true
          }
        }
      }
    });
    if(!asociacion) throw new NotFoundException(`ASOCIACION CON ID ${idAsociacion} NO ENCONTRADA`);
    if(!asociacion.isActive) throw new BadRequestException(`NO SE PUEDE REALIZAR LA ACCION , LA ASOCIACION SE ENCUENTRA DESHABILITADA`);
    if(!asociacion.reconexion) throw new BadRequestException(`NO SE PUEDE REALIZAR LA ACCION, NO TIENE SOLICITUD DE ORDEN DE RECONEXIÓN`);
    if(asociacion.estadoMedidorAsociado !==EstadoAsociacion.desconectado) throw new BadRequestException(`NO SE PUEDE REALIZAR LA ACCION DE CANCELAR SOLICITUD DE RECONEXIÓN, YA SE ENCUENTRA CONECTADO`);
    
    try {
      await this.medidorAsociadoRepository.update(asociacion.id,{reconexion:false,motivoTipoConexion:null});
      return{
        OK:true,
        message:'Se canceló la solicitud de reconexión del servicio de agua'
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
}
