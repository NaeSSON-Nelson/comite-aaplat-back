import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { CommonModule } from '../../../common/common.module';
import { MenuToRoleModule } from '../menu-to-role/menu-to-role.module';
import { RolesToUsuarioModule } from '../../../auth/modules/usuarios/roles-to-usuario/roles-to-usuario.module';
import { AuthModule } from '../../../auth/auth.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    TypeOrmModule.forFeature([Role]),
    CommonModule,
    MenuToRoleModule,
    RolesToUsuarioModule,
    AuthModule,
  ],
  exports: [
    TypeOrmModule, 
    RolesService
  ],
})
export class RolesModule {}
