import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';

import { generateUsername } from 'unique-username-generator';
import * as bcrypt from 'bcrypt';
import * as pdgerantor from 'generate-password';
import { RoleToUsuario } from './roles-to-usuario/entities/role-to-usuario.entity';
import { CommonService } from '../../../common/common.service';
import { Afiliado, Perfil, Usuario } from './entities';
import {
  CreateAfiliadoDto,
  CreatePerfilDto,
  UpdateAfiliadoDto,
  UpdatePerfilDto,
  UpdateUsuarioDto,
} from './dto';
import { Role } from 'src/manager/roles/roles/entities/role.entity';
import { SearchPerfil } from './querys/search-perfil';
import { Ubicacion } from 'src/common/inherints-db';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RoleToUsuario)
    private readonly roleToUsuarioRepository: Repository<RoleToUsuario>,
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
    @InjectRepository(Afiliado)
    private readonly afiliadoRepository: Repository<Afiliado>,

    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async create(createPerfilDto: CreatePerfilDto) {
    const { usuarioForm, afiliadoForm, ...dataPerfil } = createPerfilDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const perfil = this.perfilRepository.create({ ...dataPerfil });
    // console.log(usuarioForm);
    // console.log(afiliadoForm);
    let messagePassword=null;
    let passwordImplict=null;
    if (usuarioForm) {
      const { roles, ...dataUsuario } = usuarioForm;
    //CREATE USUARIO
    const username = generateUsername();
    const password = pdgerantor.generate({
      numbers: true,
    });
    const usuario = this.usuarioRepository.create({
      password: bcrypt.hashSync(password, 10),
      username,
      ...dataUsuario,
    });
    // const rolesThem: RoleToUsuario[] = [];
    perfil.usuario=usuario;
    perfil.accessAcount = true;
    passwordImplict=password;
    messagePassword='No muestre la contraseña a cualquier individuo si no es el usuario'
    await queryRunner.manager.save(usuario);
    const qb = this.dataSource.getRepository(Role).createQueryBuilder('roles');
    roles.forEach(async (id) => {
    const role = await qb.where('roles.id = :id', { id }).getOne();
    if (!role)
    throw new BadRequestException(
      `El role con id: ${id} no fue encontrado`,
      );
      const roleToUsuario = this.roleToUsuarioRepository.create({
        role,
        usuario,
      });
      await queryRunner.manager.save(roleToUsuario);
      // rolesThem.push(roleToUsuario);
    });
    // console.log(password);
      // await queryRunner.manager.save(perfil.usuario);
    }
    if (afiliadoForm) {
      //CREATE AFILIADO
      const { barrio, latitud, longitud, nroVivienda, ...dataAFiliado } =
        afiliadoForm;
      const ubicacion: Ubicacion = {
        barrio,
        latitud,
        longitud,
        numeroVivienda: nroVivienda,
      };
      const afiliado = this.afiliadoRepository.create({
        ...dataAFiliado,
        ubicacion,
      });
      // console.log(afiliado);
      perfil.afiliado = afiliado;
      await queryRunner.manager.save(afiliado);
    }

    //TODO: MEJORAR LA CREACION DE USERNAME RANDOM
    //TODO: MEJORAR ASIGNAR ROLES A USUARIO
    try {
      await queryRunner.manager.save(perfil);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        message: 'perfil creado',
        data: {perfil,
          dataUser:{
            therePassword: perfil.usuario?true:false,
            messagePassword,
            passwordImplict,
          }
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
  async createAfiliado(idPerfil: number, createAfiliadoDto: CreateAfiliadoDto) {
    const perfil = await this.perfilRepository.findOne({
      where: { id: idPerfil },
      relations: { afiliado: true },
    });
    if (!perfil)
      throw new BadRequestException(`Perfil width id: ${idPerfil} not found`);

    if (perfil.afiliado)
      throw new BadRequestException(
        `El perfil con id: ${idPerfil} ya tiene asignado un afiliado!`,
      );
    const { estado, ...dataUbicacion } = createAfiliadoDto;
    const afiliado = this.afiliadoRepository.create({
      ubicacion: { ...dataUbicacion },
      estado,
      perfil,
    });
    perfil.afiliado = afiliado;
    try {
      await this.afiliadoRepository.save(afiliado);

      return {
        OK: true,
        message: 'Afiliado creado!',
        data: perfil,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async createUsuario(idPerfil: number, createUsuarioDto: CreateUsuarioDto) {
    const perfil = await this.perfilRepository.findOne({
      where: { id: idPerfil },
      relations: { usuario: true },
    });
    if (!perfil)
      throw new BadRequestException(`Perfil width id: ${idPerfil} not found`);

    if (perfil.usuario)
      throw new BadRequestException(
        `Perfil width id: ${idPerfil} ya tienen un usuario asignado!`,
      );

    const { password, usuario } = await this.createUsuarioPriv(
      createUsuarioDto,
    );
    usuario.perfil = perfil;
    perfil.accessAcount = true;
    // console.log(password);
    // console.log(usuario);
    const perfilPreload=await this.perfilRepository.preload({id:perfil.id,accessAcount:true});
    try {
      await this.usuarioRepository.save(usuario);
      await this.perfilRepository.save(perfilPreload);
      return {
        OK: true,
        message: 'Usuario de perfil creado!',
        data: perfil,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
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
        message: 'Roles asignados',
        data: await this.findOnePlaneUsuario(usuario.id),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
  async findAll(paginationDto: SearchPerfil) {
    const {
      offset = 0,
      limit = 10,
      order = 'ASC',
      q = '',
      tipoPerfil,
      accessAccount = true,
      barrio,
      genero,
    } = paginationDto;
    // const qb = this.usuarioRepository.createQueryBuilder('user');

    const { '0': data, '1': size } = await this.perfilRepository.findAndCount({
      where: [
        { nombrePrimero: Like(`%${q}%`) },
        { nombreSegundo: Like(`%${q}%`) },
        { apellidoPrimero: Like(`%${q}%`) },
        { apellidoSegundo: Like(`%${q}%`) },
        { CI: Like(`%${q}%`) },
        { usuario: [{ username: Like(`%${q}%`) }] },
        {
          // tipoPerfil: tipoPerfil ? tipoPerfil : TipoPerfil.afiliado,
          accessAcount: accessAccount,
        },
      ],
      relations: {
        afiliado: true,
        usuario: true,
      },
      take: limit,
      skip: offset,
      order: { id: order },
    });
    return {
      OK: true,
      message: 'lista de perfiles',
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
    const qb = await this.perfilRepository.findOne({
      where: { id },
      relations: { afiliado: true, usuario: true },
    });
    if (!qb) throw new NotFoundException(`Perfil no encontrado!`);
    return {
      OK: true,
      message: 'perfil',
      data: qb,
    };
  }

  async findOneUserComplete(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });
    if (!usuario)
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    return {
      OK: true,
      message: 'usuario encontrado',
      data: usuario,
    };
  }
  async findOnePlaneUsuario(id: number) {
    const { roleToUsuario, ...data } = await this.usuarioRepository.findOne({
      where: { id },
      relations: {
        roleToUsuario: { role: true },
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

    if (!query) throw new BadRequestException(`El usuario no tiene ese rol`);
    const { roleToUsuario, ...userData } = query;
    return {
      OK: true,
      message: 'rol encontrado',
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
  async findMenuByRole(menus: string[], idRole: number, usuario: Usuario) {
    const queryBuilder = this.usuarioRepository.createQueryBuilder('user');
    const { roleToUsuario, username } = await queryBuilder
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
      .where('user.id= :idUsuario', { idUsuario: usuario.id })
      .getOne();

    const roles = roleToUsuario.map((toUsuario) => toUsuario.role);
    const menusExist = roles.map((rol) =>
      rol.menuToRole.map((toRole) => toRole.menu),
    );
    for (const menu of menusExist) {
      for (const item of menu) if (menus.includes(item.nombre)) return item;
    }
    // console.log(menusExist);
    return null;
  }
  async findItemMenuByRole(items: string[], idRole: number, usuario: Usuario) {
    const queryBuilder = this.usuarioRepository.createQueryBuilder('user');
    const { roleToUsuario } = await queryBuilder
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
    const resultMap = roleToUsuario.map((toUsuario) =>
      toUsuario.role.menuToRole.map((toRole) =>
        toRole.menu.itemMenu.map((toMenu) => toMenu.itemMenu),
      ),
    );
    for (const res of resultMap) {
      for (const res2 of res) {
        for (const item of res2) {
          if (items.includes(item.linkMenu)) return item;
        }
      }
    }
    return null;
  }
  //TODO: UPDATE USUARIO DEBE SER PARA EL PERFIL DE USUARIO
  async updateProfile(id: number, updatePerfilDto: UpdatePerfilDto) {
    const { estado, usuarioForm, afiliadoForm, ...dataPerfilUpdate } =
      updatePerfilDto;
    const perfilUpdate = await this.perfilRepository.preload({
      id,
      ...dataPerfilUpdate,
    });

    if (!perfilUpdate)
      throw new NotFoundException(`Perfil con id ${id} no encontrado`);

    try {
      await this.perfilRepository.save(perfilUpdate);
      return {
        OK: true,
        message: 'Perfil actualizado',
        perfilUpdate,
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
        message: 'Roles de usuario actualizado',
        data: await this.findOnePlaneUsuario(id),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
  async updateAfiliado(idPerfil: number, updateAfiliadoDto: UpdateAfiliadoDto) {
    const perfil = await this.perfilRepository.findOne({
      where: { id: idPerfil },
      relations: { afiliado: true },
    });
    if (!perfil)
      throw new BadRequestException(`Perfil width id: ${idPerfil} not found`);
    if (!perfil.afiliado)
      throw new BadRequestException(`El perfil no tiene asignado un afiliado`);
    const { estado, barrio, latitud, longitud, nroVivienda, ...dataAfiliado } =
      updateAfiliadoDto;
    const afiliado = await this.afiliadoRepository.preload({
      id: perfil.afiliado.id,
      ubicacion: { barrio, latitud, longitud, numeroVivienda: nroVivienda },
    });
    try {
      await this.afiliadoRepository.save(afiliado);
      return {
        OK: true,
        message: 'Datos de afiliado actualizado',
        data: perfil,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async updateUsuario(idPerfil: number, updateUsuarioDto: UpdateUsuarioDto) {
    const perfil = await this.perfilRepository.findOne({
      where: { id: idPerfil },
      relations: { usuario: true },
    });
    if (!perfil)
      throw new BadRequestException(`Perfil width id: ${idPerfil} not found`);
    if (!perfil.usuario)
      throw new BadRequestException(`El perfil no tiene asignado un usuario`);
    const { estado, roles, ...dataUsuario } = updateUsuarioDto;
    const usuario = await this.usuarioRepository.preload({
      id: perfil.usuario.id,
      ...dataUsuario,
    });
    if (dataUsuario.correo) usuario.correoVerify = false;
    try {
      await this.usuarioRepository.save(usuario);

      return {
        OK: true,
        message: 'Datos de usuario actualizado',
        data: perfil,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async updateStatus(id: number, updatePerfilDto: UpdatePerfilDto) {
    const { estado } = updatePerfilDto;
    const perfil = await this.perfilRepository.preload({ id, estado });
    if (!perfil)
      throw new NotFoundException(`perfil con id ${id} no encontrado`);

    try {
      await this.usuarioRepository.save(perfil);
      return {
        OK: true,
        message: `estado de perfil actualizado'}`,
        data: perfil,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async updateUsuarioStatus(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const perfil = await this.perfilRepository.findOne({where:{id},relations:{usuario:true}});
    if (!perfil)
    throw new NotFoundException(`perfil con id ${id} no encontrado`);
    if(!perfil.usuario) throw new BadRequestException(`El perfil ${id} no tiene asignado un usuario`);
    
    const { estado } = updateUsuarioDto;
    const usuarioPreload = await this.usuarioRepository.preload({id:perfil.usuario.id,estado});
    try {
      await this.usuarioRepository.save(usuarioPreload);
      return {
        OK: true,
        message: `estado de usuario actualizado'}`,
        data: perfil,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async updateAfiliadoStatus(id: number, updateAfiliadoDto: UpdateAfiliadoDto) {
    const perfil = await this.perfilRepository.findOne({where:{id},relations:{afiliado:true}});
    if (!perfil)
    throw new NotFoundException(`perfil con id ${id} no encontrado`);
    if(!perfil.usuario) throw new BadRequestException(`El perfil ${id} no tiene asignado una afiliacion`);
    
    const { estado } = updateAfiliadoDto;
    const perfilPreload = await this.usuarioRepository.preload({id:perfil.afiliado.id,estado});
    try {
      await this.afiliadoRepository.save(perfilPreload);
      return {
        OK: true,
        message: `estado de afiliado actualizado'}`,
        data: perfil,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async findUserByEmail(term: string) {
    const perfil = await this.usuarioRepository.findOne({
      where: {
        correo: term,
      },
    });
    return {
      OK: true,
      message: 'Perfil con email',
      data: perfil,
    };
  }
  private async createUsuarioPriv(usuarioForm: CreateUsuarioDto) {
    const { roles, ...dataUsuario } = usuarioForm;
    //CREATE USUARIO
    const username = generateUsername();
    const password = pdgerantor.generate({
      numbers: true,
    });
    const usuario = this.usuarioRepository.create({
      password: bcrypt.hashSync(password, 10),
      username,
      ...dataUsuario,
    });
    try {
      await this.usuarioRepository.save(usuario);
      //ASIGNACION DE ROLES A UN USUARIO
      usuario.roleToUsuario = await this.asignarRolesPriv(roles, usuario);
      // console.log(usuario);
      return { usuario, password };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  private async asignarRolesPriv(roles: number[], usuario: Usuario) {
    const rolesThem: RoleToUsuario[] = [];
    const qb = this.dataSource.getRepository(Role).createQueryBuilder('roles');
    roles.forEach(async (id) => {
      const role = await qb.where('roles.id = :id', { id }).getOne();
      if (!role)
        throw new BadRequestException(
          `El role con id: ${id} no fue encontrado`,
        );
      const roleToUsuario = this.roleToUsuarioRepository.create({
        role,
        usuario,
      });
      await this.roleToUsuarioRepository.save(roleToUsuario);
      rolesThem.push(roleToUsuario);
    });
    console.log('array a insertar: ', rolesThem);
    try {
      console.log('insertados: ', roles);
      return rolesThem;
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
}
