import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateMedidorDto } from './dto/create-medidor.dto';
import { UpdateMedidorDto } from './dto/update-medidor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { Medidor } from './entities/medidor.entity';
import { CommonService } from '../common/common.service';
import { Afiliado } from '../auth/modules/usuarios/entities/afiliado.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UsuariosService } from 'src/auth/modules/usuarios/usuarios.service';
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

@Injectable()
export class MedidoresService {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
    @InjectRepository(Medidor)
    private readonly medidorRepository: Repository<Medidor>,
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
    const { barrio,latitud,longitud,numeroVivienda, afiliado, ...medidorForm } = createMedidoreDto;
    const afiliadoDb = await this.dataSource
      .getRepository(Afiliado)
      .findOne({ where: { id: afiliado.id } });
    if (!afiliadoDb)
      throw new BadRequestException(
        `El afiliado con Id ${afiliado.id} no existe`,
      );
    const medidor = this.medidorRepository.create({
      ...medidorForm,
      ubicacion: { barrio,latitud,longitud,numeroVivienda },
      afiliado: afiliadoDb,
    });
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

  async findAll() {
    try {
      const medidores = await this.medidorRepository.find();
      return {
        OK: true,
        message: 'lista de medidores',
        data: medidores,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async findOne(id: number) {
    const medidor = await this.medidorRepository.findOne({
      where: { id },
      relations: { afiliado: true },
    });
    if (!medidor) throw new NotFoundException('Medidor no encontrado');
    return {
      OK: true,
      message: 'medidor encontrado',
      data: medidor,
    };
  }

  async findAllMedidoresWithAfiliados(paginationDto: PaginationDto) {
    const { offset = 0, limit = 10, order = 'ASC', q = '' } = paginationDto;
    const qb = this.perfilRepository.createQueryBuilder('perfil');
    const { '0': data, '1': size } = await qb
      .innerJoinAndSelect(
        'perfil.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfil.id',
      )
      .leftJoinAndSelect(
        'afiliado.medidores',
        'medidor',
        'medidor."afiliadoId" = afiliado.id',
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
  //TODO: BUSCAR AFILIADOS CON MEDIDORES POR BARRIO
  // async findMedidoresWithAfiliadoByBarrio(paginationDto: PaginationDto) {
  //   let {
  //     q = '',
  //     order = 'ASC',
  //     offset = 0,
  //     limit = 50,
  //     barrio = 'mendez-fortaleza',
  //   } = paginationDto;

  //   if (barrio) barrio = barrio.replace('-', ' ');

  //   // const medidores = await this.medidorRepository.find({
  //   //   relations:{afiliado:true},
  //   //   where:{
  //   //     ubicacionBarrio:barrio
  //   //   },
  //   //   skip:offset,
  //   //   take:limit,
  //   //   order:{
  //   //     id:order
  //   //   }
  //   // });
  //   const queryBuilder =
  //     this.AfiliadoRepository.createQueryBuilder('afiliados');

  //   const query = await queryBuilder
  //     .innerJoinAndSelect(
  //       'afiliados.medidores',
  //       'medidor',
  //       'medidor.ubicacionBarrio = :barrio and medidor.estado = 1',
  //       { barrio },
  //     )
  //     .skip(offset)
  //     .limit(limit)
  //     .where('afiliados.estado = 1')
  //     .getMany();
  //   return {
  //     OK: true,
  //     message: 'listado de medidores por barrio',
  //     data: query,
  //   };
  // }
  async findAllMedidorOneAfiliado(id: number) {
    // const { data: afiliado } = await this.afiliadoService.findOne(idAfiliado);
    // const medidoresOfAfiliado = await this.medidorRepository.find({
    //   relations: { afiliado: true },
    //   where: { afiliado: { id: afiliado.id } },
    // });
    const afiliadoWithMedidores = await this.perfilRepository.findOne({
      relations: { afiliado: { medidores: true } },
      select: {},
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
  private async findAfiliadoByMedidores(idMedidor: number) {
    return await this.perfilRepository.findOne({
      where: {
        afiliado: {
          medidores: [{ id: idMedidor }],
        },
      },
      relations: { afiliado: { medidores: true } },
    });
  }

  async update(id: number, updateMedidoreDto: UpdateMedidorDto) {
    const { estado, afiliado, barrio,latitud,longitud,numeroVivienda, ...dataMedidor } = updateMedidoreDto;
    const medidor = await this.medidorRepository.preload({
      id,
      ...dataMedidor,
      ubicacion: {
        barrio,
        latitud,
        longitud,
        numeroVivienda
      },
    });
    if (!medidor)
      throw new NotFoundException(`Medidor with id ${id} not found`);
    try {
      await this.medidorRepository.save(medidor);
      return {
        OK: true,
        message: 'Medidor actualizado',
        data: await this.findAfiliadoByMedidores(medidor.id),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async updateStatus(id: number, updateMedidoreDto: UpdateMedidorDto) {
    const { estado } = updateMedidoreDto;
    const medidor = await this.medidorRepository.preload({
      id,
      estado,
      isActive: estado === Estado.INACTIVO ? false : true,
    });
    if (!medidor)
      throw new NotFoundException(`Medidor with id ${id} not found`);
    if (estado === 'INACTIVO') medidor.isActive = false;
    else medidor.isActive = true;
    try {
      await this.medidorRepository.save(medidor);
      return {
        OK: true,
        message: `estado del medidor cambiado`,
        data: await this.findAfiliadoByMedidores(medidor.id),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
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

    const medidorDb = await this.medidorRepository.findOne({
      where: { id: medidor.id },
      relations: { planillas: true },
    });

    if (!medidorDb)
      throw new BadRequestException(
        `Medidor de agua width id: ${createPlanillaMedidorDto.medidor.id} not found`,
      );
    if (medidorDb.planillas.find((reg) => reg.gestion === gestion))
      throw new BadRequestException(
        `Ya existe la gestion ${gestion} registrada para el medidor de id ${medidor.id} con numero:${medidorDb.nroMedidor}`,
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
        message: 'Planilla de medidor regitrada',
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
      .innerJoinAndSelect('medidor.planillas', 'planillas')
      .getManyAndCount();
    return {
      OK: true,
      message: 'lista de planillas de medidores',
      data,
    };
  }

  async registrarAllLecturas(registerAllLecturas: registerAllLecturasDto) {
    // console.log(registerAllLecturas);
    const { registros, mes, anio } = registerAllLecturas;
    const anioExiste = await this.anioSeguimientoLecturaRepository.findOne({
      where: { anio },
      relations: { meses: true },
    });
    if (!anioExiste) throw new BadRequestException(`No es un año registrado`);
    const mesExiste = anioExiste.meses.find((mesT) => mesT.mes === mes);
    if (!mesExiste)
      throw new BadRequestException(
        `No es un un mes registrado del año ${anio}`,
      );
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
        throw new BadRequestException(
          `No existe la planilla con id ${lectura.planilla.id}`,
        );
      if (planillaDb.lecturas.find((reg) => reg.mesLecturado === mes))
        throw new BadRequestException(
          `Ya se ha registrado en el mes ${mes} de la planilla-gestion: ${planillaDb.gestion}`,
        );
      const { planilla, ...dataLectura } = lectura;
      const {medidor} = planillaDb;
      const consumoTotal=(lectura.lectura-medidor.ultimaLectura);
      const lecturaRegister = this.mesLecturasRepository.create({
        ...dataLectura,
        mesLecturado: mes,
        consumoTotal,
        planilla: planillaDb,
      });
      lecturas.push(lecturaRegister);
      medidor.ultimaLectura=(medidor.ultimaLectura+consumoTotal);
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
    const {
      gestion = new Date().getFullYear(),
      barrio = Barrio._20DeMarzo,
      mes = Mes.enero,
    } = query;
    // console.log(gestion, barrio, mes);
    const qb = this.perfilRepository.createQueryBuilder('perfiles');
    const { '0': data, '1': size } = await qb
      .innerJoinAndSelect(
        'perfiles.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfiles.id',
      )
      .innerJoinAndSelect(
        'afiliado.medidores',
        'medidor',
        'medidor."afiliadoId" = afiliado.id AND medidor."ubicacionBarrio" = :barrio',
        {barrio}
      )
      .innerJoinAndSelect(
        'medidor.planillas',
        'planilla',
        'planilla."medidorId" = medidor.id',
      )
      .leftJoinAndSelect(
        'planilla.lecturas',
        'lecturas',
        'lecturas.mesLecturado = :mes',
        { mes },
      )
      .where('planilla.gestion =:gestion', { gestion })
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
  async getPlanillasMedidor(idMedidor:number){
    // const medidor = await this.medidorRepository.findOne({where:{id:idMedidor,planillas:{isActive:true}},relations:{planillas:true},select:{nroMedidor:true,planillas:{gestion:true,id:true}}});
    const qb = this.medidorRepository.createQueryBuilder('medidor');
    const medidor = await qb
                          .select(['medidor.isActive','medidor.nroMedidor'])
                          .leftJoinAndSelect('medidor.planillas','planillas','planillas.medidorId = medidor.id')
                          .where('medidor.id = :idMedidor',{idMedidor})
                          // .select(['planillas.id','planillas.gestion'])
                          .getOne();
    //console.log(medidor);
    if(!medidor) throw new BadRequestException(`Medidor de agua width id ${idMedidor} not found`);
    if(!medidor.isActive) throw new BadRequestException(`El medidor no se encuentra disponible`);
    return {
      OK:true,
      message:'planillas encontrado',
      data:medidor,
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
        'afiliado.medidores',
        'medidor',
        'medidor."afiliadoId" = afiliado.id AND medidor."ubicacionBarrio" = :barrio',
        {barrio}
      )
      .innerJoinAndSelect(
        'medidor.planillas',
        'planilla',
        'planilla."medidorId" = medidor.id',
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

  //METHODS USER AFILIADO

  async listarMedidores(idUsuario:number){
    const qb =  await this.dataSource.getRepository(Medidor).find({where:{afiliado:{perfil:{usuario:{id:idUsuario}}}}});
    return {
      OK:true,
      message:'medidores',
      data:qb
    }
  }
}
