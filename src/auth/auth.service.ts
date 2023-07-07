import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt } from 'passport-jwt';
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
        ok: true,
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
  async tokenRefresh(token: string) {
    if (!token) throw new BadRequestException(` there's not token in request`);
    try {
      const { id, userName } = this.jwtService.verify<JwtPayload>(
        token,
        this.configService.get('JWT_TOKEN_KEY'),
      );
      const usuario = await this.usuarioRepository.findOne({
        where: { id },
        relations: { roleToUsuario: { role: true } },
      });
      if (!usuario) throw new BadRequestException(`Usuario incorrecto`);
      const { roleToUsuario, afiliado, perfil, password, estado, ...data } =
        usuario;
      return {
        ok: true,
        usuario: {
          ...data,
          roles: roleToUsuario.map((toUsuario) => {
            const { nombre, id } = toUsuario.role;
            return { nombre, id };
          }),
        },
        token: this.getJwtToken({ id, userName }),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        ok: false,
        msg: 'Error en el servidor',
      });
    }
  }
  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
