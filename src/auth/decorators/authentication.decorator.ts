import {  UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import {  RoleProtected } from "./valid-protected.decorator";
import { UserRoleGuard } from "../guards/user-role.guard";
import { ValidRole } from '../../interfaces/valid-auth.enum';



export function Authentication(...roles:ValidRole[]){
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard('jwt'),UserRoleGuard)
    )
}
