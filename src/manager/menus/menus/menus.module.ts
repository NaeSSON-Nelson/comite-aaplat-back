import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { MenuToRole } from '../../roles/menu-to-role/entities/menuToRole.entity';
import { MenuToRoleModule } from '../../roles/menu-to-role/menu-to-role.module';
import { CommonModule } from '../../../common/common.module';
import { AuthModule } from '../../../auth/auth.module';


@Module({
    providers:[MenusService],
    controllers:[MenusController],
    imports:[TypeOrmModule.forFeature([
        Menu
    ]),
    MenuToRoleModule,
    CommonModule,
    AuthModule
],
    exports:[
        TypeOrmModule,
        MenusService
    ]
})
export class MenusModule {}
