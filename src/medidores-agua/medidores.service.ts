import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CreateMedidorDto } from './dto/create-medidor.dto';
import { UpdateMedidorDto } from './dto/update-medidor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOperator, FindOptionsWhere, ILike, IsNull, Like, Repository, SelectQueryBuilder } from 'typeorm';
import { Medidor } from './entities/medidor.entity';
import { CommonService } from '../common/common.service';
import { Afiliado } from '../auth/modules/usuarios/entities/afiliado.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Perfil } from 'src/auth/modules/usuarios/entities';
import { Barrio, Estado, Mes } from 'src/interfaces/enum/enum-entityes';
import { CreatePlanillaMedidorDto } from './dto/create-planilla-medidor.dto';
import { PlanillaLecturas } from './entities/planilla-lecturas.entity';
import { MesLectura } from './entities/mes-lectura.entity';
import { UpdatePlanillaMedidorDto } from './dto/update-planilla-medidor.dto';
import { registerAllLecturasDto } from './dto/register-all-lecturas.dto';
import { AnioSeguimientoLectura } from './entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from './entities/mes-seguimiento-registro-lectura.entity';
import { QueryLecturasDto } from './query/queryLecturas';
import { Cron,CronExpression } from '@nestjs/schedule';
import { isNotEmpty } from 'class-validator';
import { MedidorAsociado } from './entities/medidor-asociado.entity';
import { CreateMedidorAsociadoDto } from './dto/create-medidor-asociado.dto';
import { UpdateMedidorAsociadoDto } from './dto/update-medidor-asociado.dto';

@Injectable()
export class MedidoresService {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
    @InjectRepository(Medidor)
    private readonly medidorRepository: Repository<Medidor>,
    
    @InjectRepository(MedidorAsociado)
    private readonly medidorAsociadoRepository:Repository<MedidorAsociado>,
    @InjectRepository(PlanillaLecturas)
    private readonly planillasMedidoresRepository: Repository<PlanillaLecturas>,
    @InjectRepository(MesLectura)
    private readonly mesLecturasRepository: Repository<MesLectura>,

