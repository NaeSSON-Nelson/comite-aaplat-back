import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/valid-protected.decorator';
import { PerfilesService } from '../modules/usuarios/perfiles.service';
import { Usuario } from '../modules/usuarios/entities';
import { ValidRole } from 'src/interfaces/valid-auth.enum';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector:Reflector,
    private readonly dataSource:DataSource,
  ){}
   async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const validRoles:string[] = this.reflector.get(META_ROLES,context.getHandler());
   
    if(!validRoles) return true;
    if(validRoles.length===0) return true;

    const req = context.switchToHttp().getRequest();
    // req.hola='hola papu'
    // console.log(req);
    const usuario = req.user as Usuario;

    // console.log('usuario',usuario);
    if(!usuario) throw new BadRequestException(`Usuario not found`);
    // const {roles}= await this.usuarioService.findOnePlaneUsuario(usuario.id);
    const roles = usuario.roleToUsuario.map(toUsuario=>{
      return toUsuario.role.nombre
    })
    // console.log(roles);
    if(roles.includes(ValidRole.root)) {console.log('es usuario root');return true;}
    for(const nombre of roles){
      if(validRoles.includes(nombre) ) return true;
    }
    throw new ForbiddenException(`User ${usuario.username} no tiene acceso al modulo`);
  
  }
}
