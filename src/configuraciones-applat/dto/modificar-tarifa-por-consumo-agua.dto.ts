import { PartialType } from "@nestjs/mapped-types";
import { NuevaTarifaPorConsumoAguaDto } from "./nueva-tarifa-por-consumo-agua.dto";

export class ModificarTarifaPorConsumoDto extends PartialType(NuevaTarifaPorConsumoAguaDto){

    
}