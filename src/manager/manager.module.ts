import { Module } from '@nestjs/common';
import { MenusModule } from './menus/menus/menus.module';
import { ItemsMenuModule } from './menus/items-menu/items-menu.module';
import { MenuToRoleModule } from './roles/menu-to-role/menu-to-role.module';
import { RolesModule } from './roles/roles/roles.module';

@Module({

  imports: [
    ItemsMenuModule,
    MenusModule,
    // MenuToRoleModule,
    RolesModule,
  ],
})
export class ManagerModule {}
