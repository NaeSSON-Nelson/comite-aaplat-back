import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { SeedsController } from './seeds.controller';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { ItemsMenuModule } from '../manager/menus/items-menu/items-menu.module';
import { MenusModule } from '../manager/menus/menus/menus.module';
import { MenuToRoleModule } from '../manager/roles/menu-to-role/menu-to-role.module';

import { RolesModule } from '../manager/roles/roles/roles.module';
import { RolesToUsuarioModule } from '../auth/modules/usuarios/roles-to-usuario/roles-to-usuario.module';
import { MedidoresModule } from 'src/medidores-agua/medidores.module';
import { PagosDeServicioModule } from '../pagos-de-servicio/pagos-de-servicio.module';
import { AsociacionesModule } from 'src/asociaciones/asociaciones.module';
import { ConfiguracionesApplatModule } from 'src/configuraciones-applat/configuraciones-applat.module';

@Module({
  controllers: [SeedsController],
  providers: [SeedsService],
  imports:[
    AuthModule,
    ItemsMenuModule,
    MenusModule,
    MenuToRoleModule,
    RolesModule,
    RolesToUsuarioModule,
    CommonModule,
    MedidoresModule,
    PagosDeServicioModule,
    AsociacionesModule,
    ConfiguracionesApplatModule,
  ]
})
export class SeedsModule {}
