import {PassportStrategy} from '@nestjs/passport'
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Usuario } from '../modules/usuarios/entities';
import { Request } from 'express';

@Injectable()
export class RefreshTokenJwtStrategy extends PassportStrategy(Strategy,'jwt-refresh'){

    constructor(
        @InjectRepository(Usuario)
        private readonly usuarioRepository:Repository<Usuario>,
        private readonly configService:ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_TOKEN_REFRESH_KEY'),
            jwtFromRequest: ExtractJwt.fromHeader('refresh'),
            passReqToCallback: true
        })
    }
    async validate(req: Request,payload: any) {
        // console.log('paso el refresh :V');
        // console.log(req);
        // console.log(payload);
        return {...payload,}
    }
}