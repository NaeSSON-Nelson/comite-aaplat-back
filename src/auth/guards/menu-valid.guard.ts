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
import { PerfilesService } from '../modules/usuarios/perfiles.service';
import { Usuario } from '../modules/usuarios/entities';
import { Menu } from '../../manager/menus/menus/entities/menu.entity';
import { Request } from 'express';


@Injectable()
export class MenuValidGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
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
    const roles = usuario.roleToUsuario.map(toUsuario=>{
      return toUsuario.role
    })
    let menu:Menu;
    roles.forEach(role=>{
     const menus=role.menuToRole.map(toRole=>toRole.menu);
     for(const item of menus){
       if(validMenus.includes(item.nombre)) {menu=item; continue;}
     } if(menu) return;
    })
    // const menu:Menu = await this.usuarioService.findMenuByRole(validMenus,roles);
    console.log('menu:',menu);
    if(!menu)throw new ForbiddenException(
      `El usuario ${usuario.username} no tiene acceso a este menu`,
    );
    if(!menu.isActive) throw new ForbiddenException(
      `El menu ${menu.nombre} no se encuentra disponible`,
    );
    return true;
  }
}
