import {  UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ValidMenu } from "src/interfaces/valid-auth.enum";
import { MenusProtected } from "./valid-protected.decorator";
import { MenuValidGuard } from "../guards/menu-valid.guard";

export function Authorization(...menus:ValidMenu[]){
    return applyDecorators(
        MenusProtected(...menus),
        UseGuards(AuthGuard(),MenuValidGuard)

    )
}