    @InjectRepository(AnioSeguimientoLectura)
    private readonly anioSeguimientoLecturaRepository: Repository<AnioSeguimientoLectura>,
    @InjectRepository(MesSeguimientoRegistroLectura)
    private readonly mesSeguimientoRegistroLecturaRepository: Repository<MesSeguimientoRegistroLectura>,

    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
  ) {}
  async create(createMedidoreDto: CreateMedidorDto) {
    // const { } = createMedidoreDto;
    
    const medidor = this.medidorRepository.create({
    lecturaMedidor:createMedidoreDto.lecturaInicial,
      ...createMedidoreDto});
    try {
      await this.medidorRepository.save(medidor);
      return {
        OK: true,
        message: 'Medidor creado con exito',
        data: medidor,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async createAsociacion(createMedidorAsociado:CreateMedidorAsociadoDto){

    const {afiliado,medidor,ubicacion,...dataAsociacion} = createMedidorAsociado;
    const afiliadoDb = await this.dataSource.getRepository(Afiliado).findOneBy({id:afiliado.id});
    if(!afiliadoDb) throw new NotFoundException(`Afiliado con ID: ${afiliado.id} not found`);
    if(!afiliadoDb.isActive) throw new BadRequestException(`No se puede asociar con afiliado deshabilitado`);
    
    const medidorDb = await this.medidorRepository.findOne({where:{id:medidor.id},relations:{medidorAsociado:true}})
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
        msg:`Asociacion Exitosa!`,
        data:asociacion,
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error)
    }
  }
  async updateAsociacion(idAsociacion,dataUpdate:UpdateMedidorAsociadoDto){
    const {afiliado,estado,medidor,...data}=dataUpdate
    const asociacion = await this.medidorAsociadoRepository.preload({id:idAsociacion,...data});
    if(!asociacion) throw new NotFoundException(`ASOCIACION ${idAsociacion} NOT FOUND`);
    try {
      await this.medidorAsociadoRepository.save(asociacion);
      return {
        OK:true,
        msg:`Asociacion actualizada correctamente!`,
        data:asociacion,
      }
    } catch (error) {
      
      this.commonService.handbleDbErrors(error)
    }
  }
  async updateStatusAsociacion(idAsociacion:number,updateMedidorAsociadoDto:UpdateMedidorAsociadoDto){
    const {estado} =updateMedidorAsociadoDto;
    if(estado === null || estado === undefined) throw new BadRequestException(`Debe Enviar un estado!`);

    const asociacion = await this.medidorAsociadoRepository.findOne({where:{id:idAsociacion},relations:{medidor:true,}});
    if(!asociacion) throw new NotFoundException(`Asociacion ${idAsociacion} not found`);
    if(!asociacion.medidor.isActive) throw new BadRequestException(`El medidor ${asociacion.medidor.nroMedidor} no se encuentra disponible`);
    
    if(estado === Estado.ACTIVO){
      if(asociacion.isActive) throw new BadRequestException(`La asociacion ya se encuentra activa`)
      else{
        if(await this.medidorAsociadoRepository.exist({where:{isActive:true,medidor:{id:asociacion.medidor.id}}})) throw new BadRequestException(`El medidor ${asociacion.medidor.nroMedidor} se encuentra asociado con un afiliado`)
        else{
          asociacion.isActive=true;
          asociacion.estado=Estado.ACTIVO
        } 
      }
    }else{
      if(!asociacion.isActive) throw new BadRequestException(`La asociacion ya se encentra desactiva`);
      else{
        // if(await this.medidorAsociadoRepository.exist({where:{id:asociacion.id,planillas:{lecturas:{pagar:{pagado:false}}}},relations:{planillas:{lecturas:{pagar:true,}}}})) throw new BadRequestException(`El asociado tiene deudas pendientes por pagar, no se puede deshabilitar`);
        // else{
          // }
          asociacion.isActive=false;
          asociacion.estado=Estado.DESHABILITADO;
      }

    }
    try {
      await this.medidorAsociadoRepository.save(asociacion);
      return {
        OK:true,
        msg:'cambio con exito!',
        data:await this.findAfiliadoByAsociacion(asociacion.id),
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error)
    }
  }
  async findAsociacion(idAsociacion:number){
    const data = await this.medidorAsociadoRepository.findOne({
      where:{
        id:idAsociacion
      },
      relations:{
        medidor:true,
        afiliado:{
          perfil:true,
        }
      },
      select:{
        id:true,isActive:true,
        estadoMedidorAsociado:true,
        fechaInstalacion:true,
        lecturaInicial:true,
        lecturaSeguimiento:true,
        registrable:true,
        estado:true,
        ubicacion:{
          barrio:true,
          latitud:true,
          longitud:true,
          numeroVivienda:true
        },
        medidor:{
          id:true,
          estado:true,isActive:true,
          nroMedidor:true,
          medicion:true,
        },
        afiliado:{
          id:true,isActive:true,
          estado:true,
          perfil:{
            id:true,CI:true,
            apellidoPrimero:true,
            apellidoSegundo:true,
            nombrePrimero:true,
            nombreSegundo:true,
            estado:true,isActive:true,  
          }
        }
      }
    })
    if(!data) throw new BadRequestException(`Asociacion ${idAsociacion} not found`);
    return{
      OK:true,
      msg:'asociacion ',
      data
    }
  }
  async findMedidorWithAsociation(idMedidor:number){
    const medidor = await this.medidorRepository.findOne({
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
      msg:'Medidor encontrado',
      data:medidor,
    }
  }
 async findMedidoresWithoutAsociacion(paginationDto:PaginationDto){ // obtener medidores sin asociaciones y asociaciones inactivas
   const { order = 'ASC', q = '' } = paginationDto;
   const { '0': data, '1': size } = await 
   this.medidorRepository.findAndCount({
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
  async findAllMedidoresWithAfiliados(paginationDto: PaginationDto) {
    const { offset = 0, limit = 10, order = 'ASC', q = '' } = paginationDto;
    let arg =[''];
    if(q.length>0){
      arg =q.toLocaleLowerCase().split(/\s/).filter(val=>val.length>0);
    }
    if(arg.length===0) arg=[''];
    
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
    const qb = this.perfilRepository.createQueryBuilder('perfil');
    const { '0': data, '1': size } = await qb
      .innerJoinAndSelect(
        'perfil.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfil.id',
      )
      .leftJoinAndSelect(
        'afiliado.medidorAsociado',
        'medidor',
        'medidor."afiliadoId" = afiliado.id AND medidor.isActive = true',
      )
      // .where('perfil.nombre_primero LIKE :query', { query: `${q}%` })
      .orWhere(finders)
      // .orWhere('perfil.nombre_segundo LIKE :query', { query: `${q}%` })
      // .orWhere('perfil.apellido_primero LIKE :query', { query: `${q}%` })
      // .orWhere('perfil.apellido_segundo LIKE :query', { query: `${q}%` })
      // .orWhere('perfil.cedula_identidad LIKE :query', { query: `${q}%` })
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

  async findAllMedidorOneAfiliado(id: number) {
   
    const afiliadoWithMedidores = await this.perfilRepository.findOne({
      relations: { afiliado: { medidorAsociado: {medidor:true} } },
      // select: {},
      where: { id },
    });
    if (!afiliadoWithMedidores)
      throw new NotFoundException(
        `Perfil de afiliado with Id: ${id} not found`,
      );
    return {
      OK: true,
      message: 'lista de medidores de afiliado',
      data: afiliadoWithMedidores,
    };
  }
  private async findAfiliadoByAsociacion(id: number) {
    return await this.perfilRepository.findOne({
      where: {
        afiliado: {
          medidorAsociado:{
            id
          }
        },
      },
      relations: { afiliado: {medidorAsociado:{ medidor: true} } },
    });
  }

  async update(id: number, updateMedidoreDto: UpdateMedidorDto) {
    const  dataMedidor  = updateMedidoreDto;
    const medidor = await this.medidorRepository.preload({
      id,
      ...dataMedidor,
    });
    if (!medidor)
      throw new NotFoundException(`Medidor with id ${id} not found`);
    try {
      await this.medidorRepository.save(medidor);
      return {
        OK: true,
        message: 'Medidor actualizado',
        data: medidor,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async updateStatus(id: number, updateMedidoreDto: UpdateMedidorDto) {
    const { estado } = updateMedidoreDto;
    const medidor = await this.medidorRepository.findOne({
      where:{
        id,
      },
      relations:{
        medidorAsociado:true,
      }
    });
    if (!medidor)
      throw new NotFoundException(`Medidor with id ${id} not found`);
    if(estado){
      medidor.isActive=true;
      medidor.funcionamiento='NO'
    }else{
      for(const asc of medidor.medidorAsociado){
        if(asc.isActive) throw new BadRequestException(`El medidor con nro: ${id} tiene una asociacion, no se puede deshabilitar un medidor con una asociacion activa`);
      }
      medidor.isActive=false;
      medidor.funcionamiento='DESHABILITADO';
    }
    try {
      await this.medidorRepository.save(medidor);
      return {
        OK: true,
        message: `estado del medidor cambiado`,
        data: medidor,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async findMedidores(query:PaginationDto){

    const {q='',limit=10,offset=0,order='ASC'} = query;
    const medidoresFind = await this.medidorRepository.find({
      where:[{nroMedidor:ILike(`%${q}%`)},
             {marca:ILike(`%${q}%`)},
      ],
      select:{
        id:true,estado:true,isActive:true,marca:true,nroMedidor:true,funcionamiento:true,medidorAsociado:{
          id:true,isActive:true,
        }
      },
      relations:{medidorAsociado:true,},
      skip: offset,
      take: limit,
      order: {
        id: order,
      },
    });

    return {
      OK: true,
      message: 'Medidores ',
      data: {
        data:medidoresFind,
        size:medidoresFind.length,
        offset,
        limit,
        order,
      },
    };
  }
  async findMedidorByNro(nroMedidor: string) {
    const data = await this.medidorRepository.findOneBy({ nroMedidor });
    return {
      OK: true,
      message: 'Medidor con nro',
      data,
    };
  }

  //TODO: PLANILLAS DE REGISTROS DE LECTURAS DE MEDIDOR
  async createPlanillaMedidor(
    createPlanillaMedidorDto: CreatePlanillaMedidorDto,
  ) {
    const { medidor, gestion, ...dataPlanilla } = createPlanillaMedidorDto;

    const medidorDb = await this.medidorAsociadoRepository.findOne({
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

    const planilla = this.planillasMedidoresRepository.create({
      ...dataPlanilla,
      gestion,
      medidor: medidorDb,
    });
    try {
      await this.planillasMedidoresRepository.save(planilla);
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
    const planilla = await this.planillasMedidoresRepository.preload({
      id: idPlanilla,
      ...dataPlanilla,
    });
    if (!planilla)
      throw new BadRequestException(
        `Planilla con id ${idPlanilla} no encontrada`,
      );

    try {
      await this.planillasMedidoresRepository.save(planilla);
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
    const planilla = await this.planillasMedidoresRepository.preload({
      id: idPlanilla,
      estado,
    });
    if (!planilla)
      throw new BadRequestException(
        `Planilla con id ${idPlanilla} no encontrada`,
      );

    try {
      await this.planillasMedidoresRepository.save(planilla);
      return {
        OK: true,
        message: 'estado de planilla actualizada',
        data: planilla,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async findAllPlanillasWidthMedidores() {
    const qb = this.medidorRepository.createQueryBuilder('medidor');
    const { '0': data, '1': size } = await qb
      .innerJoinAndSelect('medidor.medidorAsociado','medidor_asociado')
      .innerJoinAndSelect('medidor_asociado.planillas', 'planillas')
      .getManyAndCount();
    return {
      OK: true,
      message: 'lista de planillas de medidores',
      data,
    };
  }

  async registrarAllLecturas(registerAllLecturas: registerAllLecturasDto) {
    // console.log(registerAllLecturas);
    const fechaLecturas = new Date();
    let gestion = fechaLecturas.getFullYear();
    let index = fechaLecturas.getMonth()-1;
    let mes = new Date(gestion,fechaLecturas.getMonth()-1).toLocaleString('default', { month: 'long' }).toUpperCase();
    if(fechaLecturas.getMonth() === 0){
      gestion = fechaLecturas.getFullYear()-1;
      mes = new Date(gestion,11).toLocaleString('default', { month: 'long' }).toUpperCase();
      index = 11;
    }
    const { registros} = registerAllLecturas;
    const anioExiste = await this.anioSeguimientoLecturaRepository.findOne({
      where: { anio:gestion },
      relations: { meses: true },
    });
    if (!anioExiste) throw new BadRequestException(`No es un año registrado`);
    const mesExiste = anioExiste.meses.find((mesT) => mesT.mes === mes);
    if (!mesExiste)
      throw new BadRequestException(
        `${mes} no es un un mes registrado del año ${gestion}`,
      );
    const fechaActual = new Date();
    if( fechaActual.getTime()<=mesExiste.fechaRegistroLecturas.getTime() || fechaActual.getTime()>= mesExiste.fechaFinRegistroLecturas.getTime()){
      throw new BadRequestException(`No se encuentra en el rango de fecha establecida permitada para registro`)
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const lecturas: MesLectura[] = [];
    for (const lectura of registros) {
      const planillaDb = await this.planillasMedidoresRepository.findOne({
        where: { id: lectura.planilla.id },
        relations: { lecturas: true, medidor: true },
      });
      if (!planillaDb)
        throw new BadRequestException(`No existe la planilla con id ${lectura.planilla.id}`);
      if (planillaDb.lecturas.find((reg) => reg.mesLecturado === mes))
        throw new BadRequestException(`Ya se ha registrado en el mes ${mes} de la planilla-gestion: ${planillaDb.gestion}`);
      const { planilla, ...dataLectura } = lectura;
      const {medidor} = planillaDb;
      const consumoTotal=(lectura.lectura-medidor.lecturaSeguimiento);
      const lecturaRegister = this.mesLecturasRepository.create({
        ...dataLectura,
        // mesLecturado: mes,
        mesLecturado:mesExiste.mes,
        consumoTotal,
        planilla: planillaDb,
      });
      lecturas.push(lecturaRegister);
      medidor.lecturaSeguimiento=(medidor.lecturaSeguimiento+consumoTotal);
      await queryRunner.manager.save(medidor)
    }
    try {
      await queryRunner.manager.save(lecturas);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        message: 'lecturas guardadas!',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
  async AllLecturasPerfilesMedidores(query: QueryLecturasDto) {
    const fechaLecturas = new Date();
    let gestion = fechaLecturas.getFullYear();
    let index = fechaLecturas.getMonth()-1;
    let mes = new Date(gestion,fechaLecturas.getMonth()-1).toLocaleString('default', { month: 'long' }).toUpperCase();
    if(fechaLecturas.getMonth() === 0){
      gestion = fechaLecturas.getFullYear()-1;
      mes = new Date(gestion,11).toLocaleString('default', { month: 'long' }).toUpperCase();
      index = 11;
    }
    const mesSeguimineto = await this.mesSeguimientoRegistroLecturaRepository.findOne({
      where:{mes:
        index===0?Mes.enero
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
        :Mes.enero,
        anioSeguimiento:{anio:gestion}},
      relations:{anioSeguimiento:true,}
    })

    // if(!mesSeguimineto)throw new BadRequestException(`Gestion: ${gestion}, mes: ${mes} aun no generados`);
    // if(mesSeguimineto.fechaRegistroLecturas.getTime()<fechaLecturas.getTime()){
    //   if(mesSeguimineto.fechaFinRegistroLecturas.getTime()<fechaLecturas.getTime()){
    //     throw new BadRequestException(`Fecha de registro de lecturas del mes ${mes}, gestion: ${gestion} finalizadas ${mesSeguimineto.fechaFinRegistroLecturas}`)
    //   }
    // }else{
    //   throw new BadRequestException(`Los registros de lectura se podran registrar a la fecha ${mesSeguimineto.fechaRegistroLecturas}`)
    // }
    const {
      // gestion = new Date().getFullYear(),
      barrio,
      // mes = Mes.enero,
    } = query;
    // console.log(gestion, barrio, mes);
    const qb = this.perfilRepository.createQueryBuilder('perfiles');
    let data:Perfil[]=[];
    let size =0;
    if( isNotEmpty( barrio)){
      console.log('tiene barrio:', barrio);
      const plan = await qb
      .innerJoinAndSelect(
        'perfiles.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfiles.id AND afiliado.isActive = true',
      )
      .innerJoinAndSelect(
        'afiliado.medidor_asociado',
        'asociado',
        'asociado."afiliadoId" = afiliado.id AND asociado."ubicacionBarrio" = :barrio AND asociado.isActive = true AND asociado.registrable = true',
        {barrio}
      ).innerJoinAndSelect(
        'asociado.medidor',
        'medidor',
        'medidor.id = asociado.id AND medidor.isActive = true '
      )
      .innerJoinAndSelect(
        'asociado.planillas',
        'planilla',
        'planilla."medidorId" = medidor.id AND planilla.isActive = true AND planilla.registrable = true',
      )
      .leftJoinAndSelect(
        'planilla.lecturas',
        'lecturas',
        'lecturas.mesLecturado = :mes',
        { mes },
      )
      .where('planilla.gestion =:gestion', { gestion })
      .getManyAndCount();
     
      data = plan[0];
      size = plan[1];
    }else{
      console.log('sin barrio',barrio);
      const plan = await qb
      .innerJoinAndSelect(
        'perfiles.afiliado',
        'afiliado','afiliado."perfilId" = perfiles.id AND afiliado.isActive = true'
      )
      .innerJoinAndSelect(
        'afiliado.medidorAsociado',
        'asociado',
        'asociado."afiliadoId" = afiliado.id AND asociado.isActive = true AND asociado.registrable = true'
      )
      .innerJoinAndSelect(
        'asociado.medidor',
        'medidor',
        'medidor.id = asociado.id AND medidor.isActive = true'
      )
      .innerJoinAndSelect(
        'asociado.planillas',
        'planilla',
        'planilla."medidorId" = medidor.id AND planilla.isActive = true AND planilla.registrable = true'
      )
      .leftJoinAndSelect(
        'planilla.lecturas',
        'lecturas',
        'lecturas.mesLecturado = :mes',{ mes }
      )
      .where('planilla.gestion =:gestion', { gestion })
      .getManyAndCount();
      
      data = plan[0];
      size = plan[1];
    }
    const perfilesSinLectura:Perfil[]=[];
    // console.log(data);
    for(const per of data){
      const medInd:number[]=[];
      // const {medidores} = per.afiliado;
      const dataPerfil = Object.assign({},per);
       dataPerfil.afiliado = Object.assign({},per.afiliado);
       dataPerfil.afiliado.medidorAsociado=per.afiliado.medidorAsociado.map(med=> Object.assign({},med))
       dataPerfil.afiliado.medidorAsociado=[];
      
      for(let i =0;i< per.afiliado.medidorAsociado.length;i++){
        if(per.afiliado.medidorAsociado[i].planillas[0].lecturas.length===0){
          medInd.push(i);
          // perfilesSinLectura.push(per);
          // console.log('aloja ',i);
          // console.log(per.afiliado.medidores[i]);
          dataPerfil.afiliado.medidorAsociado.push(Object.assign({},per.afiliado.medidorAsociado[i]))
        }
      }
      if(medInd.length>0)
      perfilesSinLectura.push(dataPerfil);
    }
    return {
      OK: true,
      message: `REGISTRO DE LECTURAS DE MEDIDORES DEL mes ${mes}, gestion: ${gestion}`,
      data: {
        // datita:data,
        data:perfilesSinLectura,
        size:perfilesSinLectura.length,
        // data,size
      },
    };
    
  }
  async afiliadosPorGenerarComprobantes(){
    const fechaLecturas = new Date();
    let gestion = fechaLecturas.getFullYear();
    let index = fechaLecturas.getMonth()-1;
    let mes = new Date(gestion,fechaLecturas.getMonth()-1).toLocaleString('default', { month: 'long' }).toUpperCase();
    if(fechaLecturas.getMonth() === 0){
      gestion = fechaLecturas.getFullYear()-1;
      mes = new Date(gestion,11).toLocaleString('default', { month: 'long' }).toUpperCase();
      index = 11;
    }
    // const {
    //   gestion = new Date().getFullYear(),
    //   mes = Mes.enero,
    // } = query;
    // console.log(gestion, barrio, mes);
    const qb = this.perfilRepository.createQueryBuilder('perfiles');
    const {"0":data,"1":size}= await qb
      .innerJoinAndSelect(
        'perfiles.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfiles.id AND afiliado.isActive = true',
      )
      .innerJoinAndSelect(
        'afiliado.medidorAsociado',
        'medidor_asociado',
        'medidor_asociado."afiliadoId" = afiliado.id AND medidor_asociado.isActive = true'
      ).innerJoinAndSelect(
        'medidor_asociado.medidor',
        'medidor',
        'medidor.id = medidor_asociado.id AND medidor.isActive = true'
      )
      .innerJoinAndSelect(
        'medidor_asociado.planillas',
        'planilla',
        'planilla."medidorId" = medidor.id AND planilla.isActive = true',
      )
      .innerJoinAndSelect(
        'planilla.lecturas',
        'lecturas',
        'lecturas.mesLecturado = :mes',
        { mes },
      )
      .leftJoinAndSelect(
        'lecturas.pagar',
        'pagar',
        'pagar."lecturaId" = lecturas.id'
      )
      .where('planilla.gestion =:gestion', { gestion })
      .getManyAndCount();
      const perfilesSinLectura:Perfil[]=[];
      for(const per of data){
        const medInd:number[]=[];
        // const {medidores} = per.afiliado;
        const dataPerfil = Object.assign({},per);
         dataPerfil.afiliado = Object.assign({},per.afiliado);
         dataPerfil.afiliado.medidorAsociado=per.afiliado.medidorAsociado.map(med=> Object.assign({},med))
         dataPerfil.afiliado.medidorAsociado=[];
        for(let i =0;i< per.afiliado.medidorAsociado.length;i++){
          if(per.afiliado.medidorAsociado[i].planillas[0].lecturas[0].pagar === null){
            medInd.push(i);
            dataPerfil.afiliado.medidorAsociado.push(Object.assign({},per.afiliado.medidorAsociado[i]))
          }
        }
        if(medInd.length>0)
        perfilesSinLectura.push(dataPerfil);
      }
      return {
        OK: true,
        message: `LISTADO DE LOS MEDIDORES DE AFILIADOS SIN GENERACION DE PAGOS DEL MES: ${mes} ${gestion}`,
        data:perfilesSinLectura,
      };
  }
  async getAniosSeguimientos() {
    const data = await this.anioSeguimientoLecturaRepository.find({
      order: { anio: 'DESC', meses: { mes: 'ASC' } },
      relations: { meses: true },
      select:{anio:true,meses:{mes:true},}
    });

    return {
      OK:true,
      message:'años de registros de lecturas',
      data
    };
  }
  async getPlanillasMedidorAsociado(idAsociado:number){
    // const medidor = await this.medidorRepository.findOne({where:{id:idMedidor,planillas:{isActive:true}},relations:{planillas:true},select:{nroMedidor:true,planillas:{gestion:true,id:true}}});
    const qb = this.medidorAsociadoRepository.createQueryBuilder('asociado')
    const medidor = await qb
                          .select(['asociado.id','asociado.estadoMedidorAsociado','asociado.isActive',
                                    'medidor.nroMedidor','medidor.id','medidor.isActive',
                                    'planillas.id','planillas.isActive','planillas.estado','planillas.gestion'])
                          .innerJoinAndSelect('asociado.medidor','medidor','medidor.id = asociado.medidorId')
                          .leftJoinAndSelect('asociado.planillas','planillas','planillas.medidorId = asociado.id')
                          .where('asociado.id = :idAsociado',{idAsociado})
                          // .select(['planillas.id','planillas.gestion'])
                          
                          .getOne();
    //console.log(medidor);
    if(!medidor) throw new BadRequestException(`Medidor de agua asociado width id ${idAsociado} not found`);
    if(!medidor.isActive) throw new BadRequestException(`El medidor no se encuentra disponible`);
    const {id,medidor:{nroMedidor},planillas,estadoMedidorAsociado,estado,isActive} = medidor;
    // console.log(medidor);
    return {
      OK:true,
      message:'planillas encontrado',
      data:{id,medidor:{nroMedidor},estado,estadoMedidorAsociado,isActive,planillas},
    }
  }
  async getMesesSeguimientos(query: QueryLecturasDto){
    const {gestion=new Date().getFullYear(),} = query;
    const seg = await this.anioSeguimientoLecturaRepository.findOne({where:{anio:gestion},relations:{meses:true},select:{anio:true,id:true,isActive:true,meses:{mes:true,id:true,fechaFinRegistroLecturas:true,fechaRegistroLecturas:true}},order:{meses:{id:{direction:'ASC'}}}});
    if(!seg) throw new BadRequestException(`Año ${gestion} no registrado`);
    if(!seg.isActive) throw new BadRequestException(`Año ${gestion} no disponible`);
    return {
      OK:false,
      message:`Lista de meses registrados del año ${gestion}`,
      data:seg
    }
  }
  async getPlanillasRegisters(query: QueryLecturasDto){
    const {gestion=new Date().getFullYear(),mes = Mes.enero,barrio = Barrio._20DeMarzo,} = query;
    // console.log(gestion, barrio, mes);
    const qb = this.perfilRepository.createQueryBuilder('perfiles');
    const { '0': data, '1': size } = await qb

      .innerJoinAndSelect(
        'perfiles.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfiles.id',
      )
      .innerJoinAndSelect(
        'afiliado.medidorAsociado',
        'medidor_asociado',
        'medidor_asociado."afiliadoId" = afiliado.id AND medidor_asociado."ubicacionBarrio" = :barrio',
        {barrio}
      ).innerJoinAndSelect(
        'medidor_asociado.medidor',
        'medidor',
        'medidor.id = medidor_asociado.id AND medidor.isActive = true'
      )
      .innerJoinAndSelect(
        'medidor_asociado.planillas',
        'planilla',
        'planilla."medidorId" = medidor.id AND planilla.isActive = true',
      )
      .leftJoinAndSelect(
        'planilla.lecturas',
        'lecturas',
        'lecturas.mesLecturado = :mes',
        { mes },
      )
      //.select([''])
      .where('planilla.gestion =:gestion', { gestion })
      //.andWhere('perfiles.isActive = true',{})
      // .andWhere('lecturas.mesLecturado = :mes',{mes})
      .getManyAndCount();
      return {
        OK: true,
        message: 'listado de perfiles con lecturas mensuales',
        data: {
          data,
          size,
        },
      };
  }
  async lecturasPlanilla(idPlanilla:number){
    const planilla = await this.planillasMedidoresRepository.findOne({where:{id:idPlanilla},relations:{lecturas:true}});
    if(!planilla) throw new BadRequestException(`Planilla de lecturas no encontrada`);
    if(!planilla.isActive) throw new BadRequestException(`La planilla no se encuentra disponible`);
    return{
      OK:true,
      message:'planilla encontrada',
      data:planilla
    }
  }
  async lecturaDetails(idLectura:number){
    const lectura = await this.mesLecturasRepository.findOne(
      {where:{id:idLectura},
      select:{
        consumoTotal:true,created_at:true,estadoMedidor:true,id:true,lectura:true,mesLecturado:true,
       // LecturaPorPagar:{created_at:true,estadoComprobate:true,fechaPagada:true,estado:true,metodoRegistro:true,moneda:true,monto:true,motivo:true,pagado:true,
        //comprobante:{created_at:true,entidadPago:true,fechaEmitida:true,id:true,metodoPago:true,montoPagado:true,nroRecibo:true,}}},
      //relations:{LecturaPorPagar:{comprobante:true}}})
      }})
      if(!lectura) throw new BadRequestException(`Lectura no encontrada`);
    return{
      OK:true,
      message:'Lectura encontrada',
      data:lectura,
    }
  }

  //METHODS USER AFILIADO

  async listarMedidores(idUsuario:number){
    const qb =  await this.dataSource.getRepository(MedidorAsociado).find({where:{afiliado:{perfil:{usuario:{id:idUsuario}}}},select:{estado:true,estadoMedidorAsociado:true,fechaInstalacion:true,id:true,isActive:true,lecturaInicial:true,lecturaSeguimiento:true,ubicacion:{barrio:true,latitud:true,longitud:true,numeroVivienda:true},medidor:{nroMedidor:true,id:true,marca:true,}},relations:{medidor:true}});
    return {
      OK:true,
      message:'medidores',
      data:qb
    }
  }


  //* TASK SCHEDULING
  private readonly logger = new Logger(MedidoresService.name);
  //@Cron('45 * * * * *')
  @Cron(CronExpression.EVERY_YEAR)
  private async registrarAnioSeguimiento(){
    
    const yearAct = new Date().getFullYear();
    const dateSeguimiento= await this.anioSeguimientoLecturaRepository.findOneBy({anio:yearAct});
    if(dateSeguimiento){
      this.logger.error(`Year ${yearAct} exist!`)
    }else{
      const date = this.anioSeguimientoLecturaRepository.create({anio:yearAct});
      await this.anioSeguimientoLecturaRepository.save(date);
      this.logger.log(`Year ${yearAct} registered!`)
    }
  }
  //@Cron('15 * * * * *')
  @Cron(CronExpression.EVERY_YEAR)
  private async registrarPlanillasDeMedidores(){
    const yearAct = new Date().getFullYear();
    const dateSeguimiento= await this.anioSeguimientoLecturaRepository.findOneBy({anio:yearAct});
    if(dateSeguimiento){
      const afiliados = await this.dataSource.getRepository(Afiliado).find({where:{isActive:true,medidorAsociado:{isActive:true,registrable:true,}},relations:{medidorAsociado:{medidor:true,}}});
      //this.logger.verbose(afiliados,'papitas :3');
      for(const afiliado of afiliados){
        for(const medidor of afiliado.medidorAsociado){
          const planillaExist = await this.planillasMedidoresRepository.findOneBy({gestion:yearAct});
          if(planillaExist){
            this.logger.warn(`Planilla ${yearAct} del medidor asociado${medidor.medidor.nroMedidor} ya existe`);
          }else{
            const planilla = this.planillasMedidoresRepository.create({gestion:yearAct});
            try {
              await this.planillasMedidoresRepository.save(planilla);
              this.logger.log(`Planilla ${yearAct} del medidor ${medidor.medidor.nroMedidor} creada!!`);
            } catch (error) {
              this.logger.warn('OCURRIO UN ERROR AL REGISTRAR');
              this.logger.warn(error);
            }
          }
        }
      }
    }else{

      this.logger.error(`Year ${yearAct} no registered!`)
    }
  }
  // @Cron('10 * * * * *')
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  private async registrarMesSeguimiento(){
    
    const fechaActual = new Date()
    let gestion = fechaActual.getFullYear();
    let index=fechaActual.getMonth()-1;
    if(fechaActual.getMonth()===0){
      gestion = fechaActual.getFullYear()-1;
      index=11;
    }
    const month = new Date(gestion,index).toLocaleString('default', { month: 'long' }).toUpperCase();
    
    this.logger.debug(month);
    const qr = this.mesSeguimientoRegistroLecturaRepository.createQueryBuilder('mes');
    const mes = await qr
    .innerJoin('mes.anioSeguimiento','anio','anio.anio = :year',{year:gestion})
    .where('mes.mes = :mes',{mes:month})
    .getOne();
    if(mes){
      this.logger.warn(`MES ${month} del año ${gestion} ya registrado`);
    }else{
      const year = await this.anioSeguimientoLecturaRepository.findOneBy({anio:gestion});
      const mesSeg = this.mesSeguimientoRegistroLecturaRepository.create({mes:
       index===0?Mes.enero
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
      :Mes.enero,
    anioSeguimiento:year,
  fechaRegistroLecturas:new Date(fechaActual.getFullYear(),fechaActual.getMonth(),1,8,0),
  fechaFinRegistroLecturas:new Date(fechaActual.getFullYear(),fechaActual.getMonth(),20,23,59,59)},
      )
      try {
        await this.mesSeguimientoRegistroLecturaRepository.save(mesSeg)
        this.logger.log(`Mes ${month} de seguimiento creado con exito`)
      } catch (error) {
        this.logger.warn('OCURRIO UN ERROR AL REGISTRAR');
        this.logger.warn(error);
      }
    }
  }
}
