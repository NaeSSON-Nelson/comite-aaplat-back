import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_MENUS } from '../decorators/valid-protected.decorator';
import { UsuariosService } from 'src/manager/usuarios/usuarios.service';
import { Usuario } from 'src/manager/usuarios/entities';
import { RolesService } from '../../manager/roles/roles/roles.service';


@Injectable()
export class MenuValidGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usuarioService: UsuariosService,
    private readonly rolesService: RolesService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validMenus: string[] = this.reflector.get(
      META_MENUS,
      context.getHandler(),
    );
    // console.log(validRoles);
    // console.log(validMenus);
    if (!validMenus) return true;
    if (validMenus.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const usuario = req.user as Usuario;
    if (!usuario) throw new BadRequestException(`Usuario not found`);
    const { roles } = await this.usuarioService.findOnePlaneUsuario(usuario.id);
    for (const rol of roles) {
      const { menus } = await this.rolesService.findOnePlaneRole(rol.id);
      for (const { nombre } of menus) {
        if (validMenus.includes(nombre)) return true;
      }
    }
    throw new ForbiddenException(
      `El usuario ${usuario.userName} no tiene acceso (menu)`,
    );
  }
}
