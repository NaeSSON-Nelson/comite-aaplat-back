import {  UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import {  ItemMenuProtected, MenusProtected, RoleProtected } from "./valid-protected.decorator";
import { UserRoleGuard } from "../guards/user-role.guard";
import { ValidItemMenu, ValidMenu, ValidRole } from '../../interfaces/valid-auth.enum';



export function Authentication(...roles:ValidRole[]){
    return applyDecorators(
        RoleProtected(...roles),
        // MenusProtected(...menus),
        // ItemMenuProtected(...itemsMenu),
        UseGuards(AuthGuard('jwt'),UserRoleGuard)
    )
}
