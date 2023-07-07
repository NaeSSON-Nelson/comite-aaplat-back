import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/valid-protected.decorator';
import { UsuariosService } from '../modules/usuarios/usuarios.service';
import { Usuario } from '../modules/usuarios/entities';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector:Reflector,
    private readonly usuarioService:UsuariosService
  ){}
   async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const validRoles:string[] = this.reflector.get(META_ROLES,context.getHandler());
    // console.log(validRoles);
    if(!validRoles) return true;
    if(validRoles.length===0) return true;

    const req = context.switchToHttp().getRequest();
    // req.hola='hola papu'
    // console.log(req);
    const usuario = req.user as Usuario;
    // console.log(usuario);
    if(!usuario) throw new BadRequestException(`Usuario not found`);
    const {roles}= await this.usuarioService.findOnePlaneUsuario(usuario.id);
    // console.log(roles);
    for(const {nombre} of roles){
      if(validRoles.includes(nombre)) return true;
    }
    throw new ForbiddenException(`User ${usuario.userName} not has access`);
  
  }
}
