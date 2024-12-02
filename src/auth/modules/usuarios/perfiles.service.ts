import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository, QueryRunner, ILike, Any, FindOptionsWhere, FindOptionsOrder, FindOptionsSelect, FindManyOptions, FindOptionsRelations } from 'typeorm';

import { generateUsername } from 'unique-username-generator';
import * as bcrypt from 'bcrypt';
import * as pdgerantor from 'generate-password';
import {v4 as uuid} from 'uuid'
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
import { Estado, MetodoPago, TipoPerfil } from 'src/interfaces/enum/enum-entityes';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { ComprobantePorPago } from 'src/pagos-de-servicio/entities';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { PlanillaMesLectura } from 'src/medidores-agua/entities/planilla-mes-lectura.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MedidorAsociado } from 'src/asociaciones/entities/medidor-asociado.entity';
import { QueryExportPerfil } from './querys/query-export-perfil';
import { RegistrarPagoAfiliacionDepositoDto, RegistrarPagoAfiliacionPresencialDto } from './dto/registrar-pago-afiliacion.dto';
import { UpdatePagoAfiliacionDto } from './dto/update-pago-afiliacion.dto';
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

    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async create(createPerfilDto: CreatePerfilDto) {
    const { usuarioForm, afiliadoForm, ...dataPerfil } = createPerfilDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const tipoPerfil: TipoPerfil[]=[];
    let accessAcount:boolean=false
        ,isAfiliado:boolean=false
        ,isActivePerfil:boolean=dataPerfil.estado === Estado.ACTIVO?true:false;
    if(usuarioForm) {
      tipoPerfil.push(TipoPerfil.usuario);
      accessAcount = true;
    }
    if(afiliadoForm) {
      tipoPerfil.push(TipoPerfil.afiliado);
      isAfiliado=true;   
    }
    const perfilForm = this.perfilRepository.create({ ...dataPerfil,tipoPerfil,accessAcount,isAfiliado,isActive:isActivePerfil });
    const perfilSaved=await queryRunner.manager.save(perfilForm);
    let messagePassword = null;
    let passwordImplict = null;
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
        perfil:perfilSaved,
        ...dataUsuario,
      });
      const usuarioSaved=await queryRunner.manager.save(usuario);
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
          usuario:usuarioSaved,
        });
         await queryRunner.manager.save(roleToUsuario);
      });
      // perfilForm.usuario = usuario;
      perfilSaved.usuario=usuarioSaved;
      passwordImplict = password;
      // tipoPerfil.push(TipoPerfil.usuario);
      messagePassword =
        'No muestre la contraseña a cualquier individuo si no es el usuario';
      console.log('usuario form',usuarioForm);
    }
    if (afiliadoForm) {
      //CREATE AFILIADO
      const { barrio, latitud, longitud, numeroVivienda,manzano,nroLote,numeroManzano, ...dataAFiliado } =
        afiliadoForm;
      const ubicacion: Ubicacion = {
        barrio,
        latitud,
        longitud,
        numeroVivienda,
        manzano,
        nroLote,
        numeroManzano,
      };
      const afiliado = this.afiliadoRepository.create({
        ...dataAFiliado,
        ubicacion,
        perfil:perfilSaved,
        isActive:dataAFiliado.estado===Estado.ACTIVO?true:false,
      });
      const afiliadoSaved = await queryRunner.manager.save(afiliado);
      // tipoPerfil.push(TipoPerfil.afiliado);
      perfilSaved.afiliado = afiliadoSaved;
      
      console.log('afiliado form',afiliadoForm);
    }

    //TODO: MEJORAR LA CREACION DE USERNAME RANDOM
    //TODO: MEJORAR ASIGNAR ROLES A USUARIO
    try {
      
      await queryRunner.manager.save(perfilSaved);
      // perfilForm.tipoPerfil=tipoPerfil;
      await queryRunner.commitTransaction();
      return {
        OK: true,
        message: 'perfil creado',
        data: {
          perfil:perfilForm,
          dataUser: {
            therePassword: perfilSaved.usuario ? true : false,
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
    const { estado,moneda,monto, ...dataUbicacion } = createAfiliadoDto;
    const afiliado = this.afiliadoRepository.create({
      ubicacion: { ...dataUbicacion },
      estado,
      moneda,monto,
      perfil,
    });
    perfil.afiliado = afiliado;
    try {
      await this.perfilRepository.update(idPerfil,{isAfiliado:true})
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
  async uploadUserImage(file:Express.Multer.File,id:number){

    const perfil = await this.perfilRepository.findOneBy({id});
    if(!perfil) throw new NotFoundException(`Perfil ${id} not found`);

    const filename = uuid()+file.originalname.replace(' ','_');
    file.originalname=filename;
    // console.log(file);
    const res=await this.cloudinaryService.uploadFile(file)
    // console.log(res);
    if(perfil.defaultClientImage){
      await this.perfilRepository.update({id:perfil.id},{urlImage:res.url,profileImageUri:res.display_name,defaultClientImage:false,})
      
    }else{
      const result = await this.cloudinaryService.deleteFile(perfil.profileImageUri)
      // console.log('resultado de borrado',result);
      await this.perfilRepository.update({id:perfil.id},{urlImage:res.url,profileImageUri:res.display_name})

    }
    
    // console.log(perfil);
    return {
      OK:true,
      message:'profile Image Updated!',
    }
  }
  async findAll(paginationDto: SearchPerfil) {
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
    // const qb = this.usuarioRepository.createQueryBuilder('user');
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
    
    let orderOption:FindOptionsOrder<Perfil>={id:order};
    if((sort!== null || sort !==undefined) && sort !=='id'){
      if(sort==='nombres') orderOption={nombrePrimero:order};
      if(sort ==='apellidos') orderOption={apellidoPrimero:order}
      else if (sort ==='ci') orderOption={CI:order};
      else if (sort ==='estado') orderOption={estado:order};
    }
    
    const { '0': data, '1': size } = await this.perfilRepository.findAndCount({
      where: finders,
      select:{
        apellidoPrimero:true,
        apellidoSegundo:true,
        CI:true,
        estado:true,
        id:true,
        isActive:true,
        contacto:true,
        fechaNacimiento:true,
        direccion:true,
        genero:true,
        profesion:true,
        nombrePrimero:true,
        nombreSegundo:true,
        tipoPerfil:true,
      },
      take: limit,
      skip: offset,
      order: orderOption,
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
      select:{
        id:true,estado:true,accessAcount:true,apellidoPrimero:true,isAfiliado:true,apellidoSegundo:true,CI:true,contacto:true,direccion:true,fechaNacimiento:true,genero:true,nombrePrimero:true,nombreSegundo:true,profesion:true,tipoPerfil:true,defaultClientImage:true,profileImageUri:true,urlImage:true,isActive:true,
        afiliado:{id:true,estado:true,entidad:true,fechaPago:true,metodoPago:true,moneda:true,monedaRecibido:true,montoRecibido:true,monto:true,nroCuenta:true,nroRecibo:true,remitente:true,
          isActive:true,pagado:true,ubicacion:{barrio:true,latitud:true,longitud:true,numeroVivienda:true,manzano:true,nroLote:true,numeroManzano:true}},
        usuario:{id:true,estado:true,correo:true,username:true,correoVerify:true,roleToUsuario:{id:true,estado:true,role:{id:true,estado:true,nombre:true,nivel:true}},isActive:true,}
      },
      relations: { afiliado: true, usuario: {roleToUsuario:{role:true}} },
    });

    if (!qb) throw new NotFoundException(`Perfil no encontrado!`);
    let perfil:any;
    const { usuario,...dataPerfil} = qb;
    perfil=dataPerfil;
    if(usuario){
      const {roleToUsuario,...dataUser}= usuario;
      perfil.usuario ={
        roles:roleToUsuario.map(toUsuario=>toUsuario.role.nombre),
        ...dataUser
      }
    }
    return {
      OK: true,
      message: 'perfil encontrado',
      data:perfil,
    };
  }

  async findOnePlaneUsuario(id: number) {
    const { roleToUsuario, ...data } = await this.usuarioRepository.findOne({
      where: { id },
      select:{
        id:true,isActive:true,estado:true,correo:true,correoVerify:true,username:true,
        roleToUsuario:{id:true,isActive:true,estado:true,role:{
          id:true,estado:true,isActive:true,nivel:true,nombre:true,
        }}
      },
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
      select:{
        id:true,isActive:true,estado:true,
        nombrePrimero:true,nombreSegundo:true,accessAcount:true,apellidoPrimero:true,apellidoSegundo:true,
        afiliado:{
          id:true,isActive:true,estado:true,ubicacion:{barrio:true,latitud:true,longitud:true,manzano:true,nroLote:true,numeroManzano:true,numeroVivienda:true},
        }
      },
      relations: { afiliado: true },
    });
    if (!perfil) throw new NotFoundException(`No hay perfil con ID${idPerfil}`);
    // if(!perfil.afiliado) throw new BadRequestException(`El perfil no tiene afiliación`);
    return {
      OK: true,
      message: 'perfil encontrado',
      data: perfil,
    };
  }
  async findOnePerfilUsuario(idPerfil: number) {
    const perfil = await this.perfilRepository.findOne({
      where: { id: idPerfil },
      relations: { usuario: { roleToUsuario: { role: true } } },
    });
    if (!perfil) throw new NotFoundException(`No hay perfil con ID${idPerfil}`);
    if (perfil.usuario){
      console.log('usuario',perfil.usuario);
    const { usuario, ...dataPerfil } = perfil;
      const { roleToUsuario, ...dataUsuario } = usuario;
      console.log(roleToUsuario);
      return {
        OK: true,
        message: 'perfil con usuario',
        data: {
          ...dataPerfil,
          usuario: {
            ...dataUsuario,
            roles: roleToUsuario.map((toUsuario) => {
              // console.log(toUsuario);
              // const {id,nivel,nombre,} = toUsuario.role;
              return toUsuario.role;
            }),
          },
        },
      }
    }else{
      return{
        OK:true,
        message:'perfil sin usuario',
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
      // .innerJoinAndSelect(
      //   'to_menu.itemMenu',
      //   'items',
      //   'items.id = to_menu.itemMenuId',
      // )
      .where('user.id= :idUsuario', { idUsuario: usuario.id })
      .getOne();
    
    return null;
  }
  //TODO: UPDATE USUARIO DEBE SER PARA EL PERFIL DE USUARIO
  async updatePerfil(id: number, updatePerfilDto: UpdatePerfilDto) {
    const { estado, usuarioForm, afiliadoForm, ...dataPerfilUpdate } =
      updatePerfilDto;
    const perfilUpdate = await this.perfilRepository.preload({
      id,
      // estado,
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
      // estado,
      barrio,
      latitud,
      longitud,
      numeroVivienda,
      manzano,
      nroLote,
      numeroManzano,
     //en otro modulo
      //en otro modulo
      ...dataNoActualizadaForm
    } = updateAfiliadoDto;
    const afiliado = await this.afiliadoRepository.preload({
        id: perfil.afiliado.id,
        ubicacion: { barrio, latitud, longitud, numeroVivienda,manzano,nroLote,numeroManzano, },
        // estado,
        
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
   async updatePagarAfiliado(perfilId:number,updatePagarAfiliado:UpdatePagoAfiliacionDto){
    const perfil = await this.perfilRepository.findOne({
      where:{id:perfilId},
      relations:{afiliado:true}
    });
    if(!perfil) throw new NotFoundException(`Perfil ${perfilId} not found`);
    if(!perfil.afiliado) throw new BadRequestException(`Perfil ${perfilId} no tiene afiliacion`);
    if(perfil.afiliado.pagado) throw new BadRequestException(`No se pue de modificar el monto de pago una vez pagado`);
    const {moneda,monto}=updatePagarAfiliado;
    const afi = await this.afiliadoRepository.preload({id:perfil.afiliado.id,moneda,monto});
    try {
      await this.afiliadoRepository.save(afi);
      return {
        OK:true,
        message:'Pago de afiliacion actualiza con exito!',
      }
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
      // estado,
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
      isActive: estado === Estado.ACTIVO ? true : false,
    });
    if (!perfil)
      throw new NotFoundException(`perfil con id ${id} no encontrado`);

    try {
      await this.perfilRepository.save(perfil);
      return {
        OK: true,
        message: `estado de perfil actualizado'}`,
        data: await this.findInterPerfilAfiliadoUsuario(id),
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
      isActive: estado === Estado.ACTIVO ? true : false,
    });
    try {
      await this.usuarioRepository.save(usuarioPreload);
      return {
        OK: true,
        message: `estado de usuario actualizado`,
        data: await this.findInterPerfilAfiliadoUsuario(id),
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
      isActive: estado === Estado.ACTIVO ? true : false,
    });
    try {
      await this.perfilRepository.update(id,{isAfiliado:estado === Estado.DESHABILITADO ? false : true})
      await this.afiliadoRepository.save(perfilPreload);
      return {
        OK: true,
        message: `estado de afiliado actualizado`,
        data: await this.findInterPerfilAfiliadoUsuario(id),
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

  
  
 
  async lecturasPlanilla(id:number){
    const planilla = await this.dataSource.getRepository(PlanillaLecturas).findOne({
    where:{
      id,
      isActive:true,
    },
    select:{id:true,isActive:true,gestion:true,lecturas:{
      consumoTotal:true,lectura:true,PlanillaMesLecturar:true,id:true,pagar:{monto:true,moneda:true,pagado:true,}
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
    const lectura = await this.dataSource.getRepository(PlanillaMesLectura).findOne({
      where:{
        id,isActive:true,
      },
      select:{consumoTotal:true,created_at:true,estadoMedidor:true,id:true,isActive:true,lectura:true,PlanillaMesLecturar:true,
        pagar:{created_at:true,estado:true,estadoComprobate:true,fechaPagada:true,id:true,moneda:true,motivo:true,monto:true,pagado:true,
          comprobante:{
            created_at:true,entidadPago:true,fechaEmitida:true,id:true,metodoPago:true,montoPagado:true,nroRecibo:true,
          }}},
      relations:{
        pagar:{
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

  private async findInterPerfilAfiliadoUsuario(perfilId:number){
    const data = await this.perfilRepository.findOne({
      where:{id:perfilId},
      select:{
        id:true,estado:true,accessAcount:true,apellidoPrimero:true,isAfiliado:true,apellidoSegundo:true,CI:true,contacto:true,direccion:true,fechaNacimiento:true,genero:true,nombrePrimero:true,nombreSegundo:true,profesion:true,tipoPerfil:true,defaultClientImage:true,profileImageUri:true,urlImage:true,isActive:true,
        afiliado:{id:true,estado:true,entidad:true,fechaPago:true,metodoPago:true,moneda:true,monedaRecibido:true,montoRecibido:true,monto:true,nroCuenta:true,nroRecibo:true,remitente:true,
          isActive:true,pagado:true,ubicacion:{barrio:true,latitud:true,longitud:true,numeroVivienda:true,manzano:true,nroLote:true,numeroManzano:true}},
        usuario:{id:true,estado:true,correo:true,username:true,correoVerify:true,roleToUsuario:{id:true,estado:true,role:{id:true,estado:true,nombre:true,nivel:true}},isActive:true,}
      },
      relations:{afiliado:true,usuario:true},
    })
    return data;
  }
  async exportPerfiles(query:QueryExportPerfil){
    const {
      order='ASC',sort='id',id,nombrePrimero,nombreSegundo,apellidoPrimero,apellidoSegundo,
      CI,fechaNacimiento,contacto,direccion,isActive,isAfiliado,tipoPerfil,afiliado
    } = query;
    nombrePrimero
    
    let data:Perfil[]=[];
    const dataManyOptions:FindManyOptions<Perfil>={
      order:{
        [sort]:order
      }
    }
    const dataSelectOptions:FindOptionsSelect<Perfil>={
      //selects
      id:(id =='true'? true : false),
      nombrePrimero:(nombrePrimero =='true'? true : false),
      nombreSegundo:(nombreSegundo =='true'? true : false),
      apellidoPrimero:(apellidoPrimero =='true'? true : false),
      apellidoSegundo:(apellidoSegundo =='true'? true : false),
      CI:(CI =='true'? true : false),
      fechaNacimiento:(fechaNacimiento =='true'? true : false),
      contacto:(contacto =='true'? true : false),
      direccion:(direccion =='true'? true : false),
      tipoPerfil:(tipoPerfil =='true'? true : false),
      isActive:true,
    }
    const dataRelations:FindOptionsRelations<Perfil>={}
    
      const whereDataFinder:FindOptionsWhere<Perfil>={}
      if(isActive !== undefined && isActive !== null){
        whereDataFinder.isActive=(isActive === 'true'? true : false);
      }
      if(isAfiliado  !== undefined && isActive !== null){
        //add where afiliado
        whereDataFinder.isAfiliado=(isAfiliado === 'true'? true : false);
        if(whereDataFinder.isAfiliado){
          const afiliadoFnd:FindOptionsSelect<Afiliado>={}
          if(afiliado){
            afiliadoFnd.id=true;
            afiliadoFnd.isActive=true;
            dataRelations.afiliado=true; //afiliado relation
          }
          //add select afiliado
          dataSelectOptions.afiliado=afiliadoFnd,
          dataSelectOptions.isAfiliado=true;
        }
      }
      dataManyOptions.where=whereDataFinder;
    
    dataManyOptions.select =dataSelectOptions;
    dataManyOptions.relations=dataRelations;
    data = await this.perfilRepository.find(dataManyOptions)
    return {
      OK:true,
      message:'perfiles exportados',
      data
    }
  }

  async registrarPagoAfiliacionPresencial(registrarPago:RegistrarPagoAfiliacionPresencialDto){
    const {perfilId,...dataRegistrarPagoAfiliacion} =registrarPago;
    if(dataRegistrarPagoAfiliacion.metodoPago !== MetodoPago.presencial) throw new BadRequestException(`El tipo de pago debe ser Presencial`);
    const perfil = await this.perfilRepository.findOne({
      where:{
        id:perfilId
      },
      relations:{afiliado:true}
    });
    if(!perfil) throw new NotFoundException(`Perfil con Id ${perfilId} not found`);
    else if(!perfil.isActive) throw new BadRequestException(`El Perfil ${perfilId} no se encuentra disponible`);
    else if(!perfil.afiliado) throw new BadRequestException(`El perfil Id ${perfilId} no disponible con afiliacion creada`);
    else if(!perfil.afiliado.isActive) throw new BadRequestException(`La Afiliacion con el perfil ${perfil} not esta disponible`);
    else if(perfil.afiliado.pagado) throw new BadRequestException(`La Afiliacion del perfil ${perfilId} ya tiene pagado el coste de afiliacion`);
    else if(dataRegistrarPagoAfiliacion.montoRecibido !==perfil.afiliado.monto) throw new BadRequestException(`El monto por pagar y el monto recibido no coinciden`);
    else if(dataRegistrarPagoAfiliacion.monedaRecibido !==perfil.afiliado.moneda) throw new BadRequestException(`La moneda de pago recibido no coinciden con la moneda de afiliacion de pago`)
    const afi = await this.afiliadoRepository.preload({id:perfil.afiliado.id,
      metodoPago:dataRegistrarPagoAfiliacion.metodoPago,
      montoRecibido:dataRegistrarPagoAfiliacion.montoRecibido,
      monedaRecibido:dataRegistrarPagoAfiliacion.monedaRecibido,
      fechaPago:new Date(),
      pagado:true,
    });
    try {
      await this.afiliadoRepository.save(afi);
      return {
        OK:true,
        message:`Monto de pago de afiliacion del perfil ${perfilId} realiza con exito!`,
        data: await this.perfilRepository.findOne({
          where:{id:perfilId},
          select:{
            nombrePrimero:true,nombreSegundo:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,id:true,isActive:true,estado:true,
            afiliado:{
              id:true,isActive:true,estado:true,fechaPago:true,montoRecibido:true,monedaRecibido:true,pagado:true,metodoPago:true,
            }
          },
          relations:{
            afiliado:true
          }
        })
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async registrarPagoAfiliacionDeposito(registrarPago:RegistrarPagoAfiliacionDepositoDto){
    const {perfilId,...dataRegistrarPagoAfiliacion} =registrarPago;
    if(dataRegistrarPagoAfiliacion.metodoPago !== MetodoPago.deposito) throw new BadRequestException(`El tipo de pago debe ser Presencial`);
    const perfil = await this.perfilRepository.findOne({
      where:{
        id:perfilId
      },
      relations:{afiliado:true}
    });
    if(!perfil) throw new NotFoundException(`Perfil con Id ${perfilId} not found`);
    else if(!perfil.isActive) throw new BadRequestException(`El Perfil ${perfilId} no se encuentra disponible`);
    else if(!perfil.afiliado) throw new BadRequestException(`El perfil Id ${perfilId} no disponible con afiliacion creada`);
    else if(!perfil.afiliado.isActive) throw new BadRequestException(`La Afiliacion con el perfil ${perfil} not esta disponible`);
    else if(perfil.afiliado.pagado) throw new BadRequestException(`La Afiliacion del perfil ${perfilId} ya tiene pagado el coste de afiliacion`);
    else if(dataRegistrarPagoAfiliacion.montoRecibido !==perfil.afiliado.monto) throw new BadRequestException(`El monto por pagar y el monto recibido no coinciden`);
    else if(dataRegistrarPagoAfiliacion.monedaRecibido !==perfil.afiliado.moneda) throw new BadRequestException(`La moneda de pago recibido no coinciden con la moneda de afiliacion de pago`)
    
    const afi = await this.afiliadoRepository.preload({id:perfil.afiliado.id,
      // metodoPago:dataRegistrarPagoAfiliacion.metodoPago,
      // montoRecibido:dataRegistrarPagoAfiliacion.montoRecibido,
      // monedaRecibido:dataRegistrarPagoAfiliacion.monedaRecibido,
      // entidad:dataRegistrarPagoAfiliacion.entidad,
      // nroRecibo:dataRegistrarPagoAfiliacion.nroRecibo,
      // remitente:dataRegistrarPagoAfiliacion.remitente,
      ...dataRegistrarPagoAfiliacion,
      pagado:true,
      fechaPago:new Date(),
    });
    try {
      await this.afiliadoRepository.save(afi);
      return {
        OK:true,
        message:`Registro de deposito de pago de afiliacion del perfil ${perfilId} realiza con exito!`,
        // data: await this.perfilRepository.findOne({
        //   where:{id:perfilId},
        //   select:{
        //     nombrePrimero:true,nombreSegundo:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,id:true,isActive:true,estado:true,
        //     afiliado:{
        //       id:true,isActive:true,estado:true,fechaPago:true,montoRecibido:true,monedaRecibido:true,pagado:true,metodoPago:true,
        //     }
        //   },
        //   relations:{
        //     afiliado:true
        //   }
        // })
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async findPagoAfiliacion(perfilId:number){
    const afiliado = await this.afiliadoRepository.findOne({
      where:{
        perfil:{id:perfilId},
      },
      select:{
        id:true,fechaPago:true,metodoPago:true,pagado:true,entidad:true,monto:true,moneda:true,monedaRecibido:true,montoRecibido:true,nroRecibo:true,remitente:true,
      }
    });
    if(!afiliado) throw new NotFoundException(`Perfil not found or perfil no tiene afiliacion`);
    return {
      OK:true,
      message:'pago de afiliacion',
      data:afiliado
    }
  }
}
