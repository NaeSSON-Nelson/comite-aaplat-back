import {PassportStrategy} from '@nestjs/passport'
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Usuario } from '../modules/usuarios/entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){

    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository:Repository<Usuario>,
        private readonly configService:ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_TOKEN_KEY'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }
    async validate(payload:JwtPayload):Promise<Usuario>{
       
        const {sub,username} =payload; 

        // const usuario = await this.usuarioRepository.findOne({where:{username},relations:{roleToUsuario:{role:{menuToRole:{menu:{itemMenu:true}}}}}});
        const usuario = await this.usuarioRepository.createQueryBuilder('usuario')
    
                            .select([
                                'usuario.id',
                                'usuario.username',
                                'usuario.isActive',
                                'usuario.estado',
                                'perfil.id',
                                'perfil.nombrePrimero',
                                'perfil.nombreSegundo',
                                'perfil.apellidoPrimero',
                                'perfil.apellidoSegundo',
                                'to_usuario.id',
                                'to_usuario.roleId',
                                'to_usuario.usuarioId',
                                'to_usuario.estado',
                                'to_usuario.isActive',
                                'roles.id',
                                'roles.nombre',
                                'roles.nivel',
                                'roles.estado',
                                'roles.isActive',
                                'to_role.id',
                                'to_role.menuId',
                                'to_role.roleId',
                                'to_role.isActive',
                                'to_role.estado',
                                'menus.id',
                                'menus.nombre',
                                'menus.linkMenu',
                                'menus.prioridad',
                                'menus.isActive',
                                'menus.estado',
                                'items.id',
                                'items.nombre',
                                'items.visible',
                                'items.linkMenu',
                                'items.isActive',
                                'items.estado',
                            ])
                            .innerJoin('usuario.perfil','perfil','perfil.id = usuario.perfilId')
                            .leftJoin('usuario.roleToUsuario', 'to_usuario', 'to_usuario."usuarioId" = usuario.id',)
                            .leftJoin('to_usuario.role',    'roles',      'roles.id = to_usuario."roleId"')
                            .leftJoin('roles.menuToRole',   'to_role',    'to_role."roleId" = roles.id')
                            .leftJoin('to_role.menu',       'menus',      'menus.id = to_role."menuId"')
                            .leftJoin('menus.itemMenu',     'items',    'menus.id = items."menuId"',)
                            // .leftJoinAndSelect('to_menu.itemMenu',   'items',      'items.id = to_menu.itemMenuId AND items.visible = true',)
                            .where('usuario.username = :username', { username })
                            // .orderBy('roles.nivel','DESC')
                            .orderBy({
                                ['roles.nivel']:'DESC',
                                ['menus.prioridad']:'DESC',
                            })
                            // .addOrderBy('roles.nivel','DESC')
                            // .addOrderBy('menu.prioridad','DESC')
                            .getOne();
        console.log('usuario en strategy',usuario);
        if(!usuario) throw new UnauthorizedException(`Token not valid`);
        //TODO: MEJORAR LOS ESTADOS DEL USUARIO
        if(!usuario.isActive) throw new UnauthorizedException(`El usuario actualmente se encuentra bloqueado`);
        return usuario;
    }
}