import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from '../common/common.service';

import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { Usuario } from './modules/usuarios/entities';
import { UsuariosService } from './modules/usuarios/usuarios.service';
@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly commonService: CommonService,
    private readonly usuarioService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async loginUser(login: LoginUserDto) {
    const { password, userName } = login;

    const usuario = await this.usuarioRepository.findOne({
      where: { userName },
      select: {
        userName: true,
        password: true,
        id: true,
      },
      relations: {
        roleToUsuario: { role: true },
      },
    });

    if (!usuario) throw new UnauthorizedException(`Credentials are not valid`);
    if (!bcrypt.compareSync(password, usuario.password))
      throw new UnauthorizedException(`Credentials are not valid`);
    try {
      //TODO: RESPUESTA DE ACUERDO A LO NECESITADO
      const { password, afiliado, estado, roleToUsuario, ...data } = usuario;
      // console.log(usuario);
      return {
        OK: true,
        message:'Logueado con exito',
        usuario: {
          ...data,
          roles: roleToUsuario.map((toUsuario) => {
            const { nombre, id } = toUsuario.role;
            return { nombre, id };
          }),
        },
        token: this.getJwtToken({ id: usuario.id, userName: usuario.userName }),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async tokenRefresh(user: Usuario) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { id: user.id },
        relations: { roleToUsuario: { role: true } },
      });
      if (!usuario) throw new BadRequestException(`Usuario incorrecto`);
      const { roleToUsuario, afiliado, perfil, password, estado, ...data } =
        usuario;
      return {
        OK: true,
        message:'token refrescado',
        usuario: {
          ...data,
          roles: roleToUsuario.map((toUsuario) => {
            const { nombre, id } = toUsuario.role;
            return { nombre, id };
          }),
        },
        token: this.getJwtToken({ id: usuario.id, userName: usuario.userName }),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error en el servidor');
    }
  }
  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
  async accessResource(usuario: Usuario) {
    console.log(usuario);
    const queryBuilder = this.usuarioRepository.createQueryBuilder('user');
    const query = await queryBuilder
      .select('user.id', 'id')
      .addSelect('user.userName')
      .addSelect('user.id')
      .innerJoinAndSelect('user.roleToUsuario', 'to_usuario', 'to_usuario."usuarioId" = user.id',)
      .innerJoinAndSelect('to_usuario.role',    'roles',      'roles.id = to_usuario."roleId"')
      .innerJoinAndSelect('roles.menuToRole',   'to_role',    'to_role."roleId" = roles.id')
      .innerJoinAndSelect('to_role.menu',       'menus',      'menus.id = to_role."menuId"')
      .innerJoinAndSelect('menus.itemMenu',     'to_menu',    'menus.id = to_menu.menuId',)
      .innerJoinAndSelect('to_menu.itemMenu',   'items',      'items.id = to_menu.itemMenuId',)
      .where('user.id= :idUsuario', { idUsuario: usuario.id })
      .getOne();
        return {
          data:query
        }
  }
}
