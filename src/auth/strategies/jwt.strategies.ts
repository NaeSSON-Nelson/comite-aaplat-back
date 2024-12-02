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
                            .leftJoinAndSelect('usuario.roleToUsuario', 'to_usuario', 'to_usuario."usuarioId" = usuario.id',)
                            .leftJoinAndSelect('to_usuario.role',    'roles',      'roles.id = to_usuario."roleId"')
                            .leftJoinAndSelect('roles.menuToRole',   'to_role',    'to_role."roleId" = roles.id')
                            .leftJoinAndSelect('to_role.menu',       'menus',      'menus.id = to_role."menuId"')
                            .leftJoinAndSelect('menus.itemMenu',     'items',    'menus.id = items."menuId"',)
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