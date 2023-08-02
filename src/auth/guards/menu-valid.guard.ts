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
import { RolesService } from '../../manager/roles/roles/roles.service';
import { UsuariosService } from '../modules/usuarios/usuarios.service';
import { Usuario } from '../modules/usuarios/entities';
import { Menu } from '../../manager/menus/menus/entities/menu.entity';
import { Request } from 'express';


@Injectable()
export class MenuValidGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usuarioService: UsuariosService,
    // private readonly rolesService: RolesService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validMenus: string[] = this.reflector.get(META_MENUS,context.getHandler());
    
    if (!validMenus) return true;
    if (validMenus.length === 0) return true;
    const req = context.switchToHttp().getRequest<Request>();
    // console.log(req);
    const usuario = req.user as Usuario;
    if (!usuario) throw new BadRequestException(`Usuario not found`);
    const { roles } = await this.usuarioService.findOnePlaneUsuario(usuario.id);
    let menu:Menu;
    for(const rol of roles){
       menu = await this.usuarioService.findMenuByRole(validMenus,rol.id,usuario);
      if(menu) continue;
    }
    // console.log('tiene',menu);
    if(!menu)throw new ForbiddenException(
      `El usuario ${usuario.username} no tiene acceso a este menu`,
      );
    if(menu.isActive) throw new ForbiddenException(
      `El menu ${menu.nombre} no se encuentra disponible`,
    );

    return true;
  }
}
