import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Afiliado } from 'src/afiliados/entities/afiliado.entity';
import { AfiliadosService } from 'src/afiliados/afiliados.service';

import {
  uniqueUsernameGenerator,
  generateUsername,
} from 'unique-username-generator';
import * as bcrypt from 'bcrypt';
import * as pdgerantor from 'generate-password';
import { CommonService } from '../../common/common.service';
import { UpdatePerfilUsuarioDto } from './dto/update-perfil-usuario.dto';
import { PerfilUsuario, Usuario } from './entities';
import { Role } from '../roles/roles/entities/role.entity';
import { RoleToUsuario } from './roles-to-usuario/entities/role-to-usuario.entity';
import { RolesService } from '../roles/roles/roles.service';
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
        data: usuario,
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
  async findAll() {
    const usuarios = (await this.usuarioRepository.find()).map(user=> {
      delete user.password;
      return user;
    });
    return {
      OK: true,
      msg: 'lista de usuarios',
      data: usuarios,
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
    const { password, ...usuario } = await this.usuarioRepository.findOne({
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
    const { roleToUsuario, password, ...data } =
      await this.usuarioRepository.findOne({
        where: { id },
        relations: { roleToUsuario: { role: true },perfil:true,afiliado:true },
      });
    const roles = roleToUsuario.map((item) => item.role);
    return {
      ...data,
      roles,
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
      return{
        OK:true,
        msg:'Perfil actualizado',
        perfil
      }
    } catch (error) {
      this.commonService.handbleDbErrors(error);
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
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  // findMenusWidthUsuarioByRoles(idRole:number){
  //   const queryBuilder = this.usuarioRepository.find();
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} usuario`;
  // }
  // private generateUserLength(id: number) {
  //   //TAMAÑO DE LA CUENTA DE USUARIO
  //   let length = 10000;

  //   return (length + id).toString();
  // }
}
