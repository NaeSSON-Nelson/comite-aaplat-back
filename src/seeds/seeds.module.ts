import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { SeedsController } from './seeds.controller';
import { AuthModule } from '../auth/auth.module';
import { AfiliadosModule } from '../afiliados/afiliados.module';
import { CommonModule } from '../common/common.module';
import { ManagerModule } from 'src/manager/manager.module';
import { ItemsMenuModule } from '../manager/menus/items-menu/items-menu.module';
import { ItemsToMenuModule } from '../manager/menus/items-to-menu/items-to-menu.module';
import { MenusModule } from '../manager/menus/menus/menus.module';
import { MenuToRoleModule } from '../manager/roles/menu-to-role/menu-to-role.module';
import { RolesToUsuarioModule } from '../manager/usuarios/roles-to-usuario/roles-to-usuario.module';
import { UsuariosModule } from '../manager/usuarios/usuarios.module';
import { RolesModule } from '../manager/roles/roles/roles.module';

@Module({
  controllers: [SeedsController],
  providers: [SeedsService],
  imports:[
    AuthModule,
    AfiliadosModule,
    ItemsMenuModule,
    ItemsToMenuModule,
    MenusModule,
    MenuToRoleModule,
    RolesToUsuarioModule,
    RolesModule,
    UsuariosModule,
    CommonModule
  ]
})
export class SeedsModule {}
