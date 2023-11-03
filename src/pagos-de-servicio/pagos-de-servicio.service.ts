import { Injectable, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ComprobantePago, ComprobantePorPago } from './entities';
import { DataSource, IsNull, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { AnioSeguimientoLectura } from 'src/medidores-agua/entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from 'src/medidores-agua/entities/mes-seguimiento-registro-lectura.entity';
import { Mes, Monedas } from 'src/interfaces/enum/enum-entityes';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { Afiliado, Perfil } from 'src/auth/modules/usuarios/entities';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MesLectura } from 'src/medidores-agua/entities/mes-lectura.entity';

@Injectable()
export class PagosDeServicioService {
  constructor(
    // @InjectRepository(PlanillaPagos)
    // private readonly planillasPagosService: Repository<PlanillaPagos>,
    @InjectRepository(ComprobantePorPago)
    private readonly comprobantePorPagarService: Repository<ComprobantePorPago>,
    @InjectRepository(ComprobantePago)
    private readonly comprobantePagoService: Repository<ComprobantePago>,
    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
  ) {}

  
  //* TASK SCHEDULING
  private readonly logger = new Logger(PagosDeServicioService.name);
  private readonly TARIFA_MINIMA = 10;
  private readonly LECTURA_MINIMA = 10;
  private readonly COSTO_ADICIONAL = 2;
  // //@Cron('15 * * * * *')
  // @Cron(CronExpression.EVERY_YEAR)
  // private async registrarPlanillasDeMedidores() {
  //   const yearAct = new Date().getFullYear();
  //   const afiliados = await this.dataSource
  //     .getRepository(Afiliado)
  //     .find({ where: { isActive: true } });
  //   //this.logger.verbose(afiliados,'papitas :3');
  //   for (const afiliado of afiliados) {
  //     const planillaExist = await this.planillasPagosService.findOneBy({
  //       gestion: yearAct,
  //       afiliado: { id: afiliado.id },
  //     });
  //     if (planillaExist) {
  //       this.logger.warn(
  //         `Planilla de pago ${yearAct} del afiliado ${afiliado.id} ya existe`,
  //       );
  //     } else {
  //       const planilla = this.planillasPagosService.create({
  //         gestion: yearAct,
  //         afiliado,
  //       });
  //       try {
  //         await this.planillasPagosService.save(planilla);
  //         this.logger.log(`Planilla de pago ${yearAct} afiliad creada!!`);
  //       } catch (error) {
  //         this.logger.warn('OCURRIO UN ERROR AL REGISTRAR');
  //         this.logger.warn(error);
  //       }
  //     }
  //   }

  //   //this.logger.error(`Year ${yearAct} no registered!`)
  // }

