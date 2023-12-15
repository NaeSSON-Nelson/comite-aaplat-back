import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';


import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';
import { CommonModule } from '../common/common.module';
import { JwtStrategy } from './strategies/jwt.strategies';
import { Afiliado } from './modules/usuarios/entities/afiliado.entity';
import { RolesToUsuarioModule } from './modules/usuarios/roles-to-usuario/roles-to-usuario.module';
import { Perfil, Usuario } from './modules/usuarios/entities';
import { PerfilController } from './modules/usuarios/perfiles.controller';
import { PerfilesService } from './modules/usuarios/perfiles.service';
import { UsuarioController } from './modules/usuarios/usuario.controller';
import { RefreshTokenJwtStrategy } from './strategies';

@Module({
  controllers: [
    AuthController,
    PerfilController,
    UsuarioController,
  ],
  providers: [
    AuthService,
    PerfilesService,
    JwtStrategy,
    RefreshTokenJwtStrategy,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Afiliado,
      Perfil,
    ]),
    ConfigModule,
    PassportModule.register({ 
      // defaultStrategy: ['jwt','jwt-refresh']
     }),
    JwtModule.register({})
    // registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     return {
    //       secret: configService.get('JWT_TOKEN_KEY'),
    //       signOptions: {
    //         expiresIn: '2h',
    //       },
    //     };
    //   },
    // })
    ,CommonModule,
    
    RolesToUsuarioModule,
    
  ],
  exports: [
    TypeOrmModule, 
    JwtStrategy, 
    RefreshTokenJwtStrategy,
    PassportModule, 
    JwtModule,
    AuthService,
    PerfilesService,
  ],
})
export class AuthModule {}
