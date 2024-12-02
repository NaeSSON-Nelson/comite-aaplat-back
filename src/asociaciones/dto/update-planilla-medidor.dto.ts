import { PartialType } from "@nestjs/mapped-types";
import { CreatePlanillaMedidorDto } from "./create-planilla-medidor.dto";

export class UpdatePlanillaMedidorDto extends PartialType(CreatePlanillaMedidorDto) {}

