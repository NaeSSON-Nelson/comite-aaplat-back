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
import { CreateLecturaMedidorDto } from './dto/create-lectura-medidor.dto';
import { LecturaMedidor } from './entities/lectura-medidor.entity';
import { RegistrarLecturasDto } from './dto/registrar-lecturas.dto';
import { Afiliado } from '../auth/modules/afiliados/entities/afiliado.entity';
import { AfiliadosService } from '../auth/modules/afiliados/afiliados.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class MedidoresService {
  constructor(
    @InjectRepository(Medidor)
    private readonly medidorRepository: Repository<Medidor>,
    @InjectRepository(Afiliado)
    private readonly AfiliadoRepository: Repository<Afiliado>,
    @InjectRepository(LecturaMedidor)
    private readonly lecturasRepository: Repository<LecturaMedidor>,
    private readonly commonService: CommonService,
    private readonly afiliadoService: AfiliadosService,
    private readonly dataSource: DataSource,
  ) {}
  async create(createMedidoreDto: CreateMedidorDto) {
    const medidor = this.medidorRepository.create(createMedidoreDto);
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
    if (!medidor)
      throw new NotFoundException('Medidor no encontrado');
    return {
      OK: true,
      message: 'medidor encontrado',
      data: medidor,
    };
  }

  async findAllMedidoresWithAfiliados(paginationDto: PaginationDto) {
    const { offset = 0, limit = 10, order = 'ASC', q = '' } = paginationDto;
    const {"0":data,"1":size} = await this.AfiliadoRepository.findAndCount({
      relations: { medidores: true },
      where: [
        { nombrePrimero: Like(`%${q}%`) },
        { nombreSegundo: Like(`%${q}%`) },
        { apellidoPrimero: Like(`%${q}%`) },
        { apellidoSegundo: Like(`%${q}%`) },
        { barrio: Like(`%${q}%`) },
        // {barrio:Barrio.MendezFortaleza},
        { CI: Like(`%${q}%`) },
        { medidores: [{ nroMedidor: Like(`%${q}%`) }] },
      ],
    });
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
  async findMedidoresWithAfiliadoByBarrio(paginationDto: PaginationDto) {
    let {
      q = '',
      order = 'ASC',
      offset = 0,
      limit = 50,
      barrio = 'mendez-fortaleza',
    } = paginationDto;

    if (barrio) barrio = barrio.replace('-', ' ');

    // const medidores = await this.medidorRepository.find({
    //   relations:{afiliado:true},
    //   where:{
    //     ubicacionBarrio:barrio
    //   },
    //   skip:offset,
    //   take:limit,
    //   order:{
    //     id:order
    //   }
    // });
    const queryBuilder =
      this.AfiliadoRepository.createQueryBuilder('afiliados');

    const query = await queryBuilder
      .innerJoinAndSelect(
        'afiliados.medidores',
        'medidor',
        'medidor.ubicacionBarrio = :barrio and medidor.estado = 1',
        { barrio },
      )
      .skip(offset)
      .limit(limit)
      .where('afiliados.estado = 1')
      .getMany();
    return {
      OK: true,
      message: 'listado de medidores por barrio',
      data: query,
    };
  }
  async findAllMedidorOneAfiliado(idAfiliado: number) {
    // const { data: afiliado } = await this.afiliadoService.findOne(idAfiliado);
    // const medidoresOfAfiliado = await this.medidorRepository.find({
    //   relations: { afiliado: true },
    //   where: { afiliado: { id: afiliado.id } },
    // });
    const afiliadoWithMedidores = await this.AfiliadoRepository.findOne({
      relations: { medidores: { lecturas: true } },
      where: { id: idAfiliado },
    });
    if (!afiliadoWithMedidores)
      throw new NotFoundException(`Afiliado with Id: ${idAfiliado} not found`);
    return {
      OK: true,
      message: 'lista de medidores de afiliado',
      data: afiliadoWithMedidores,
    };
  }
  private async findAfiliadoByMedidores(idMedidor:number){

    return await this.AfiliadoRepository.findOne({
      where:{
        medidores:[
          {id:idMedidor}
        ]
      },
      relations:{medidores:true},

    })
    
  }

  async findAllLecturas() {
    const lecturas = await this.lecturasRepository.find();

    return {
      OK: true,
      message: 'todas las lecturas',
      data: lecturas,
    };
  }

  async update(id: number, updateMedidoreDto: UpdateMedidorDto) {
    const { estado, afiliado, ...dataMedidor } = updateMedidoreDto;
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
        data: await this.findAfiliadoByMedidores(medidor.id),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async updateStatus(id: number, updateMedidoreDto: UpdateMedidorDto) {
    const { estado = 0 } = updateMedidoreDto;
    const medidor = await this.medidorRepository.preload({
      id,
      estado,
    });
    if (!medidor)
      throw new NotFoundException(`Medidor with id ${id} not found`);
    try {
      await this.medidorRepository.save(medidor);
      return {
        OK: true,
        message: `Medidor status: ${
          estado === 1
            ? 'habilitado'
            : estado === 0
            ? 'inhabilitado'
            : `estado:${estado}`
        }`,
        data: await this.findAfiliadoByMedidores(medidor.id),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  //TODO: LECTURAS DE MEDIDORES, INDIVIDUAL

  async registerLectura(createLecturaMedidorDto: CreateLecturaMedidorDto) {
    const { medidor, ...dataLectura } = createLecturaMedidorDto;
    const medidorActual = await this.medidorRepository.preload({
      id: medidor.id,
    });
    if (!medidorActual)
      throw new NotFoundException(`Medidor con id ${medidor.id} no encontrado`);

    if (dataLectura.lectura < medidorActual.ultimaLectura)
      throw new BadRequestException('La Lectura es inferior a la ultima lectura registrada ');
    // console.log((dataLectura.lectura - medidorActual.ultimaLectura));
    const newLectura = this.lecturasRepository.create({
      medidor,
      ...dataLectura,
      total: dataLectura.lectura - medidorActual.ultimaLectura,
    });
    try {
      medidorActual.ultimaLectura = dataLectura.lectura;
      await this.lecturasRepository.save(newLectura);
      await this.medidorRepository.save(medidorActual);
      return {
        OK: true,
        message: 'lectura registrada',
        data: newLectura,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async registrarLecturas(registrarLecturas: RegistrarLecturasDto) {
    const { lecturas: lecturasRegister } = registrarLecturas;
    if (lecturasRegister.length === 0)
      throw new BadRequestException('No hay registros de lecturas');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const lecturasNew: LecturaMedidor[] = [];

    for (const { lectura, medidor, ...dataMedidor } of lecturasRegister) {
      const medidorActual = await this.medidorRepository.preload({
        id: medidor.id,
      });
      if (!medidorActual)
        throw new NotFoundException(
          `El medidor con id ${medidor.id} no existe`,
        );
      if (lectura < medidorActual.ultimaLectura)
        throw new BadRequestException('La Lectura es inferior a la ultima lectura registrada');
      const newLectura = this.lecturasRepository.create({
        medidor,
        lectura,
        ...dataMedidor,
        total: lectura - medidorActual.ultimaLectura,
      });
      lecturasNew.push(newLectura);
      medidorActual.ultimaLectura = lectura;
      await queryRunner.manager.save(medidorActual);
    }

    try {
      await queryRunner.manager.save(lecturasNew);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        message: 'Lecturas registradas con exito',
        data: lecturasNew,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllLecturasWithMedidorId(idMedidor: number) {
    const medidor = await this.medidorRepository.findOne({
      where: { id: idMedidor },
      relations: { lecturas: true },
    });
    if (!medidor)
      throw new NotFoundException(
        `Medidor width id:${idMedidor} no encontrado`,
      );
    return {
      OK: true,
      message: 'listado de lecturas del medidor',
      data: medidor,
    };
  }


  async findMedidorByNro(nroMedidor:string){
    const data = await this.medidorRepository.findOneBy({nroMedidor});
    return{
      OK:true,
      message:'Medidor con nro',
      data
    }
  }
}
