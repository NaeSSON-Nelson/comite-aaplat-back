import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

import {
  uniqueUsernameGenerator,
  generateUsername,
} from 'unique-username-generator';
import * as bcrypt from 'bcrypt';
import * as pdgerantor from 'generate-password';
import { UpdatePerfilUsuarioDto } from './dto/update-perfil-usuario.dto';
import { PerfilUsuario, Usuario } from './entities';
import { RoleToUsuario } from './roles-to-usuario/entities/role-to-usuario.entity';
import { AfiliadosService } from '../afiliados/afiliados.service';
import { CommonService } from '../../../common/common.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RoleToUsuario)
    private readonly roleToUsuarioRepository: Repository<RoleToUsuario>,
    @InjectRepository(PerfilUsuario)
    private readonly perfilUsuarioRepository: Repository<PerfilUsuario>,
    private readonly dataSource: DataSource,
    private readonly afiliadoService: AfiliadosService,
    private readonly commonService: CommonService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { afiliado, roles } = createUsuarioDto;
    const { data: dataAfiliado } = await this.afiliadoService.findOne(
      afiliado.id,
    );
    if (!dataAfiliado)
      throw new NotFoundException(
        `Afiliado con id ${afiliado.id} no encontrado`,
      );
    if (!roles)
      throw new BadRequestException(
        `Debe existir al menos 1 role en la request`,
      );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const password = pdgerantor.generate({
      numbers: true,
    });

    //TODO: MEJORAR LA CREACION DE USERNAME RANDOM
    const characters = [
      'IronMan',
      'DoctorStrange',
      'Hulk',
      'CaptainAmerica',
      'Thanos',
    ];
    const { nombrePrimero, nombreSegundo, apellidoPrimero, apellidoSegundo } =
      dataAfiliado;
    const perfil = this.perfilUsuarioRepository.create({
      nombreUsuario: nombrePrimero
        .concat(' ')
        .concat(nombreSegundo ? nombreSegundo + ' ' : '')
        .concat(apellidoPrimero + ' ')
        .concat(apellidoSegundo ? apellidoSegundo : ''),
    });
    await queryRunner.manager.save(perfil);
    const userName = generateUsername();
    const usuario = this.usuarioRepository.create({
      password: bcrypt.hashSync(password, 10),
      userName,
      afiliado,
      perfil,
    });
    await queryRunner.manager.save(usuario);
    const rolesThem = roles.map((id) =>
      this.roleToUsuarioRepository.create({
        usuarioId: usuario.id,
        roleId: id,
      }),
    );
    //TODO: MEJORAR ASIGNAR ROLES A USUARIO
    try {
      await queryRunner.manager.save(rolesThem);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        msg: 'usuario creado',
        data: {
          usuario,
          realPassword: password,
          msg: 'Por favor no comparta su informacion de acceso con otras personas',
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
  //TODO: ASIGNAR ROLES A USUARIO
  async asignarRoles(id: number, updateUsuariodto: UpdateUsuarioDto) {
    const { roles } = updateUsuariodto;
    const usuario = await this.usuarioRepository.findOneBy({ id });

    if (!usuario)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    if (!roles) throw new BadRequestException(`No hay ningun role`);

    if (roles.length === 0) throw new BadRequestException(`No hay ningun role`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(RoleToUsuario, {
        usuario: { id: usuario.id },
      });

      const rolesThem = roles.map((id) =>
        this.roleToUsuarioRepository.create({
          roleId: id,
          usuarioId: usuario.id,
        }),
      );

      await queryRunner.manager.save(rolesThem);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        msg: 'Roles asignados',
        data: await this.findOnePlaneUsuario(usuario.id),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
  async findAll(paginationDto: PaginationDto) {
    const { offset = 0, limit = 10, order = 'ASC', q = '' } = paginationDto;
    // const qb = this.usuarioRepository.createQueryBuilder('user');

    const { '0': data, '1': size } = await this.usuarioRepository.findAndCount({
      where: [
        { userName: Like(`%${q}%`) },
        {
          afiliado: [
            { nombrePrimero: Like(`%${q}%`) },
            { nombreSegundo: Like(`%${q}%`) },
            { apellidoPrimero: Like(`%${q}%`) },
            { apellidoSegundo: Like(`%${q}%`) },
            { barrio: Like(`%${q}%`) },
            // {barrio:Barrio.MendezFortaleza},
            { CI: Like(`%${q}%`) },
          ],
        },
      ],
      relations: {
        afiliado: true,
      },
      take: limit,
      skip: offset,
      order: { id: order },
    });
    // const { '0': data, '1': size } = await qb
    //   .innerJoinAndSelect(
    //     'user.afiliado',
    //     'afiliado',
    //     `afiliado.nombrePrimero like :q
    //                          OR afiliado.nombreSegundo like :q
    //                          OR afiliado.apellidoPrimero like :q
    //                          OR afiliado.apellidoSegundo like :q
    //                          OR afiliado.CI like :q`,
    //     { q: `%${q}%` },
    //   )
    //   // .orWhere('user.userName like :q',{q:`%${q}%`})
    //   .offset(offset)
    //   .limit(limit)
    //   .orderBy('user.id', order)
    //   .getManyAndCount();
    return {
      OK: true,
      msg: 'lista de usuarios',
      data: {
        data,
        size,
        offset,
        limit,
        order,
      },
    };
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario)
      throw new NotFoundException(`Usuario width id: ${id} not found`);
    return {
      OK: true,
      msg: 'usuario encontrado',
      data: await this.findOnePlaneUsuario(id),
    };
  }

  async findOneUserComplete(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: { afiliado: true, perfil: true },
    });
    if (!usuario)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return {
      OK: true,
      msg: 'usuario encontrado',
      data: usuario,
    };
  }
  async findOnePlaneUsuario(id: number) {
    const { roleToUsuario, ...data } = await this.usuarioRepository.findOne({
      where: { id },
      relations: {
        roleToUsuario: { role: true },
        perfil: true,
        afiliado: true,
      },
    });
    const roles = roleToUsuario.map((item) => item.role);
    return {
      ...data,
      roles,
    };
  }
  async findOneUserRolesMenus(idRole: number, usuario: Usuario) {
    const queryBuilder = this.usuarioRepository.createQueryBuilder('user');
    const query = await queryBuilder
      .select('user.id', 'id')
      .addSelect('user.userName')
      .addSelect('user.id')
      .innerJoinAndSelect(
        'user.roleToUsuario',
        'to_usuario',
        'to_usuario."usuarioId" = user.id',
      )
      .innerJoinAndSelect('to_usuario.role', 'roles', 'roles.id = :roleId', {
        roleId: idRole,
      })
      .innerJoinAndSelect('roles.menuToRole', 'to_role', 'roles.id = :roleId')
      .innerJoinAndSelect('to_role.menu', 'menus', 'menus.id = to_role.menuId')
      .innerJoinAndSelect(
        'menus.itemMenu',
        'to_menu',
        'menus.id = to_menu.menuId',
      )
      .innerJoinAndSelect(
        'to_menu.itemMenu',
        'items',
        'items.id = to_menu.itemMenuId',
      )
      .where('user.id= :idUsuario', { idUsuario: usuario.id })
      .getOne();

    if (!query)
      throw new BadRequestException({
        OK: false,
        msg: `El usuario no tiene ese rol`,
      });
    const { roleToUsuario, ...userData } = query;
    return {
      OK: true,
      msg: 'rol encontrado',
      data: {
        ...userData,
        role: roleToUsuario.map((toUsuario) => {
          const { menuToRole, roleToUsuario, estado, ...dataRole } =
            toUsuario.role;
          return {
            ...dataRole,
            menus: menuToRole.map((toRole) => {
              const { itemMenu, ...dataMenu } = toRole.menu;
              return {
                ...dataMenu,
                itemsMenu: itemMenu.map((toMenu) => {
                  const { itemToMenu, ...dataItemMenu } = toMenu.itemMenu;
                  return { ...dataItemMenu };
                }),
              };
            }),
          };
        }),
      },
    };
  }
  //TODO: UPDATE USUARIO DEBE SER PARA EL PERFIL DE USUARIO
  async updateProfile(
    id: number,
    updatePerfilUsuarioDto: UpdatePerfilUsuarioDto,
  ) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: { perfil: true },
    });
    if (!usuario)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);

    const perfil = await this.perfilUsuarioRepository.preload({
      id: usuario.perfil.id,
      ...updatePerfilUsuarioDto,
    });
    try {
      await this.perfilUsuarioRepository.save(perfil);
      return {
        OK: true,
        msg: 'Perfil actualizado',
        perfil,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async updateRolesUser(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const { roles } = updateUsuarioDto;
    const usuario = await this.usuarioRepository.preload({ id });
    if (roles.length === 0)
      throw new BadRequestException(`No contiene ningun rol para asignar`);
    if (!usuario) throw new NotFoundException(`Rol con id ${id} no encontrado`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await queryRunner.manager.delete(RoleToUsuario, {
      usuario: { id: usuario.id },
    });

    const thems = roles.map((id) =>
      this.roleToUsuarioRepository.create({
        roleId: id,
        usuarioId: usuario.id,
      }),
    );
    try {
      await queryRunner.manager.save(thems);
      await queryRunner.manager.save(usuario);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        msg: 'Roles de usuario actualizado',
        data: await this.findOnePlaneUsuario(id),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const { estado } = updateUsuarioDto;
    const usuario = await this.usuarioRepository.preload({ id, estado });
    if (!usuario)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);

    try {
      await this.usuarioRepository.save(usuario);
      return {
        OK: true,
        msg: `Usuario ${usuario.estado ? 'habilitado' : 'inhabilitado'}`,
        data: await this.findOnePlaneUsuario(usuario.id),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async findUserByEmail(term: string) {
    const perfil = await this.perfilUsuarioRepository.findOne({
      where: {
        correo: term,
      },
    });
    return {
      OK: true,
      msg: 'Perfil con email',
      data: perfil,
    };
  }
  async findUserByPostalCode(term: string) {
    const perfil = await this.perfilUsuarioRepository.findOne({
      where: {
        codigoPostal: term,
      },
    });
    return {
      OK: true,
      msg: 'Perfil con codigo postal',
      data: perfil,
    };
  }
}
