import { SetMetadata } from '@nestjs/common';
import { ValidMenu, ValidRole,ValidItemMenu } from '../../interfaces/valid-auth.enum';

export const META_AFILIADOS = 'afiliados';
export const META_USUARIOS = 'usuarios';
export const META_ROLES = 'roles';
export const META_MENUS = 'menus';
export const META_ITEMSMENU = 'itemsMenu';

export const RoleProtected = (...args: ValidRole[]) => {
  return SetMetadata(META_ROLES, args);
};
export const MenusProtected = (...args: ValidMenu[]) => {
  return SetMetadata(META_MENUS, args);
};
export const ItemMenuProtected = (...args: ValidItemMenu[]) => {
  return SetMetadata(META_ITEMSMENU, args);
};

