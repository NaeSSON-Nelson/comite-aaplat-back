import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { Like, Repository } from 'typeorm';
import { Afiliado } from './entities/afiliado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { isNumberString } from 'class-validator';
import { Barrio } from 'src/interfaces/enum/Entities.enum';

@Injectable()
export class AfiliadosService {
  private readonly logger = new Logger('AfiliadosService');
  constructor(
    @InjectRepository(Afiliado)
    private readonly afiliadoRepository: Repository<Afiliado>,
  ) {}
  async create(createAfiliadoDto: CreateAfiliadoDto) {
    const afiliado = this.afiliadoRepository.create(createAfiliadoDto);
    try {
      await this.afiliadoRepository.save(afiliado);
      
      return {
        OK: true,
        msg: 'Afiliado creado con exito',
        data: afiliado,
      };
    } catch (error) {
      this.handleDBExepcetions(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {
    const {offset=0,limit=10,order='ASC',q=''} = paginationDto;
    
    const data = await this.afiliadoRepository.find(
      {
        where:[
          {nombrePrimero:Like(`%${q}%`),},
          {nombreSegundo:Like(`%${q}%`),},
          {apellidoPrimero:Like(`%${q}%`),},
          {apellidoSegundo:Like(`%${q}%`),},
          {profesion:Like(`%${q}%`)},
          // {barrio:Barrio.MendezFortaleza},
          {CI:Like(`%${q}%`)}
        ],

        skip:offset,
        take:limit,
        order:{
          id: order
        },
      }
    );
    return {
      OK: true,
      msg: 'Listado de afiliados',
      data,
    };
  }

  async findOne(id: number) {
    const afiliado = await this.afiliadoRepository.findOneBy({ id });
    if (!afiliado)
      throw new NotFoundException(`Afiliado with id: ${id} not found`);
    return {
      OK: true,
      msg: 'Afiliado encontrado',
      data: afiliado,
    };
  }
  async findAllAfiliadosUnAsignedUser(){
    const queryBuilder = this.afiliadoRepository.createQueryBuilder('afiliados');

    const query = await queryBuilder
                  .leftJoinAndSelect(
                    'afiliados.usuario',
                    'afiliado',
                    'afiliado."afiliadoId" = null'
                  )
                  .getMany();
    return {
      OK:true,
      msg:'lista de afiliados sin asignar usuario',
      data:query
    }

  }

  async update(id: number, updateAfiliadoDto: UpdateAfiliadoDto) {
    const { estado, ...dataUpdate } = updateAfiliadoDto;
    const afiliado = await this.afiliadoRepository.preload({
      id,
      ...dataUpdate,
    });
    if (!afiliado)
      throw new NotFoundException(`El afiliado con id ${id} no existe`);
    try {
      await this.afiliadoRepository.save(afiliado);
      return {
        OK: true,
        msg: 'Afiliado actualizado',
        data: afiliado,
      };
    } catch (error) {
      this.handleDBExepcetions(error);
    }
  }

  async updateStatus(id: number, updateAfiliadoDto: UpdateAfiliadoDto) {
    const { estado, ...dataUpdate } = updateAfiliadoDto;
    const afiliado = await this.afiliadoRepository.preload({ id, estado });
    if (!afiliado)
      throw new NotFoundException(`El afiliado con id ${id} no existe`);
    try {
      await this.afiliadoRepository.save(afiliado);
      return {
        OK: true,
        msg:
          afiliado.estado === 1
            ? 'Afiliado habilitado'
            : 'Afiliado deshabilitado',
        data: afiliado,
      };
    } catch (error) {
      this.handleDBExepcetions(error);
    }
  }

  private handleDBExepcetions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(`Check logs server errors`);
  }
}
