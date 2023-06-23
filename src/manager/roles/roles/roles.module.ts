import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { CommonModule } from '../../../common/common.module';
import { RolesToUsuarioModule } from '../../usuarios/roles-to-usuario/roles-to-usuario.module';
import { MenuToRoleModule } from '../menu-to-role/menu-to-role.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    TypeOrmModule.forFeature([Role]),
    CommonModule,
    MenuToRoleModule,
    RolesToUsuarioModule,
  ],
  exports: [
    TypeOrmModule, 
    RolesService
  ],
})
export class RolesModule {}
