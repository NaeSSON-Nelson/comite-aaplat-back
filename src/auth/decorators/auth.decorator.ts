import {  UseGuards, applyDecorators } from "@nestjs/common";

import { MenusProtected, RoleProtected } from "./valid-protected.decorator";
import { AuthGuard } from "@nestjs/passport";
import { ValidMenu, ValidRole } from '../../interfaces/valid-auth.enum';
import { UserRoleGuard } from "../guards/user-role.guard";
import { MenuValidGuard } from "../guards/menu-valid.guard";



export function Authentication(...roles:ValidRole[]){
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard(),UserRoleGuard)
    )
}
export function Authorization(...menus:ValidMenu[]){
    return applyDecorators(
        MenusProtected(...menus),
        UseGuards(AuthGuard(),MenuValidGuard)

    )
}