import { Module } from '@nestjs/common';
import { AsociacionesService } from './asociaciones.service';
import { AsociacionesController } from './asociaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedidorAsociado } from './entities/medidor-asociado.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [AsociacionesController],
  imports: [
    TypeOrmModule.forFeature([
      MedidorAsociado,
    ]),
    AuthModule,
    CommonModule,
  ],
  providers: [AsociacionesService],
  
  exports: [TypeOrmModule, AsociacionesService],
})
export class AsociacionesModule {}
