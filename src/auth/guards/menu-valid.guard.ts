import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_MENUS } from '../decorators/valid-protected.decorator';
import { RolesService } from '../../manager/roles/roles/roles.service';
import { PerfilesService } from '../modules/usuarios/perfiles.service';
import { Usuario } from '../modules/usuarios/entities';
import { Menu } from '../../manager/menus/menus/entities/menu.entity';
import { Request } from 'express';
import { DataSource } from 'typeorm';


@Injectable()
export class MenuValidGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource:DataSource,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validMenus: string[] = this.reflector.get(META_MENUS,context.getHandler());
    
    if (!validMenus) return true;
    if (validMenus.length === 0) return true;
    const req = context.switchToHttp().getRequest<Request>();
    // console.log(req);
    const usuario = req.user as Usuario;
    // console.log('usuario en menu',usuario);
    if (!usuario) throw new BadRequestException(`Usuario not found`);
    const roles = usuario.roleToUsuario.map(toUsuario=>{
      return toUsuario.role
    })
    let menu:Menu;
    for(const rol of roles){
      const menus = rol.menuToRole.map(toRole=>toRole.menu);
      menu = menus.find(men=>validMenus.includes(men.linkMenu));
      if(menu)break;
    };
    // console.log('menu buscado:',menu);
    if(!menu)throw new ForbiddenException(
      `El usuario ${usuario.username} no tiene acceso a este menu`,
    );
    if(!menu.isActive) throw new NotFoundException(
      `El menu ${menu.nombre} no se encuentra disponible`,
    );
    return true;
  }
}
