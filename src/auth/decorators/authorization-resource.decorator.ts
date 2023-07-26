import {  UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ValidItemMenu } from "src/interfaces/valid-auth.enum";
import { ItemMenuProtected } from "./valid-protected.decorator";
import { ItemMenuValidGuard } from "../guards/item-menu-valid.guard";

export function AuthorizationResource(...items:ValidItemMenu[]){
    return applyDecorators(
        ItemMenuProtected(...items),
        UseGuards(AuthGuard(),ItemMenuValidGuard)

    )
}