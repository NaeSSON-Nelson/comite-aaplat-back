import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository, QueryRunner } from 'typeorm';

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
import { MenuToRole } from 'src/manager/roles/menu-to-role/entities/menuToRole.entity';
import { Estado, TipoPerfil } from 'src/interfaces/enum/enum-entityes';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { ComprobantePorPago } from 'src/pagos-de-servicio/entities';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { MesLectura } from 'src/medidores-agua/entities/mes-lectura.entity';

@Injectable()
export class PerfilesService {
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
    let messagePassword = null;
    let passwordImplict = null;
    const tipoPerfil: TipoPerfil[]=[];
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
      await queryRunner.manager.save(usuario);
      const qb = this.dataSource
        .getRepository(Role)
        .createQueryBuilder('roles');
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
      });
      perfil.usuario = usuario;
      perfil.accessAcount = true;
      passwordImplict = password;
      tipoPerfil.push(TipoPerfil.usuario);
      messagePassword =
        'No muestre la contraseña a cualquier individuo si no es el usuario';
    }
    if (afiliadoForm) {
      //CREATE AFILIADO
      const { barrio, latitud, longitud, numeroVivienda, ...dataAFiliado } =
        afiliadoForm;
      const ubicacion: Ubicacion = {
        barrio,
        latitud,
        longitud,
        numeroVivienda,
      };
      const afiliado = this.afiliadoRepository.create({
        ...dataAFiliado,
        ubicacion,
      });
      await queryRunner.manager.save(afiliado);
      tipoPerfil.push(TipoPerfil.afiliado);
      perfil.afiliado = afiliado;
    }

    //TODO: MEJORAR LA CREACION DE USERNAME RANDOM
    //TODO: MEJORAR ASIGNAR ROLES A USUARIO
    try {
      perfil.tipoPerfil=tipoPerfil;
      await queryRunner.manager.save(perfil);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        message: 'perfil creado',
        data: {
          perfil,
          dataUser: {
            therePassword: perfil.usuario ? true : false,
            messagePassword,
            passwordImplict,
          },
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
    let messagePassword = null;
    let passwordImplict = null;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    //CREATE USUARIO
    const { roles, ...dataUsuario } = createUsuarioDto;
    const username = generateUsername();
    const password = pdgerantor.generate({
      numbers: true,
    });
    const usuario = this.usuarioRepository.create({
      password: bcrypt.hashSync(password, 10),
      username,
      ...dataUsuario,
      perfil,
    });
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
    });
    passwordImplict = password;
    messagePassword =
      'No muestre la contraseña a cualquier individuo si no es el usuario';
    const perfilPreload = await queryRunner.manager.preload(Perfil, {
      id: perfil.id,
      accessAcount: true,
    });
    try {
      await queryRunner.manager.save(perfilPreload);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        message: 'Usuario de perfil creado!',
        data: {
          perfil: { ...perfilPreload, usuario },
          dataUser: {
            therePassword: usuario ? true : false,
            messagePassword,
            passwordImplict,
          },
        },
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
      ],
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
  async findOnePerfilAfiliado(idPerfil: number) {
    const perfil = await this.perfilRepository.findOne({
      where: { id: idPerfil },
      relations: { afiliado: true },
    });
    if (!perfil)
      throw new BadRequestException(`No hay perfil con ID${idPerfil}`);
    return {
      OK: true,
      msg: 'perfil con afiliado',
      data: perfil,
    };
  }
  async findOnePerfilUsuario(idPerfil: number) {
    const perfil = await this.perfilRepository.findOne({
      where: { id: idPerfil },
      relations: { usuario: { roleToUsuario: { role: true } } },
    });
    if (!perfil)
      throw new BadRequestException(`No hay perfil con ID${idPerfil}`);
    const { usuario, ...dataPerfil } = perfil;
    if(usuario){
      const { roleToUsuario, ...dataUsuario } = usuario;
      return {
        OK: true,
        msg: 'perfil con usuario',
        data: {
          ...dataPerfil,
          usuario: {
            ...dataUsuario,
            roles: roleToUsuario.map((toUsuario) => {
              // console.log(toUsuario);
              return toUsuario.role;
            }),
          },
        },
        // data:perfil
      };
    }else{
      return {
        OK:true,
        msg:'perfil con usuario',
        data:perfil
      }
    }
  }
  async findMenuByRole(menus: string[], roles: Role[]) {
    const menuToRole = await this.dataSource.getRepository(MenuToRole).find({
      where: { roleId: In(roles.map((rol) => rol.id)) },
      relations: { menu: true },
    });

    const menusRole = menuToRole.map((toRole) => toRole.menu);

    for (const menu of menusRole) {
      if (menus.includes(menu.nombre)) return menu;
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
      estado,
      ...dataPerfilUpdate,
    });

    if (!perfilUpdate)
      throw new NotFoundException(`Perfil con id ${id} no encontrado`);

    try {
      await this.perfilRepository.save(perfilUpdate);
      return {
        OK: true,
        message: 'Perfil actualizado',
        data: perfilUpdate,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async updateRolesUser(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const { roles } = updateUsuarioDto;
    const usuario = await this.usuarioRepository.preload({ id });
    if (!usuario) throw new NotFoundException(`Rol con id ${id} no encontrado`);
    if (roles.length === 0)
      throw new BadRequestException(`No contiene ningun rol para asignar`);

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
    // console.log('hola perfil?');
    if (!perfil)
      throw new BadRequestException(`Perfil width id: ${idPerfil} not found`);
    if (!perfil.afiliado)
      throw new BadRequestException(`El perfil no tiene asignado un afiliado`);
    const {
      estado,
      barrio,
      latitud,
      longitud,
      numeroVivienda,
      ...dataAfiliado
    } = updateAfiliadoDto;
    const afiliado = await this.afiliadoRepository.preload({
      id: perfil.afiliado.id,
      ubicacion: { barrio, latitud, longitud, numeroVivienda },
      estado,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    const usuario = await queryRunner.manager.preload(Usuario,{
      id: perfil.usuario.id,
      estado,
      ...dataUsuario,
    });
    if (dataUsuario.correo) usuario.correoVerify = false;

    await queryRunner.manager.delete(RoleToUsuario, {
      usuario: { id: perfil.usuario.id },
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
        message: 'Datos de usuario actualizado',
        data: perfil,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, updatePerfilDto: UpdatePerfilDto) {
    const { estado } = updatePerfilDto;
    const perfil = await this.perfilRepository.preload({
      id,
      estado,
      isActive: estado === Estado.DESHABILITADO ? false : true,
    });
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
    const perfil = await this.perfilRepository.findOne({
      where: { id },
      relations: { usuario: true },
    });
    if (!perfil)
      throw new NotFoundException(`perfil con id ${id} no encontrado`);
    if (!perfil.usuario)
      throw new BadRequestException(
        `El perfil ${id} no tiene asignado un usuario`,
      );

    const { estado } = updateUsuarioDto;
    const usuarioPreload = await this.usuarioRepository.preload({
      id: perfil.usuario.id,
      estado,
      isActive: estado === Estado.DESHABILITADO ? false : true,
    });
    try {
      await this.usuarioRepository.save(usuarioPreload);
      return {
        OK: true,
        message: `estado de usuario actualizado'}`,
        data: await this.perfilRepository.findOne({
          where: { id },
          relations: { usuario: true, afiliado: true },
        }),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async updateAfiliadoStatus(id: number, updateAfiliadoDto: UpdateAfiliadoDto) {
    const perfil = await this.perfilRepository.findOne({
      where: { id },
      relations: { afiliado: true },
    });
    // console.log(perfil);
    if (!perfil)
      throw new NotFoundException(`perfil con id ${id} no encontrado`);
    if (!perfil.afiliado)
      throw new BadRequestException(
        `El perfil ${id} no tiene asignado una afiliacion`,
      );

    const { estado } = updateAfiliadoDto;
    const perfilPreload = await this.usuarioRepository.preload({
      id: perfil.afiliado.id,
      estado,
      isActive: estado === Estado.DESHABILITADO ? false : true,
    });
    try {
      await this.afiliadoRepository.save(perfilPreload);
      return {
        OK: true,
        message: `estado de afiliado actualizado'}`,
        data: await this.perfilRepository.findOne({
          where: { id },
          relations: { afiliado: true, usuario: true },
        }),
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


  //USER AFILIADO

  async medidoresAfiliadoInSelect(user:Usuario){
    // console.log(user);
    const perfil = await this.dataSource.getRepository(Perfil).findOne(
      {where:{ usuario:{id:user.id,isActive:true},isActive:true,afiliado:{isActive:true,medidores:{isActive:true}}},
      select:{usuario:{id:true,isActive:true},isActive:true,id:true,afiliado:{isActive:true,id:true,medidores:{id:true,nroMedidor:true,isActive:true,}}},
      relations:{usuario:true,afiliado:{medidores:true},}
    })
    return {
      OK:true,
      message:'medidores seleccionados',
      data:perfil.afiliado.medidores}
  }
  async medidorAfiliadoDetails(user:Usuario,nro:string){
    const medidor = await this.dataSource.getRepository(Medidor).findOne(
      {
        where:{
          afiliado:{
            perfil:{
              usuario:{id:user.id,isActive:true},
              isActive:true
            },
            isActive:true
          },
          nroMedidor:nro,
        },
        select:{
          estado:true,id:true,fechaInstalacion:true,isActive:true,lecturaInicial:true,marca:true,nroMedidor:true,ubicacion:{barrio:true,latitud:true,longitud:true,numeroVivienda:true},ultimaLectura:true,
          planillas:{id:true,gestion:true},
          afiliado:{id:true,isActive:true,
            perfil:{id:true,isActive:true,
              usuario:{id:true,isActive:true}}
            },
          },
        relations:{afiliado:{perfil:{usuario:true}},planillas:true}
      })
      if(!medidor) throw new BadRequestException(`No se encontro ningun medidor con el Nro. ${nro} relacionado al usuario`)
      const {afiliado,...resto} = medidor;
      return {
        OK:true,
        message:'Medidor relacionado encontrado',
        data:resto
      }
  }
  async profileUser(user:Usuario){
    const perfil = await this.perfilRepository.findOne({
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
  async obtenerComprobantesPorPagar(user:Usuario,nroMedidor:string){
    const perfil = await this.dataSource.getRepository(Perfil).findOne({
      where:{usuario:{id:user.id},afiliado:{medidores:{nroMedidor}}},
      select:{id:true,isActive:true,
        usuario:{id:true,isActive:true},
        afiliado:{id:true,isActive:true,
          medidores:{id:true,isActive:true,nroMedidor:true,
            planillas:{id:true,isActive:true,gestion:true,
              lecturas:{id:true,isActive:true,lectura:true,mesLecturado:true,consumoTotal:true,created_at:true,
                pagar:{id:true,created_at:true,pagado:true,moneda:true,monto:true,motivo:true,estado:true,estadoComprobate:true,
                  comprobantesAdd:{metodoRegistro:true,created_at:true,id:true,moneda:true,monto:true,motivo:true,pagado:true,estadoComprobate:true,}}}}}}},
      relations:{usuario:true,afiliado:{medidores:{planillas:{lecturas:{pagar:{comprobantesAdd:true}}}}}}
    })
    if(!perfil) throw new BadRequestException(`No se encontro datos de medidor con Numero: ${nroMedidor}`)
    const medidorRes = Object.assign({},perfil.afiliado.medidores[0]);
    medidorRes.planillas=Object.assign({},perfil.afiliado.medidores[0].planillas);
    medidorRes.planillas=[];
    for(const planilla of perfil.afiliado.medidores[0].planillas){
      for(const lectura of planilla.lecturas){
        if(lectura.pagar){
          if(!lectura.pagar.pagado){
            const planillita = medidorRes.planillas.find(pl=>pl.gestion===planilla.gestion);
            if(!planillita) {
              const {lecturas,...resPlanilla}=planilla;
              medidorRes.planillas.push({...resPlanilla,lecturas:[]})
            }
            if(lectura.pagar.comprobantesAdd){
              if(!lectura.pagar.comprobantesAdd.pagado){
                medidorRes.planillas.find(plan=>plan.gestion === planilla.gestion).lecturas.push(lectura)
              }
            }else{
              medidorRes.planillas.find(plan=>plan.gestion === planilla.gestion).lecturas.push(lectura)
            }
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
    },
    select:{id:true,isActive:true,gestion:true,lecturas:{
      consumoTotal:true,lectura:true,mesLecturado:true,id:true,pagar:{monto:true,moneda:true,pagado:true,}
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
    const lectura = await this.dataSource.getRepository(MesLectura).findOne({
      where:{
        id,isActive:true,
      },
      select:{consumoTotal:true,created_at:true,estadoMedidor:true,id:true,isActive:true,lectura:true,mesLecturado:true,
        pagar:{created_at:true,estado:true,estadoComprobate:true,fechaPagada:true,id:true,moneda:true,motivo:true,monto:true,pagado:true,
          comprobantesAdd:{created_at:true,estado:true,estadoComprobate:true,fechaPagada:true,id:true,moneda:true,motivo:true,monto:true,pagado:true,metodoRegistro:true,
            comprobante:{created_at:true,entidadPago:true,fechaEmitida:true,id:true,metodoPago:true,montoPagado:true,nroRecibo:true,}},
          comprobante:{
            created_at:true,entidadPago:true,fechaEmitida:true,id:true,metodoPago:true,montoPagado:true,nroRecibo:true,
          }}},
      relations:{
        pagar:{
          comprobantesAdd:{
            comprobante:true
          },
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
}
