import { Module } from '@nestjs/common';
import { ConfiguracionesApplatService } from './configuraciones-applat.service';
import { ConfiguracionesApplatController } from './configuraciones-applat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarifaPorConsumoAgua } from './entities/tarifa-por-consumo-agua';
import { TarifaMultaPorRetrasosPagos } from './entities/tarifa-multa-por-retrasos-pagos';
import { BeneficiarioDescuentos } from './entities/beneficiario-descuentos';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [ConfiguracionesApplatController],
  providers: [ConfiguracionesApplatService],
  imports:[
    TypeOrmModule.forFeature([
      TarifaPorConsumoAgua,
      TarifaMultaPorRetrasosPagos,
      BeneficiarioDescuentos,
    ]),
    AuthModule,
    CommonModule,
  ],
  exports:[TypeOrmModule,ConfiguracionesApplatService]
})
export class ConfiguracionesApplatModule {}
