import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilUsuario, Usuario } from './entities';
import { RolesToUsuarioModule } from './roles-to-usuario/roles-to-usuario.module';
import { AfiliadosModule } from '../../afiliados/afiliados.module';
import { CommonModule } from '../../common/common.module';

@Module({
    controllers:[UsuariosController],
    providers:[UsuariosService],
    imports:[
        TypeOrmModule.forFeature([
            Usuario,
            PerfilUsuario,
        ]),
    RolesToUsuarioModule,
    AfiliadosModule,
    CommonModule,
    ],
    exports:[
        TypeOrmModule,
        UsuariosService
    ],
})
export class UsuariosModule {}
