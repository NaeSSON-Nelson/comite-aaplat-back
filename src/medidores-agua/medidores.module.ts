import { Module } from '@nestjs/common';
import { MedidoresController } from './medidores.controller';
import { MedidoresService } from './medidores.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medidor } from './entities/medidor.entity';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { MesLectura } from './entities/mes-lectura.entity';
import { PlanillaLecturas } from './entities/planilla-lecturas.entity';
import { AnioSeguimientoLectura } from './entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from './entities/mes-seguimiento-registro-lectura.entity';
import { MedidorAsociado } from './entities/medidor-asociado.entity';

@Module({
  controllers: [MedidoresController],
  providers: [MedidoresService],
  imports: [
    TypeOrmModule.forFeature([
      Medidor,
      PlanillaLecturas,
      MesLectura,
      AnioSeguimientoLectura,
      MesSeguimientoRegistroLectura,
      MedidorAsociado,
    ]),
    AuthModule,
    CommonModule,
  ],
  exports: [TypeOrmModule, MedidoresService],
})
export class MedidoresModule {}
