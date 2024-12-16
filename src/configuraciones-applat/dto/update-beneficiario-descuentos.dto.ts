import { PartialType } from "@nestjs/mapped-types";
import { NuevoBeneficiarioDescuentoDto } from "./nuevo-beneficiario-descuentos.dto";

export class UpdateBeneficiarioDescuentosDto extends PartialType(NuevoBeneficiarioDescuentoDto){

}