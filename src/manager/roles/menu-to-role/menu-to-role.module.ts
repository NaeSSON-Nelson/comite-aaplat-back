import { Module } from '@nestjs/common';
import { MenuToRoleService } from './menu-to-role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuToRole } from './entities/menuToRole.entity';
import { MenusModule } from '../../menus/menus/menus.module';

@Module({
  providers: [MenuToRoleService],
  imports:[
    TypeOrmModule.forFeature([
      MenuToRole
    ])
  ],
  exports:[
    TypeOrmModule,
    MenuToRoleService,
  ]
})
export class MenuToRoleModule {}
