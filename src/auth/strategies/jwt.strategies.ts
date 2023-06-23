import {PassportStrategy} from '@nestjs/passport'
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Usuario } from 'src/manager/usuarios/entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

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
        
        const {id,userName} =payload; 

        const usuario = await this.usuarioRepository.findOneBy({userName});
        if(!usuario) throw new UnauthorizedException(`Token not valid`);
        //TODO: MEJORAR LOS ESTADOS DEL USUARIO
        if(usuario.estado==0) throw new UnauthorizedException(`The usuario is block, please talk with admin server`);
        return usuario;
    }
}