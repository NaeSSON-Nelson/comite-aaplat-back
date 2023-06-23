import { Module } from '@nestjs/common';
import {  forwardRef} from "@nestjs/common/utils";
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AfiliadosModule } from 'src/afiliados/afiliados.module';

import { AuthService } from './auth.service';
// import { MenusService } from './menus/menus.service';
// import { RolesService } from './roles/roles.service';
// import { UsuariosService } from './usuarios/usuarios.service';

import { AuthController } from './auth.controller';
// import { UsuariosController } from './usuarios/usuarios.controller';
// import { MenusController } from './menus/menus.controller';
// import { RolesController } from './roles/roles.controller';

// import { ItemMenu, ItemToMenu, Menu } from './menus/entities';
// import { Role, MenuToRole } from './roles/entities/';
// import { PerfilUsuario, RoleToUsuario, Usuario } from './usuarios/entities';
import { CommonModule } from '../common/common.module';
import { JwtStrategy } from './strategies/jwt.strategies';
import { ManagerModule } from 'src/manager/manager.module';
// import { ManagerModule } from './manager/manager.module';
import { UsuariosModule } from '../manager/usuarios/usuarios.module';

@Module({
  controllers: [
    AuthController,
    // UsuariosController,
    // MenusController,
    // RolesController,
  ],
  providers: [
    AuthService,
    // UsuariosService,
    // MenusService,
    // RolesService,
    JwtStrategy,
  ],
  imports: [
    ConfigModule,
    CommonModule,
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
    UsuariosModule,
  ],
  exports: [
    // TypeOrmModule, 
    JwtStrategy, 
    PassportModule, 
    JwtModule,
    AuthService,
  ],
})
export class AuthModule {}
