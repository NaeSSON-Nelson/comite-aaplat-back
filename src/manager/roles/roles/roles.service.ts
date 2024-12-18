import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Like, Repository,In,LessThan } from 'typeorm';
import { isNumber, isNumberString } from 'class-validator';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuToRole } from '../menu-to-role/entities/menuToRole.entity';
import { CommonService } from 'src/common/common.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Usuario } from 'src/auth/modules/usuarios/entities';
import { Estado } from 'src/interfaces/enum/enum-entityes';
import { Menu } from 'src/manager/menus/menus/entities/menu.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(MenuToRole)
    private readonly menuToRoleRepository: Repository<MenuToRole>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { menus,estado, ...dataRole } = createRoleDto;
    const role = this.roleRepository.create(dataRole);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await this.roleRepository.save(role);
    if (menus && menus.length > 0) {
      const thems = menus.map((id) =>
        this.menuToRoleRepository.create({
          roleId: role.id,
          menuId: id,
        }),
      );
      await queryRunner.manager.save(thems);
    }
    try {
      await queryRunner.commitTransaction();
      return {
        OK: true,
        message: 'Role creado con exito',
        data: {
          role,
          menus,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto:PaginationDto,usuario:Usuario) {
    const nivel = usuario.roleToUsuario.map(rol=>rol.role.nivel);
    const maxNivel = Math.max(...nivel)
    const { offset = 0, limit = 5, order = 'ASC', q = '' } = paginationDto;
    const { '0': data, '1': size } = await this.roleRepository.findAndCount({
      where: [{ nombre: Like(`%${q}%`),nivel:LessThan(maxNivel) }],
      select:{id:true,estado:true,isActive:true,nombre:true,},
      skip: offset,
      take: limit,
      order: {
        id: order,
      },
    });
      return {
        OK: true,
        message: 'Roles',
        data: {
          data,
          size,
          offset,
          limit,
          order,
        },
      };

  }
  async findOneByName(term:string){
    const role = await this.roleRepository.findOne({
      where: { nombre:term },
      select:{nombre:true,id:true,isActive:true,estado:true}
    });
    return {
      OK: true,
      message: 'data con nombre',
      data: role,
    };
  }
  async findOne(id: number) { // rol con menus y sub items
    const roleExist = await this.roleRepository.exist({ where:{id} });
    if (!roleExist) throw new NotFoundException(`Role width id: ${id}`);

    return {
      OK: true,
      message: 'Role encontrado',
      data: await this.findOnePlaneRole(id),
    };
  }
  async findOneRoleWithMenus(id: number) {
    const roles= await this.roleRepository.findOne({
      where: { id },
      relations: { menuToRole: { menu: {itemMenu:true} } },
      // select:{nombre:true,menuToRole:true}
    });
    if(!roles) throw new NotFoundException('rol no encontrado')
     
      
    return {
      OK:true,
      message:'listado de menus',
      data:roles
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { menus, estado, ...dataRole } = updateRoleDto;

    const role = await this.roleRepository.preload({ id, ...dataRole });

    if (!role) throw new NotFoundException(`Rol con id ${id} no encontrado`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (menus && menus.length > 0) {
      // console.log(menus);
      await queryRunner.manager.delete(MenuToRole, { role: { id: role.id } });
      const thems = menus.map((id) =>
        this.menuToRoleRepository.create({
          roleId: role.id,
          menuId: id,
        }),
      );

      await queryRunner.manager.save(thems);
      // menu.itemMenu=thems;
    }

    try {
      await queryRunner.manager.save(role);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        message: 'Role actualizado',
        data: await this.findOnePlaneRole(id),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }

  async updateRoleStatus(id: number, updateRoleDto: UpdateRoleDto) {
    const { estado } = updateRoleDto;

    const role = await this.roleRepository.preload({ id, estado,isActive:estado===Estado.ACTIVO?true:false });
    if (!role) throw new NotFoundException(`Rol con id ${id} no encontrado`);
    try {
      await this.roleRepository.save(role);
      return {
        OK: true,
        message: 'estado del rol cambiado',
        data: await this.findOnePlaneRole(role.id),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async existeRole(id: number) {
    return await this.roleRepository.exist({ where: { id } });
  }

  async findOnePlaneRole(id: number) {
    const { roleToUsuario, menuToRole, ...data } =
      await this.roleRepository.findOne({
        where: { id },
        select:{
          id:true,isActive:true,estado:true,nombre:true,nivel:true,
          menuToRole:{id:true,isActive:true,estado:true,
            menu:{id:true,estado:true,isActive:true,linkMenu:true,nombre:true,
              itemMenu:{id:true,isActive:true,estado:true,linkMenu:true,nombre:true,visible:true}}
          }
        },
        relations: { menuToRole: { menu: {itemMenu:true}} },
      });
    return {
      ...data,
      menus: menuToRole.map((item) => item.menu),
    };
  }

  async getMenusForForm(){
  const menus = await this.dataSource.getRepository(Menu).find({
    relations:{
      itemMenu:true
    },
    select:{
      id:true,isActive:true,estado:true,nombre:true,
      itemMenu:{id:true,estado:true,isActive:true,nombre:true}
    }
  });
  return {
    OK:true,
    message:'Menus para asignacion a rol de acceso',
    data:menus
  }   
  }
}
