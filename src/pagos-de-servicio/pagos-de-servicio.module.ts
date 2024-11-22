import { Module } from '@nestjs/common';
import { PagosDeServicioService } from './pagos-de-servicio.service';
import { PagosDeServicioController } from './pagos-de-servicio.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprobanteDePagoDeMultas, ComprobantePago, ComprobantePorPago,ComprobantePorPagoAdicional, MultaServicio, PorPagarToPagado } from './entities';
import { CommonModule } from 'src/common/common.module';
import { MultasServicioAguaService } from './multas-agua.service';
import { MultasAguaController } from './multas-agua.controller';

@Module({
  controllers: [PagosDeServicioController,MultasAguaController],
  imports:[
    TypeOrmModule.forFeature([
      ComprobantePorPago,
      ComprobantePago,
      MultaServicio,
      ComprobanteDePagoDeMultas
    ]),
    AuthModule,
    CommonModule,
  ],
  providers: [PagosDeServicioService,MultasServicioAguaService],
  exports:[
    TypeOrmModule,PagosDeServicioService,
  ]
})
export class PagosDeServicioModule {}
