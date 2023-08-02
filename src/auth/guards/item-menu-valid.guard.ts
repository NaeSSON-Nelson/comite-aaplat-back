import { CanActivate, ExecutionContext, Injectable, BadRequestException,ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ITEMSMENU } from '../decorators/valid-protected.decorator';
import { Usuario } from '../modules/usuarios/entities';
import { UsuariosService } from '../modules/usuarios/usuarios.service';
import { ItemMenu } from '../../manager/menus/items-menu/entities/item-menu.entity';

@Injectable()
export class ItemMenuValidGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usuarioService: UsuariosService,
  ){}
  async canActivate(
    context: ExecutionContext,
  ) {
    const itemsValid:string[] = this.reflector.get(META_ITEMSMENU,context.getHandler());
    
    if (!itemsValid) return true;
    if (itemsValid.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    // console.log(req);
    const usuario = req.user as Usuario;
    if (!usuario) throw new BadRequestException(`Usuario not found`);
    const { roles } = await this.usuarioService.findOnePlaneUsuario(usuario.id);
    let item:ItemMenu;
    for(const rol of roles){
      item=await this.usuarioService.findItemMenuByRole(itemsValid,rol.id,usuario);
      if(item) continue;
    }
    if(!item) throw new ForbiddenException(
      `El usuario ${usuario.username} no tiene acceso a este recurso`,
      );
    if(item.isActive)throw new ForbiddenException(
      `El recurso no se encuentra actualmente disponible`,
      );
    return true;
  }
}
