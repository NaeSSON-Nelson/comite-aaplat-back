import { PartialType } from "@nestjs/mapped-types";
import { CreateItemToMenuDto } from "./create-item-to-menu.dto";

export class UpdateItemToMenuDto extends PartialType(CreateItemToMenuDto) {}
