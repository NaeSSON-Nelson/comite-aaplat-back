import { Module } from '@nestjs/common';
import { RolesToUsuarioService } from './roles-to-usuario.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleToUsuario } from './entities/role-to-usuario.entity';
import { CommonModule } from '../../../../common/common.module';

@Module({
  providers: [RolesToUsuarioService],
  imports:[
    TypeOrmModule.forFeature([
      RoleToUsuario
    ]),
    CommonModule,
  ],
  exports:[
    TypeOrmModule,
    RolesToUsuarioService,
  ]
})
export class RolesToUsuarioModule {}
