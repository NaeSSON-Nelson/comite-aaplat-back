import { PartialType } from "@nestjs/mapped-types";
import { CreateItemMenuDto } from "./create-Item-menu.dto";

export class UpdateItemMenuDto extends PartialType(CreateItemMenuDto) {}
