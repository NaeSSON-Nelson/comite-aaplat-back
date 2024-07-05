import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CommonService } from '../common/common.service';

import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { Usuario } from './modules/usuarios/entities';
import { PerfilesService } from './modules/usuarios/perfiles.service';
import { Role } from 'src/manager/roles/roles/entities/role.entity';
@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly commonService: CommonService,
    private readonly perfilesService: PerfilesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource:DataSource,
  ) {}
  async loginUser(login: LoginUserDto) {
    const { password, username } = login;

    const usuario = await this.usuarioRepository.findOne({
      where: { username },
      select: {
        username: true,
        password: true,
        isActive:true,
        id: true,
      }
      //   roleToUsuario:{
      //     id:true,
      //     isActive:true,
      //     role:{
      //       nombre:true,
      //       id:true,
      //       nivel:true
      //     }
      //   }
      // },
      // relations: {
      //   roleToUsuario: { role: true },
      // },
    });

    if (!usuario) throw new BadRequestException(`Credentials are not valid`);
    if (!bcrypt.compareSync(password, usuario.password))
      throw new BadRequestException(`Credentials are not valid`);
    if(!usuario.isActive) throw new ForbiddenException(`User blocked`);
    try {
      //TODO: RESPUESTA DE ACUERDO A LO NECESITADO
      const { password, perfil, estado, roleToUsuario,isActive,id, ...dataUser } = usuario;
      
      return {
        OK: true,
        message:'Logueado con exito',
        // usuario: {
        //   ...data,
        //   roles: roleToUsuario.map((toUsuario) => {
        //     const { nombre, id,nivel } = toUsuario.role;
        //     return { nombre, id,nivel };
        //   }),
        // },
        dataUser:{
          id,
          ...await this.getTokens(usuario.id,usuario.username)
        }
        // token: this.getJwtToken({ id: usuario.id, username: usuario.username }),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async validateUser(username: string, password: string) {
    const user = await this.usuarioRepository.findOne({where:{username},select:{username:true,password:true}});
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async tokenRefresh(user: Usuario) {
    try {
      const usuario = await this.usuarioRepository.findOne({
        where: { username:user.username },
        // relations: { roleToUsuario: { role: true } },
        select: {
          username: true,
          password: true,
          id: true,
        },
      });
      if (!usuario) throw new BadRequestException(`Usuario incorrecto`);
      const { roleToUsuario, perfil, password, estado,id,isActive, ...dataUser } =
        usuario;
      return {
        OK: true,
        message:'token refrescado',
        // usuario: {
        //   ...data,
        //   roles: roleToUsuario.map((toUsuario) => {
        //     const { nombre, id,nivel } = toUsuario.role;
        //     return { nombre, id,nivel };
        //   }),
        // },
         dataUser:{
          id,
          ...await this.getTokens(usuario.id,usuario.username)
        }
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error en el servidor');
    }
  }
  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
  async refreshTokens(userId: number) {
		const user = await this.usuarioRepository.findOneBy({id:userId});
		if (!user) throw new ForbiddenException('Access Denied');
    if(!user.isActive) throw new ForbiddenException('user blocked');
		return {...await this.getTokens(user.id, user.username)}
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
  async findOneUserRolesMenus(idRole:number,usuario: Usuario) {
    // const queryBuilder = this.usuarioRepository.createQueryBuilder('user');
    // const role = await this.usuarioRepository.exist({where:{roleToUsuario:{roleId:idRole},id:usuario.id}});
    console.log('OBTENIENDO MENUS');
    console.log(idRole,usuario);
    const roleRepository =  this.dataSource.getRepository(Role);
    const rol = await roleRepository.findOne({where:{id:idRole}});
    if(!rol) throw new BadRequestException(`No existe ese role`);
    const qb = roleRepository.createQueryBuilder('role');

    const query = await qb
                  .innerJoinAndSelect('role.menuToRole','toRole','toRole.roleId = :roleId',{roleId:idRole})
                  .innerJoinAndSelect('toRole.menu','menu','menu.id = toRole.menuId')
                  .innerJoinAndSelect('menu.itemMenu','toMenu','toMenu.menuId = menu.id')
                  .innerJoinAndSelect('toMenu.itemMenu','item','item.id = toMenu.itemMenuId')
                  .getOne();
    if (!query) throw new BadRequestException(`Rol no encontrado`);
    const { menuToRole, ...roleData } = query;

    return {
      OK: true,
      message: 'rol encontrado',
      data: {
        ...roleData,
        menus:menuToRole.map(toRole=>{
          const {itemMenu,menu,...dataMenu} = toRole.menu
          return{
            ...dataMenu,
            itemsMenu:itemMenu
            // .map(toMenu=> toMenu.itemMenu)
          }
        })
      },
      // data: queryC,
    };
  }
  async getTokens(userId:number,username: string) {
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(
        {
          sub: userId,
           username,
           
        },
        { expiresIn: '1h',secret: await this.configService.get('JWT_TOKEN_KEY') }
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        { expiresIn: '7d',secret: await this.configService.get('JWT_TOKEN_REFRESH_KEY') }
      )
		]);

		return {
			accessToken,
			refreshToken
		};
	}
}