  // @Cron('15 * * * * *')
  // At 00:00 on day-of-month 7.
  @Cron('0 0 10 * *')
  private async ComprobantesPorPagarAutomatizado() {
    const fechaActual = new Date()
    let gestion = fechaActual.getFullYear();
    let index=fechaActual.getMonth()-1;
    if(fechaActual.getMonth()===0){
      gestion = fechaActual.getFullYear()-1;
      index=11;
    }
    const seguimientoAnioActual = await this.dataSource
      .getRepository(AnioSeguimientoLectura)
      .findOne({
        where: { anio: gestion,meses:{} },
        relations: { meses: true },
      });
    if (!seguimientoAnioActual) {
      this.logger.error(
        `this date ${fechaActual.getFullYear()} not registered`,
      );
      return;
    }
    const month = new Date(gestion,index)
      .toLocaleString('default', { month: 'long' })
      .toUpperCase();
    // const seguimientoMesAnterior = seguimientoAnioActual.meses.find(
    //   (mes) =>
    //     mes.mes ===
    //     (month.includes('ENERO')
    //       ? Mes.enero
    //       : month.includes('FEBRERO')
    //       ? Mes.febrero
    //       : month.includes('MARZO')
    //       ? Mes.marzo
    //       : month.includes('ABRIL')
    //       ? Mes.abril
    //       : month.includes('MAYO')
    //       ? Mes.mayo
    //       : month.includes('JUNIO')
    //       ? Mes.junio
    //       : month.includes('JULIO')
    //       ? Mes.julio
    //       : month.includes('AGOSTO')
    //       ? Mes.agosto
    //       : month.includes('SEPTIEMBRE')
    //       ? Mes.septiembre
    //       : month.includes('OCTUBRE')
    //       ? Mes.octubre
    //       : month.includes('NOVIEMBRE')
    //       ? Mes.noviembre
    //       : month.includes('DICIEMBRE')
    //       ? Mes.diciembre
    //       : Mes.enero),
    // );
    // if (!seguimientoMesAnterior) {
    //   this.logger.warn(
    //     `month ${seguimientoMesAnterior} not exist for ${fechaActual.getFullYear()}`,
    //   );
    //   return;
    // }
    const planQr = this.dataSource
      .getRepository(Afiliado)
      .createQueryBuilder('afiliados');
    try {
      const afiliados = await planQr
        .innerJoinAndSelect(
          'afiliados.medidores',
          'medidor',
          'medidor."afiliadoId" = afiliados.id AND medidor.isActive = true',
        )
        .innerJoinAndSelect(
          'medidor.planillas',
          'planillas',
          'planillas.gestion = :year AND planillas.isActive = true',
          { year: gestion },
        )
        .innerJoinAndSelect(
          'planillas.lecturas',
          'lecturas',
          'lecturas.mesLecturado = :month AND lecturas.isActive = true',
          { month },
        )
        .where('planillas.isActive = true')
        .getMany();
      // console.log(afiliados);
      for (const afiliado of afiliados) {
        for (const medidor of afiliado.medidores) {
          const comprobante = await this.comprobantePorPagarService.findOneBy({
            lectura: { id: medidor.planillas[0].lecturas[0].id },
          });
          if (comprobante) {
            this.logger.warn(
              `el mes lectura ${medidor.planillas[0].lecturas[0].mesLecturado} del medidor de agua con NRO:${medidor.nroMedidor} ya tiene un comprobante por pagar registrado`,
            );
          } else {
            const comprobantePorPagar = this.comprobantePorPagarService.create({
              lectura: medidor.planillas[0].lecturas[0],
              //TODO: MONTO A PAGAR MINIMO ES DE 10 BS SI EL REGISTRO DE LECTURA ES INFERIOR A 10 M3, SE COBRA 2 BS POR CADA M3
              monto:
                medidor.planillas[0].lecturas[0].consumoTotal >
                this.LECTURA_MINIMA
                  ? this.TARIFA_MINIMA +
                    (medidor.planillas[0].lecturas[0].consumoTotal -
                      this.LECTURA_MINIMA) *
                      this.COSTO_ADICIONAL
                  : this.TARIFA_MINIMA,
              motivo: `PAGO DE SERVICIO, GESTION:${gestion}, MES: ${month}`,
              metodoRegistro: 'REGISTRO AUTOMATIZADO',
              moneda: Monedas.Bs,
            });
            try {
              await this.comprobantePorPagarService.save(comprobantePorPagar);
              this.logger.log(`COMPROBANTE DE PAGO REGISTRADO!`);
            } catch (error) {
              this.logger.error(error);
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async ComprobanteDetalles(idLectura: number) {
    const lecturaPorPagar = await this.dataSource.getRepository(MesLectura).findOne({
      where: { id:idLectura},
      relations: { pagar:{comprobante:true} },
      select:{
        consumoTotal:true,created_at:true,estadoMedidor:true,id:true,isActive:true,lectura:true,mesLecturado:true,
        pagar: {created_at:true,estado:true,estadoComprobate:true,fechaPagada:true,id:true,metodoRegistro:true,moneda:true,monto:true,motivo:true,pagado:true,
          comprobante:{created_at:true,entidadPago:true,fechaEmitida:true,id:true,metodoPago:true,montoPagado:true,nroRecibo:true,},
        },
      }
    });
    if (!lecturaPorPagar)
      throw new BadRequestException(
        `la lectura: ${idLectura} no fue encontrada`,
      );
    return {
      OK: true,
      message: 'lectura con comprobante de pago ',
      data: lecturaPorPagar,
    };
  }
  async generarComprobantes(){
    const fechaActual = new Date()
    let gestion = fechaActual.getFullYear();
    let index=fechaActual.getMonth()-1;
    if(fechaActual.getMonth()===0){
      gestion = fechaActual.getFullYear()-1;
      index=11;
    }
    const mes=index===0?Mes.enero
    :index===1?Mes.febrero
    :index===2?Mes.marzo
    :index===3?Mes.abril
    :index===4?Mes.mayo
    :index===5?Mes.junio
    :index===6?Mes.julio
    :index===7?Mes.agosto
    :index===8?Mes.septiembre
    :index===9?Mes.octubre
    :index===10?Mes.noviembre
    :index===11?Mes.diciembre
    :Mes.enero;
    const month = new Date(gestion,index).toLocaleString('default', { month: 'long' }).toUpperCase();
    const mesRegistrar = await this.dataSource.getRepository(MesSeguimientoRegistroLectura).findOne({
      where:[
        {
          mes,
          anioSeguimiento:{
            anio:gestion,
          }
        },
      ],relations:{anioSeguimiento:true}
    })
    if(!mesRegistrar) throw new BadRequestException(`Mes no registrado ${month} año ${gestion}`);
    if(fechaActual.getTime()<=mesRegistrar.fechaRegistroLecturas.getTime() || fechaActual.getTime()>= mesRegistrar.fechaFinRegistroLecturas.getTime())
    throw new BadRequestException(`No se encuentra en el rango de fecha establecida permitada para generar los comprobantes`)
  
    const planillasLecturas = await this.dataSource.getRepository(PlanillaLecturas)
            .find({where:
              {gestion:mesRegistrar.anioSeguimiento.anio,
                lecturas:{mesLecturado:mesRegistrar.mes,isActive:true},
                isActive:true},
            relations:{lecturas:{pagar:true}}});
    const lecturas:MesLectura[]=[];
    planillasLecturas.forEach(plan=>{
      plan.lecturas.forEach(lect=>{
        
        if(lect.pagar===null)
        lecturas.push(lect);
      })
    })
    const comprobantesGenerados:ComprobantePorPago[]=[];
    for(const lectu of lecturas){
      const comp = this.comprobantePorPagarService.create({
        lectura:lectu,
        metodoRegistro:'GENERADO POR LA CAJA',
        monto:lectu.consumoTotal >this.LECTURA_MINIMA
                ? this.TARIFA_MINIMA +(lectu.consumoTotal -this.LECTURA_MINIMA) *this.COSTO_ADICIONAL
                : this.TARIFA_MINIMA,
        motivo: `PAGO DE SERVICIO, GESTION:${gestion}, MES: ${month}`,
        moneda: Monedas.Bs,
      })
      try {
        await this.comprobantePorPagarService.save(comp);
        comprobantesGenerados.push(comp);
      } catch (error) {
        this.logger.error('error al registrar un comprobante',error);
      }
    }
    return {
      OK:true,
      message:'Comprobantes creados con exito',
      data:comprobantesGenerados.length,
    };
  }
}
