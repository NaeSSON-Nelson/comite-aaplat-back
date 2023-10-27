import { Module } from '@nestjs/common';
import { PagosDeServicioService } from './pagos-de-servicio.service';
import { PagosDeServicioController } from './pagos-de-servicio.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprobantePago, ComprobantePorPago } from './entities';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [PagosDeServicioController],
  imports:[
    TypeOrmModule.forFeature([
      ComprobantePorPago,
      ComprobantePago,
    ]),
    AuthModule,
    CommonModule,
  ],
  providers: [PagosDeServicioService]
})
export class PagosDeServicioModule {}
