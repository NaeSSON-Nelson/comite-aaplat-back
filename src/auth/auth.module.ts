import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';


import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';
import { CommonModule } from '../common/common.module';
import { JwtStrategy } from './strategies/jwt.strategies';
import { PerfilUsuario, Usuario } from './modules/usuarios/entities';
import { Afiliado } from './modules/afiliados/entities/afiliado.entity';
import { AfiliadosController } from './modules/afiliados/afiliados.controller';
import { AfiliadosService } from './modules/afiliados/afiliados.service';
import { UsuariosController } from './modules/usuarios/usuarios.controller';
import { UsuariosService } from './modules/usuarios/usuarios.service';
import { RolesToUsuarioModule } from './modules/usuarios/roles-to-usuario/roles-to-usuario.module';

@Module({
  controllers: [
    AuthController,
    UsuariosController,
    AfiliadosController,
    // MenusController,
    // RolesController,
  ],
  providers: [
    AuthService,
    UsuariosService,
    AfiliadosService,
    // MenusService,
    // RolesService,
    JwtStrategy,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Afiliado,
      PerfilUsuario,
    ]),
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_TOKEN_KEY'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
    CommonModule,
    
    RolesToUsuarioModule,
    
  ],
  exports: [
    TypeOrmModule, 
    JwtStrategy, 
    PassportModule, 
    JwtModule,
    AuthService,
    AfiliadosService,
    UsuariosService,
  ],
})
export class AuthModule {}
