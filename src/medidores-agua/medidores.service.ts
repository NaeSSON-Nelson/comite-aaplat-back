import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CreateMedidorDto } from './dto/create-medidor.dto';
import { UpdateMedidorDto } from './dto/update-medidor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOperator, FindOptionsOrder, FindOptionsWhere, ILike, IsNull, Like, Repository, SelectQueryBuilder, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Medidor } from './entities/medidor.entity';
import { CommonService } from '../common/common.service';
import { Afiliado } from '../auth/modules/usuarios/entities/afiliado.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Perfil } from 'src/auth/modules/usuarios/entities';
import { Barrio, Estado, Mes, Monedas } from 'src/interfaces/enum/enum-entityes';
import { PlanillaLecturas } from './entities/planilla-lecturas.entity';
import { PlanillaMesLectura } from './entities/planilla-mes-lectura.entity';
import { UpdatePlanillaMedidorDto } from '../asociaciones/dto/update-planilla-medidor.dto';
import { registerAllLecturasDto } from './dto/register-all-lecturas.dto';
import { AnioSeguimientoLectura } from './entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from './entities/mes-seguimiento-registro-lectura.entity';
import { QueryLecturasDto } from './query/queryLecturas';
import { Cron,CronExpression } from '@nestjs/schedule';
import { isNotEmpty } from 'class-validator';
import { MedidorAsociado } from 'src/asociaciones/entities/medidor-asociado.entity';
import { CreateTarifaPorPagarDto } from './dto/create-tarifa-por-pagar.dto';
import { ComprobantePorPago } from 'src/pagos-de-servicio/entities';
import { TarifaPorConsumoAgua } from 'src/configuraciones-applat/entities/tarifa-por-consumo-agua';
import { DescuentosAplicadosPorPagar } from 'src/pagos-de-servicio/entities/descuentos-aplicados-por-pagar';

@Injectable()
export class MedidoresService {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
    @InjectRepository(Medidor)
    private readonly medidorRepository: Repository<Medidor>,
    
    @InjectRepository(PlanillaLecturas)
    private readonly planillasMedidoresRepository: Repository<PlanillaLecturas>,
    @InjectRepository(PlanillaMesLectura)
    private readonly planillaMesLecturasRepository: Repository<PlanillaMesLectura>,

    @InjectRepository(AnioSeguimientoLectura)
    private readonly anioSeguimientoLecturaRepository: Repository<AnioSeguimientoLectura>,
    @InjectRepository(MesSeguimientoRegistroLectura)
    private readonly mesSeguimientoRegistroLecturaRepository: Repository<MesSeguimientoRegistroLectura>,
    @InjectRepository(ComprobantePorPago)
    private readonly comprobantePorPagarService: Repository<ComprobantePorPago>,
    private readonly commonService: CommonService,
    private readonly dataSource: DataSource,
    // private readonly schedulerRegistry: SchedulerRegistry
  ) {}
  async create(createMedidoreDto: CreateMedidorDto) {
    // const { } = createMedidoreDto;
    
    const medidor = this.medidorRepository.create({
    lecturaMedidor:createMedidoreDto.lecturaInicial,
      ...createMedidoreDto});
    try {
      await this.medidorRepository.save(medidor);
      return {
        OK: true,
        message: 'Medidor creado con exito',
        data: medidor,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  
  async findAllMedidoresWithAfiliados(paginationDto: PaginationDto) {
    const { offset = 0, limit = 10, order = 'ASC', q = '' } = paginationDto;
    let arg =[''];
    if(q.length>0){
      arg =q.toLocaleLowerCase().split(/\s/).filter(val=>val.length>0);
    }
    if(arg.length===0) arg=[''];
    
    // console.log(arg);
    const finders:FindOptionsWhere<Perfil>[] = [];
    for(const data of arg){
      finders.push(
        { nombrePrimero:   ILike(`%${data}%`) },
        { nombreSegundo:   ILike(`%${data}%`) },
        { apellidoPrimero: ILike(`%${data}%`) },
        { apellidoSegundo: ILike(`%${data}%`) },
        { CI:              ILike(`%${data}%`) },
      )
    }
    const qb = this.perfilRepository.createQueryBuilder('perfil');
    const { '0': data, '1': size } = await qb
      .innerJoinAndSelect(
        'perfil.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfil.id',
      )
      .leftJoinAndSelect(
        'afiliado.medidorAsociado',
        'medidor',
        'medidor."afiliadoId" = afiliado.id AND medidor.isActive = true',
      )
      // .where('perfil.nombre_primero LIKE :query', { query: `${q}%` })
      .orWhere(finders)
      // .orWhere('perfil.nombre_segundo LIKE :query', { query: `${q}%` })
      // .orWhere('perfil.apellido_primero LIKE :query', { query: `${q}%` })
      // .orWhere('perfil.apellido_segundo LIKE :query', { query: `${q}%` })
      // .orWhere('perfil.cedula_identidad LIKE :query', { query: `${q}%` })
      .offset(offset)
      .limit(limit)
      .orderBy('perfil.id', 'ASC')
      .getManyAndCount();
    return {
      OK: true,
      message: 'listado de afiliados con medidores asignados',
      data: {
        data,
        size,
        offset,
        limit,
        order,
      },
    };
  }

  async findMedidorById(id:number){
    const medidor = await this.medidorRepository.findOne({
      where:[
        {
          id,
          medidorAsociado:{
            isActive:true,
          }
        },
      {
        id
      }
    ],
    select:{
      id:true,isActive:true,estado:true,
      nroMedidor:true,funcionamiento:true,lecturaInicial:true,lecturaMedidor:true,
      marca:true,medicion:true,
      medidorAsociado:{
        id:true,isActive:true,estado:true,
        afiliado:{id:true,perfil:{id:true}}
      }
    },
    relations:{
      medidorAsociado:{afiliado:{perfil:true}}
    }
    })
    if(!medidor) throw new BadRequestException(`Medidor with id ${id} not found`);
    return {
      OK:true,
      message:'MEDIDOR ENCONTRADO',
      data:medidor
    }
  }

  async update(id: number, updateMedidoreDto: UpdateMedidorDto) {
    const  {estado,...dataMedidor}  = updateMedidoreDto;
    const medidor = await this.medidorRepository.preload({
      id,
      ...dataMedidor,
    });
    if (!medidor)
      throw new NotFoundException(`Medidor with id ${id} not found`);
    try {
      await this.medidorRepository.save(medidor);
      return {
        OK: true,
        message: 'Medidor actualizado',
        data: medidor,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async updateStatus(id: number, updateMedidoreDto: UpdateMedidorDto) {
    const { estado } = updateMedidoreDto;
    const medidor = await this.medidorRepository.findOne({
      where:{
        id,
      },
      relations:{
        medidorAsociado:true,
      }
    });
    if (!medidor)
      throw new NotFoundException(`Medidor with id ${id} not found`);
    if(estado === Estado.ACTIVO){
      medidor.isActive=true;
    }else{
      for(const asc of medidor.medidorAsociado){
        if(asc.isActive) throw new BadRequestException(`El medidor con id ${id} tiene una asociacion activa, no se puede deshabilitar un medidor con una asociacion activa`);
      }
      medidor.isActive=false;
    }
    try {
      medidor.estado=estado;
      await this.medidorRepository.update(medidor.id,{isActive:medidor.isActive,estado});
      return {
        OK: true,
        message: `estado del medidor cambiado`,
        data: await this.findMedidorAsociacionesPlane(medidor.id) ,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  private async findMedidorAsociacionesPlane(idMedidor:number){
    const medidor = await this.medidorRepository.findOne({
      where:{id:idMedidor},
      select:{
        id:true,isActive:true,estado:true,funcionamiento:true,lecturaInicial:true,lecturaMedidor:true,marca:true,medicion:true,nroMedidor:true,
        medidorAsociado:{
          id:true,isActive:true,estado:true,estadoMedidorAsociado:true,
        }
      },
      relations:{
        medidorAsociado:true
      }
    });
    return medidor;
  }
  async   findMedidores(query:PaginationDto){

    const {q='',limit=10,offset=0,order='ASC'} = query;
    const {"0":data,"1":size} = await this.medidorRepository.findAndCount({
      where:[{nroMedidor:ILike(`%${q}%`)},
             {marca:ILike(`%${q}%`)},
      ],
      select:{
        id:true,estado:true,isActive:true,marca:true,nroMedidor:true,funcionamiento:true,medidorAsociado:{
          id:true,isActive:true,
        }
      },
      relations:{medidorAsociado:true,},
      skip: offset,
      take: limit,
      order: {
        id: order,
      },
    });

    return {
      OK: true,
      message: 'Medidores ',
      data: {
        data,
        size,
        offset,
        limit,
        order,
      },
    };
  }
  async findMedidorByNro(nroMedidor: string) {
    const data = await this.medidorRepository.findOneBy({ nroMedidor });
    return {
      OK: true,
      message: 'Medidor con nro',
      data,
    };
  }

  async findAllPlanillasWidthMedidores() {
    const qb = this.medidorRepository.createQueryBuilder('medidor');
    const { '0': data, '1': size } = await qb
      .innerJoinAndSelect('medidor.medidorAsociado','medidor_asociado')
      .innerJoinAndSelect('medidor_asociado.planillas', 'planillas')
      .getManyAndCount();
    return {
      OK: true,
      message: 'lista de planillas de medidores',
      data,
    };
  }

  async registrarAllLecturas(registerAllLecturas: registerAllLecturasDto) {
    // console.log(registerAllLecturas);
    const fechaLecturas = new Date();
    let gestion = fechaLecturas.getFullYear();
    let index = fechaLecturas.getMonth()-1;
    let mes = new Date(gestion,fechaLecturas.getMonth()-1).toLocaleString('default', { month: 'long' }).toUpperCase();
    if(fechaLecturas.getMonth() === 0){
      gestion = fechaLecturas.getFullYear()-1;
      mes = new Date(gestion,11).toLocaleString('default', { month: 'long' }).toUpperCase();
      index = 11;
    }
    const {registros} = registerAllLecturas;
    const anioExiste = await this.anioSeguimientoLecturaRepository.findOne({
      where: { anio:gestion },
      relations: { meses: true },
    });
    if (!anioExiste) throw new BadRequestException(`No es un año registrado`);
    const mesExiste = anioExiste.meses.find((mesT) => mesT.mes === mes);
    if (!mesExiste)
      throw new BadRequestException(
        `${mes} no es un un mes registrado del año ${gestion}`,
      );
    const fechaActual = new Date();
    if( fechaActual.getTime()<=mesExiste.fechaRegistroLecturas.getTime() || fechaActual.getTime()>= mesExiste.fechaFinRegistroLecturas.getTime()){
      throw new BadRequestException(`No se encuentra en el rango de fecha establecida permitada para registro`)
    }
    const planillasLecturas = await this.planillaMesLecturasRepository.find({
      where:{
        PlanillaMesLecturar:mesExiste.mes,
        registrable:true,
        registrado:false,
        planilla:{
          gestion:anioExiste.anio,
          registrable:true,
          isActive:true,
        }
      },
      relations:{planilla:{medidor:{medidor:true}}},
    });
    if(planillasLecturas.length===0) throw new NotFoundException(`NO HAY PLANILLAS DE MES PARA REGISTRAR DE: GESTION ${gestion}, MES ${mes}`);
    const tarifarioVigente = (await this.dataSource.getRepository(TarifaPorConsumoAgua).find({
      where:{
        vigencia:LessThanOrEqual(fechaLecturas),
        isActive:true
      },
      order:{
        id:'DESC'
      }
    }))[0];
    if(!tarifarioVigente) throw new NotFoundException(`NO EXISTE UNA TARIFA DE CALCULO PARA CALCULAR EL COSTE DE CONSUMO DE AGUA POTABLE`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const lecturas: PlanillaMesLectura[] = [];
    for(const reg of registros){
      const lect = planillasLecturas.find(lect=>lect.id === reg.id);
      const medidor = lect.planilla.medidor;
      if(lect){
        const perfilDescuentos= await this.perfilRepository.findOne(
          {where:{
            afiliado:{
              medidorAsociado:{
                planillas:{
                  lecturas:{
                    id:lect.id
                  }
                }
              },
              descuentos:{
                isActive:true
              }
            }
          },
        relations:{
          afiliado:{
            medidorAsociado:{
              planillas:{
                lecturas:true
              }
            },
            descuentos:true
          }
        }}
        )
        console.log('descuentos',perfilDescuentos);
        if(perfilDescuentos?.afiliado){
        console.log('LOS DESCUENTOS',perfilDescuentos.afiliado.descuentos);
        const consumoTotal=(reg.lectura-lect.planilla.medidor.lecturaSeguimiento);
          let totalDescuentos=0;
          perfilDescuentos.afiliado.descuentos.forEach(des=>{
            totalDescuentos=totalDescuentos+des.descuento
          })
          console.log('TIENE DESCUENTO :D');
          //EL MONTO CALCULADO ORIGINALMENTE
          const montoOriginal= consumoTotal>tarifarioVigente.lecturaMinima?tarifarioVigente.tarifaMinima +((consumoTotal-tarifarioVigente.lecturaMinima)*tarifarioVigente.tarifaAdicional):tarifarioVigente.tarifaMinima;
          const descontado = (montoOriginal*totalDescuentos)/100;
          const montoCalculado= montoOriginal-descontado;
          const predt = await queryRunner.manager.preload(PlanillaMesLectura,{
            id:reg.id,  
            consumoTotal,
            estadoMedidor:reg.estadoMedidor,
            lectura:reg.lectura,
            medicion:reg.medicion,
            registrado:true,
          });
          lecturas.push(predt);
          const comp = this.comprobantePorPagarService.create({
            monto:montoCalculado,
            metodoRegistro:'GENERADO POR LA CAJA',
            // consumoTotal>this.LECTURA_MINIMA?this.TARIFA_MINIMA +((consumoTotal-this.LECTURA_MINIMA)*this.COSTO_ADICIONAL):this.TARIFA_MINIMA,
            motivo: `PAGO DE SERVICIO DE AGUA POTABLE`,
            moneda: tarifarioVigente.moneda,
            pagado:false,
            fechaLimitePago: new Date(fechaLecturas.getFullYear(),fechaLecturas.getMonth(),tarifarioVigente.diaLimitePago),
            lectura:predt,
            estadoComprobate:'SIN PAGAR',
            descuentos:perfilDescuentos.afiliado.descuentos.map(res=>{
              return queryRunner.manager.create(DescuentosAplicadosPorPagar,{
                tipoDescuentoBeneficiario:res.tipoBeneficiario,
                descuento:res.descuento,
                detalles:res.detalles,
              })
            }),
            tarifaConsumoCalculo:tarifarioVigente
          })
          medidor.lecturaSeguimiento=(medidor.lecturaSeguimiento+consumoTotal);
          medidor.medidor.lecturaMedidor=(medidor.lecturaSeguimiento+consumoTotal);
          await queryRunner.manager.save(medidor.medidor);
          await queryRunner.manager.save(medidor);
          await queryRunner.manager.save(comp);
        
      }else{
          console.log('SIN DESCUENTO :(((');
          const consumoTotal=(reg.lectura-lect.planilla.medidor.lecturaSeguimiento);
          
          const monto=consumoTotal>tarifarioVigente.lecturaMinima?tarifarioVigente.tarifaMinima +((consumoTotal-tarifarioVigente.lecturaMinima)*tarifarioVigente.tarifaAdicional):tarifarioVigente.tarifaMinima;
          const predt = await queryRunner.manager.preload(PlanillaMesLectura,{
            id:reg.id,  
            consumoTotal,
            estadoMedidor:reg.estadoMedidor,
            lectura:reg.lectura,
            medicion:reg.medicion,
            registrado:true,
            
          });
          lecturas.push(predt);
          const comp = this.comprobantePorPagarService.create({
            monto,
            metodoRegistro:'GENERADO POR LA CAJA',
            // consumoTotal>this.LECTURA_MINIMA?this.TARIFA_MINIMA +((consumoTotal-this.LECTURA_MINIMA)*this.COSTO_ADICIONAL):this.TARIFA_MINIMA,
            motivo: `PAGO DE SERVICIO DE AGUA POTABLE`,
            moneda: tarifarioVigente.moneda,
            pagado:false,
            fechaLimitePago: new Date(fechaLecturas.getFullYear(),fechaLecturas.getMonth(),tarifarioVigente.diaLimitePago),
            lectura:predt,
            estadoComprobate:'SIN PAGAR',
            tarifaConsumoCalculo:tarifarioVigente
            
          })
          medidor.lecturaSeguimiento=(medidor.lecturaSeguimiento+consumoTotal);
          medidor.medidor.lecturaMedidor=(medidor.lecturaSeguimiento+consumoTotal);
          await queryRunner.manager.save(medidor.medidor)
          await queryRunner.manager.save(medidor)
          await queryRunner.manager.save(comp);
        }
        
      }
    }
    try {
      await queryRunner.manager.save(lecturas);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        message: 'lecturas guardadas!',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
  async AllLecturasPerfilesMedidores(query: QueryLecturasDto) {
    const fechaLecturas = new Date();
    let gestion = fechaLecturas.getFullYear();
    let index = fechaLecturas.getMonth()-1;
    let mes = new Date(gestion,fechaLecturas.getMonth()-1).toLocaleString('default', { month: 'long' }).toUpperCase();
    if(fechaLecturas.getMonth() === 0){
      gestion = fechaLecturas.getFullYear()-1;
      mes = new Date(gestion,11).toLocaleString('default', { month: 'long' }).toUpperCase();
      index = 11;
    }
    
    const mesSegumiento = await this.mesSeguimientoRegistroLecturaRepository.findOne({
      where:{mes:
        index===0?Mes.enero
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
        :Mes.enero,
        anioSeguimiento:{anio:gestion}},
      relations:{anioSeguimiento:true,}
    })
    
    if(!mesSegumiento)throw new BadRequestException(`Gestion: ${gestion}, mes: ${mes} aun no generados`);
    if(mesSegumiento.fechaRegistroLecturas.getTime()<fechaLecturas.getTime()){
      if(mesSegumiento.fechaFinRegistroLecturas.getTime()<fechaLecturas.getTime()){
        throw new BadRequestException(`Fecha de registro de lecturas del mes ${mes}, gestion: ${gestion} finalizadas ${mesSegumiento.fechaFinRegistroLecturas}`)
      }
    }else{
      throw new BadRequestException(`Los registros de lectura se podran registrar a la fecha ${mesSegumiento.fechaRegistroLecturas}`)
    }
    const {
      // gestion = new Date().getFullYear(),
      barrio,
      manzano,
      limit=50,
      offset=0,
      sort='id',
      order='ASC',
      q=''
      // mes = Mes.enero,
    } = query;
    // console.log(gestion, barrio, mes);
    let arg =[''];
    if(q.length>0){
      arg =q.toLocaleLowerCase().split(/\s/).filter(val=>val.length>0);
    }
    if(arg.length===0) arg=[''];
    
    console.log(query);
    const finders:FindOptionsWhere<Perfil>[] = [];
    for(const data of arg){
      finders.push(
        //BARRIO EN AFILIACION
        { nombrePrimero:   ILike(`%${data}%`),isActive:true,afiliado:{ubicacion:{barrio,manzano},isActive:true,medidorAsociado:{isActive:true,registrable:true,medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        { nombreSegundo:   ILike(`%${data}%`),isActive:true,afiliado:{ubicacion:{barrio,manzano},isActive:true,medidorAsociado:{isActive:true,registrable:true,medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        { apellidoPrimero: ILike(`%${data}%`),isActive:true,afiliado:{ubicacion:{barrio,manzano},isActive:true,medidorAsociado:{isActive:true,registrable:true,medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        { apellidoSegundo: ILike(`%${data}%`),isActive:true,afiliado:{ubicacion:{barrio,manzano},isActive:true,medidorAsociado:{isActive:true,registrable:true,medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        { CI:              ILike(`%${data}%`),isActive:true,afiliado:{ubicacion:{barrio,manzano},isActive:true,medidorAsociado:{isActive:true,registrable:true,medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        {                                     isActive:true,afiliado:{ubicacion:{barrio,manzano},isActive:true,medidorAsociado:{isActive:true,registrable:true,medidor:{isActive:true,nroMedidor:ILike(`%${data}%`)},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}}},
        //BARRIO EN MEDIDOR ASOCIADO
        { nombrePrimero:   ILike(`%${data}%`),isActive:true,afiliado:{                           isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        { nombreSegundo:   ILike(`%${data}%`),isActive:true,afiliado:{                           isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        { apellidoPrimero: ILike(`%${data}%`),isActive:true,afiliado:{                           isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        { apellidoSegundo: ILike(`%${data}%`),isActive:true,afiliado:{                           isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        { CI:              ILike(`%${data}%`),isActive:true,afiliado:{                           isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        {                                     isActive:true,afiliado:{                           isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{nroMedidor:ILike(`%${data}%`),isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}}},
        // //POR MANZANO
        // { nombrePrimero:   ILike(`%${data}%`),isActive:true,afiliado:{isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        // { nombreSegundo:   ILike(`%${data}%`),isActive:true,afiliado:{isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        // { apellidoPrimero: ILike(`%${data}%`),isActive:true,afiliado:{isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        // { apellidoSegundo: ILike(`%${data}%`),isActive:true,afiliado:{isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        // { CI:              ILike(`%${data}%`),isActive:true,afiliado:{isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{barrio,manzano},medidor:{isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}} },
        // { isActive:true,afiliado:{isActive:true,medidorAsociado:{isActive:true,registrable:true,ubicacion:{manzano},medidor:{nroMedidor:ILike(`%${data}%`),isActive:true},planillas:{gestion,registrable:true,lecturas:{registrable:true,isActive:true,registrado:false,PlanillaMesLecturar:mesSegumiento.mes}}}}},
      
      )
    }
    
    let orderOption:FindOptionsOrder<Perfil>={id:order};
    if((sort!== null || sort !==undefined) && sort !=='id'){
      if(sort==='nombres') orderOption={nombrePrimero:order};
      if(sort ==='apellidos') orderOption={apellidoPrimero:order}
      else if (sort ==='ci') orderOption={CI:order};
      else if (sort ==='estado') orderOption={estado:order};
    }
    const {"0":data,"1":size} = await this.perfilRepository.findAndCount({
      where:finders,
      relations:{
        afiliado:{medidorAsociado:{medidor:true,planillas:{lecturas:true}}}
      },
      select:{
        id:true,isActive:true,estado:true,apellidoPrimero:true,apellidoSegundo:true,nombrePrimero:true,nombreSegundo:true,CI:true,
        afiliado:{id:true,isActive:true,estado:true,ubicacion:{manzano:true,numeroManzano:true,nroLote:true,barrio:true,numeroVivienda:true,},
          medidorAsociado:{
            id:true,isActive:true,estado:true,lecturaSeguimiento:true,ubicacion:{manzano:true,numeroManzano:true,nroLote:true,barrio:true,numeroVivienda:true},registrable:true,
            planillas:{
              id:true,isActive:true,estado:true,registrable:true,gestion:true,
              lecturas:{
                id:true,registrado:true,registrable:true,PlanillaMesLecturar:true,medicion:true,
                lectura:true,isActive:true,estadoMedidor:true,estado:true,consumoTotal:true,
              }
            }
          }}
      },
      take: limit,
      skip: offset,
      order: orderOption,
    })
    return {
      OK: true,
      message: `REGISTRO DE LECTURAS DE MEDIDORES DEL mes ${mes}, gestion: ${gestion}`,
      data: {
        // datita:data,
        data,size,
        limit,
        offset,
        // data,size
      },
    };
    
  }
  // private readonly TARIFA_MINIMA = 10;
  // private readonly LECTURA_MINIMA = 10;
  // private readonly COSTO_ADICIONAL = 2;
  // async generarTarfiasPorPagar(createTarifaPorPagarDto:CreateTarifaPorPagarDto){
  //   const {lecturas} =createTarifaPorPagarDto;
  //   const lecturasCreate:PlanillaMesLectura[]=[];
  //   for(const lct of lecturas){
  //     const dc = await this.planillaMesLecturasRepository.findOne({
  //       where:{id:lct.id,isActive:true,registrado:true}
  //     })
  //     if(dc) lecturasCreate.push(dc);
  //   }
  //   if(lecturasCreate.length===0) throw new NotFoundException(`SIN PLANILLAS POR GENERAR`);
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
    
  //   try {
  //   for(const lectu of lecturasCreate){
  //     const comp = queryRunner.manager.create(ComprobantePorPago,{
  //       lectura:lectu,
  //       metodoRegistro:'GENERADO POR LA CAJA',
  //       monto:lectu.consumoTotal >this.LECTURA_MINIMA
  //               ? this.TARIFA_MINIMA +(lectu.consumoTotal -this.LECTURA_MINIMA) *this.COSTO_ADICIONAL
  //               : this.TARIFA_MINIMA,
  //       motivo: `PAGO DE SERVICIO DE AGUA POTABLE`,
  //       moneda: Monedas.Bs,
        
  //     })
  //     console.log('lectura',lectu);
  //     console.log('comprobante',comp);
  //       await queryRunner.manager.save(comp);
  //       await queryRunner.manager.update(PlanillaMesLectura,lectu.id,{tarifaGenerada:true});
  //       // comprobantesGenerados.push(comp);

  //     }
  //     await queryRunner.commitTransaction();
  //     return {
  //       OK:true,
  //       message:'Comprobantes por pagar creados con exito',
  //     };
  //   } catch (error) {
  //     this.logger.error('error al registrar un comprobante',error);
  //     await queryRunner.rollbackTransaction();
  //     this.commonService.handbleDbErrors(error);
  //   } finally{
  //     await queryRunner.release();
  //   }
    
  // }
  // async afiliadosPorGenerarComprobantes(paginationDto: PaginationDto){
  //   const {offset=0,limit=10} = paginationDto;
  //   const fechaLecturas = new Date();
  //   let gestion = fechaLecturas.getFullYear();
  //   let index = fechaLecturas.getMonth()-1;
  //   let mes = new Date(gestion,fechaLecturas.getMonth()-1).toLocaleString('default', { month: 'long' }).toUpperCase();
  //   if(fechaLecturas.getMonth() === 0){
  //     gestion = fechaLecturas.getFullYear()-1;
  //     mes = new Date(gestion,11).toLocaleString('default', { month: 'long' }).toUpperCase();
  //     index = 11;
  //   }
  //   const {"0":data,"1":size} = await this.perfilRepository.findAndCount({
  //     where:{afiliado:{medidorAsociado:{planillas:{lecturas:{tarifaGenerada:false,isActive:true},isActive:true,registrable:true},isActive:true,registrable:true,},isActive:true},isActive:true}
  //     ,relations:{afiliado:{medidorAsociado:{medidor:true,planillas:{lecturas:true}}}},
  //     select:{
  //       apellidoPrimero:true,apellidoSegundo:true,nombrePrimero:true,nombreSegundo:true,CI:true,id:true,isActive:true,estado:true,
  //       afiliado:{id:true,isActive:true,
  //         medidorAsociado:{ id:true,isActive:true,
  //           medidor:{id:true,isActive:true,nroMedidor:true},planillas:{id:true,isActive:true,gestion:true,
  //         lecturas:{lectura:true,tarifaGenerada:true,consumoTotal:true,id:true,isActive:true,updated_at:true,PlanillaMesLecturar:true,}}}}
  //     },
  //     skip:offset,
  //     take:limit,
  //     order:{
  //       afiliado:{
  //         medidorAsociado:{
  //           planillas:{
  //             lecturas:{
  //               updated_at:'ASC'
  //             }
  //           }
  //         }
  //       }
  //     }
  //   })
  //     return {
  //       OK: true,
  //       message: `LISTADO DE LOS MEDIDORES DE AFILIADOS SIN GENERACION DE PAGOS DEL MES: ${mes} ${gestion}`,
  //       data:{data,limit,offset,size},
  //     };
  // }
  async getAniosSeguimientos() {
    const data = await this.anioSeguimientoLecturaRepository.find({
      order: { anio: 'DESC', meses: { mes: 'ASC' } },
      relations: { meses: true },
      select:{anio:true,meses:{mes:true},}
    });

    return {
      OK:true,
      message:'años de registros de lecturas',
      data
    };
  }
  async getPlanillasMedidorAsociado(idAsociado:number){
    // const medidor = await this.medidorRepository.findOne({where:{id:idMedidor,planillas:{isActive:true}},relations:{planillas:true},select:{nroMedidor:true,planillas:{gestion:true,id:true}}});
    const qb = this.dataSource.getRepository(MedidorAsociado).createQueryBuilder('asociado')
    const medidor = await qb
                          .select(['asociado.id','asociado.estadoMedidorAsociado','asociado.isActive',
                                    'medidor.nroMedidor','medidor.id','medidor.isActive',
                                    'planillas.id','planillas.isActive','planillas.estado','planillas.gestion'])
                          .innerJoinAndSelect('asociado.medidor','medidor','medidor.id = asociado.medidorId')
                          .leftJoinAndSelect('asociado.planillas','planillas','planillas.medidorId = asociado.id')
                          .where('asociado.id = :idAsociado',{idAsociado})
                          // .select(['planillas.id','planillas.gestion'])
                          
                          .getOne();
    //console.log(medidor);
    if(!medidor) throw new BadRequestException(`Medidor de agua asociado width id ${idAsociado} not found`);
    if(!medidor.isActive) throw new BadRequestException(`El medidor no se encuentra disponible`);
    const {id,medidor:{nroMedidor},planillas,estadoMedidorAsociado,estado,isActive} = medidor;
    // console.log(medidor);
    return {
      OK:true,
      message:'planillas encontrado',
      data:{id,medidor:{nroMedidor},estado,estadoMedidorAsociado,isActive,planillas},
    }
  }
  async getMesesSeguimientos(query: QueryLecturasDto){
    const {gestion=new Date().getFullYear(),} = query;
    const seg = await this.anioSeguimientoLecturaRepository.findOne({where:{anio:gestion},relations:{meses:true},select:{anio:true,id:true,isActive:true,meses:{mes:true,id:true,fechaFinRegistroLecturas:true,fechaRegistroLecturas:true}},order:{meses:{id:{direction:'ASC'}}}});
    if(!seg) throw new BadRequestException(`Año ${gestion} no registrado`);
    if(!seg.isActive) throw new BadRequestException(`Año ${gestion} no disponible`);
    return {
      OK:false,
      message:`Lista de meses registrados del año ${gestion}`,
      data:seg
    }
  }
  async getPlanillasRegisters(query: QueryLecturasDto){
    const {gestion=new Date().getFullYear(),mes = Mes.enero,barrio = Barrio._20DeMarzo,} = query;
    // console.log(gestion, barrio, mes);
    const qb = this.perfilRepository.createQueryBuilder('perfiles');
    const { '0': data, '1': size } = await qb

      .innerJoinAndSelect(
        'perfiles.afiliado',
        'afiliado',
        'afiliado."perfilId" = perfiles.id',
      )
      .innerJoinAndSelect(
        'afiliado.medidorAsociado',
        'medidor_asociado',
        'medidor_asociado."afiliadoId" = afiliado.id AND medidor_asociado."ubicacionBarrio" = :barrio',
        {barrio}
      ).innerJoinAndSelect(
        'medidor_asociado.medidor',
        'medidor',
        'medidor.id = medidor_asociado.id AND medidor.isActive = true'
      )
      .innerJoinAndSelect(
        'medidor_asociado.planillas',
        'planilla',
        'planilla."medidorId" = medidor.id AND planilla.isActive = true',
      )
      .leftJoinAndSelect(
        'planilla.lecturas',
        'lecturas',
        'lecturas.PlanillaMesLecturar = :mes',
        { mes },
      )
      //.select([''])
      .where('planilla.gestion =:gestion', { gestion })
      //.andWhere('perfiles.isActive = true',{})
      // .andWhere('lecturas.mesLecturado = :mes',{mes})
      .getManyAndCount();
      return {
        OK: true,
        message: 'listado de perfiles con lecturas mensuales',
        data: {
          data,
          size,
        },
      };
  }
  async lecturasPlanilla(idPlanilla:number){
    const planilla = await this.planillasMedidoresRepository.findOne({where:{id:idPlanilla},relations:{lecturas:true}});
    if(!planilla) throw new BadRequestException(`Planilla de lecturas no encontrada`);
    if(!planilla.isActive) throw new BadRequestException(`La planilla no se encuentra disponible`);
    return{
      OK:true,
      message:'planilla encontrada',
      data:planilla
    }
  }
  async lecturaDetails(idLectura:number){
    const lectura = await this.planillaMesLecturasRepository.findOne(
      {where:{id:idLectura},
      select:{
        consumoTotal:true,created_at:true,estadoMedidor:true,id:true,lectura:true,PlanillaMesLecturar:true,
       // LecturaPorPagar:{created_at:true,estadoComprobate:true,fechaPagada:true,estado:true,metodoRegistro:true,moneda:true,monto:true,motivo:true,pagado:true,
        //comprobante:{created_at:true,entidadPago:true,fechaEmitida:true,id:true,metodoPago:true,montoPagado:true,nroRecibo:true,}}},
      //relations:{LecturaPorPagar:{comprobante:true}}})
      }})
      if(!lectura) throw new BadRequestException(`Lectura no encontrada`);
    return{
      OK:true,
      message:'Lectura encontrada',
      data:lectura,
    }
  }

  //METHODS USER AFILIADO

  async listarMedidores(idUsuario:number){
    const qb =  await this.dataSource.getRepository(MedidorAsociado).find({where:{afiliado:{perfil:{usuario:{id:idUsuario}}}},select:{estado:true,estadoMedidorAsociado:true,fechaInstalacion:true,id:true,isActive:true,lecturaInicial:true,lecturaSeguimiento:true,ubicacion:{barrio:true,latitud:true,longitud:true,numeroVivienda:true},medidor:{nroMedidor:true,id:true,marca:true,}},relations:{medidor:true}});
    return {
      OK:true,
      message:'medidores',
      data:qb
    }
  }


  //* TASK SCHEDULING
  private readonly logger = new Logger(MedidoresService.name);
  //@Cron('45 * * * * *')
  //REGISTRA EL AÑO DE GESTION DE SEGUIMIENTO PARA LAS LECTURAS POSTERIORES
  @Cron('0 1 1 1 *') //At 01:00 AM, on day 1 of the month, only in January
  private async registrarAnioSeguimiento(){
    
    const yearAct = new Date().getFullYear();
    const dateSeguimiento= await this.anioSeguimientoLecturaRepository.findOneBy({anio:yearAct});
    if(dateSeguimiento){
      this.logger.error(`Year ${yearAct} exist!`)
    }else{
      const date = this.anioSeguimientoLecturaRepository.create({anio:yearAct});
      await this.anioSeguimientoLecturaRepository.save(date);
      this.logger.log(`Year ${yearAct} registered!`)
    }
  }
  //REGISTRA LAS PLANILLAS DE GESTION DE LOS MEDIDORES DE AGUA ASOCIADOS
  //@Cron('15 * * * * *')
  @Cron('30 1 1 1 *') //At 01:30 AM, on day 1 of the month, only in January
  private async registrarPlanillasDeMedidores(){
    const yearAct = new Date().getFullYear();
    const dateSeguimiento= await this.anioSeguimientoLecturaRepository.findOneBy({anio:yearAct});
    if(dateSeguimiento){
      const afiliados = await this.dataSource.getRepository(Afiliado).find({where:{isActive:true,medidorAsociado:{isActive:true,registrable:true,}},relations:{medidorAsociado:{medidor:true,}}});
      //this.logger.verbose(afiliados,'papitas :3');
      for(const afiliado of afiliados){
        for(const medidor of afiliado.medidorAsociado){
          const planillaExist = await this.planillasMedidoresRepository.findOneBy({gestion:yearAct});
          if(planillaExist){
            this.logger.warn(`Planilla ${yearAct} del medidor asociado${medidor.medidor.nroMedidor} ya existe`);
          }else{
            const planilla = this.planillasMedidoresRepository.create({gestion:yearAct});
            try {
              await this.planillasMedidoresRepository.save(planilla);
              this.logger.log(`Planilla ${yearAct} del medidor ${medidor.medidor.nroMedidor} creada!!`);
            } catch (error) {
              this.logger.warn('OCURRIO UN ERROR AL REGISTRAR');
              this.logger.warn(error);
            }
          }
        }
      }
    }else{

      this.logger.error(`Year ${yearAct} no registered!`)
    }
  }
  //REGISTRA MES SEGUIMIENTO PARA EL PERIODO DEL MES DE REGISTRO DE LECTURAS
  // @Cron('10 * * * * *')
  @Cron('0 2 1 * *') //At 02:00 AM, on day 1 of the month
  private async registrarMesSeguimiento(){
    
    const fechaActual = new Date()
    let gestion = fechaActual.getFullYear();
    let index=fechaActual.getMonth()-1;
    if(fechaActual.getMonth()===0){
      gestion = fechaActual.getFullYear()-1;
      index=11;
    }
    const month = new Date(gestion,index).toLocaleString('default', { month: 'long' }).toUpperCase();
    
    this.logger.debug(month);
    const qr = this.mesSeguimientoRegistroLecturaRepository.createQueryBuilder('mes');
    const mes = await qr
    .innerJoin('mes.anioSeguimiento','anio','anio.anio = :year',{year:gestion})
    .where('mes.mes = :mes',{mes:month})
    .getOne();
    if(mes){
      this.logger.warn(`MES ${month} del año ${gestion} ya registrado`);
    }else{
      const year = await this.anioSeguimientoLecturaRepository.findOneBy({anio:gestion});
      const mesSeg = this.mesSeguimientoRegistroLecturaRepository.create({mes:
       index===0?Mes.enero
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
      :Mes.enero,
    anioSeguimiento:year,
  fechaRegistroLecturas:new Date(fechaActual.getFullYear(),fechaActual.getMonth(),1,8,0),
  fechaFinRegistroLecturas:new Date(fechaActual.getFullYear(),fechaActual.getMonth(),20,23,59,59)},
      )
      try {
        await this.mesSeguimientoRegistroLecturaRepository.save(mesSeg)
        this.logger.log(`Mes ${month} de seguimiento creado con exito`)
      } catch (error) {
        this.logger.warn('OCURRIO UN ERROR AL REGISTRAR');
        this.logger.warn(error);
      }
    }
  }
  //REGISTRA LAS PLANILLAS DE LECTURAS DE CADA GESTION DEL PRESENTE AÑO
  //SI  NOSE SE REGISTRA LA LECTURA DEL MES ESTABLECIDO POSTERIORMENTE SERA ELIMINADO (LOGICO)
  @Cron('30 2 1 * *') //At 02:30 AM, on day 1 of the month
  private async registerPlanillaMesGestion(){

    const dataSeguimiento = await this.anioSeguimientoLecturaRepository.find(
      {
        order:{
          anio:'DESC',
          meses:{
            id:'DESC'
          }
        },
        relations:{
          meses:true
        },
      },
    )
    if(dataSeguimiento.length===0) this.logger.warn(`NO EXISTEN SEGUIMIENTOS DE GESTIONES EN LA DB`);
    else{
      const planillasMedidoresAsociados = await this.planillasMedidoresRepository.find({
        where:{
          gestion:dataSeguimiento[0].anio,
          isActive:true,registrable:true,
        },
        relations:{
          lecturas:true,
          medidor:true
        },
      });
      if(planillasMedidoresAsociados.length===0) this.logger.warn(`SIN PLANILLAS DE GESTIONES DE LECTURAS PARA MEDIDORES DE AGUA`);
      else{
        const planillasLecturas:PlanillaMesLectura[]=[];
        for(const planilla of planillasMedidoresAsociados){
          if(planilla.lecturas.find(lect=>lect.PlanillaMesLecturar === dataSeguimiento[0].meses[0].mes)){
            this.logger.warn(`LA ASOCIACION ${planilla.medidor.id} CON LA PLANILLA DE GESTION ${planilla.gestion} YA TIENE EL MES ${dataSeguimiento[0].meses[0].mes} REGISTRADO`);
            continue;
          }else{
            const mesPorLecturar = this.planillaMesLecturasRepository.create({
              PlanillaMesLecturar:dataSeguimiento[0].meses[0].mes,
              planilla,
              registrable:true,
              registrado:false,
            });
            planillasLecturas.push(mesPorLecturar);
          }
        }
        await this.planillaMesLecturasRepository.save(planillasLecturas)
      }
    }
  }
  //REMUEVE LAS LECTURAS GENERADAS DE PLANILLAS LECTURAS QUE NO HAYAN 
  //SIDO REGISTRADAS DURANTE EL PERIODO DE TIEMPO PARA REGISTRAR LECTURA DEL MEDIDOR DEL MES
  @Cron('0 23 28 * *') //At 23:00 PM, on day 28 of the month
  private async removePlanillasMesGestonNoRegistradas(){ 
    const lecturas = await this.planillaMesLecturasRepository.find({
      where:{
        registrado:false,
        
      },
    });
    for(const lectura of lecturas){
        try {
        await this.planillaMesLecturasRepository.update(lectura.id,{
          isActive:false,
          estado:Estado.DESHABILITADO,
        })
      } catch (error) {
        this.logger.warn(`ERROR GENERADO EN LA FUNCION`, this.removePlanillasMesGestonNoRegistradas.name);
      }}

  }
  async limiteTiempoRegistrosLecturas(){
    const fechaActual = new Date()
    let gestion = fechaActual.getFullYear();
    let index=fechaActual.getMonth()-1;
    if(fechaActual.getMonth()===0){
      gestion = fechaActual.getFullYear()-1;
      index=11;
    }
    const month = new Date(gestion,index).toLocaleString('default', { month: 'long' }).toUpperCase();
    
    const limites = await this.anioSeguimientoLecturaRepository.findOne({
      where:{
        anio:gestion,
        meses:{
          mes:
          index===0?Mes.enero
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
          :Mes.enero,
        }
      },
      relations:{meses:true}
    })
    if(!limites) throw new NotFoundException(`NO EXISTE EL MES DE REGISTRO PASADO O EL AÑO`);
    return {
      OK:true,
      message:'FECHAS LIMITES',
      data:limites
    }
  }
  // ASOCIACIONES DE MEDIDORES

  async getAsociacionesMedidor(idMedidor:number){
    const asociados = await this.dataSource.getRepository(MedidorAsociado).find({
      where:{ medidor:{id:idMedidor}},
      select:{
        id:true,estado:true,estadoMedidorAsociado:true,isActive:true,
      },
    })
    return {
      OK:true,
      message:'asociaciones del medidor de agua',
      data:asociados
    }
  }

  async getAsociacionDetails(idAsociacion:number){
    const asociacion = await this.dataSource.getRepository(MedidorAsociado).findOne({
      where:{id:idAsociacion},
      select:{
        id:true,estado:true,estadoMedidorAsociado:true,fechaInstalacion:true,isActive:true,lecturaInicial:true,lecturaSeguimiento:true,ubicacion:{barrio:true,latitud:true,longitud:true,numeroVivienda:true},
        afiliado:{id:true,isActive:true,estado:true,
          perfil:{
            nombrePrimero:true,nombreSegundo:true,estado:true,apellidoPrimero:true,apellidoSegundo:true,CI:true,id:true,isActive:true,contacto:true,defaultClientImage:true,profileImageUri:true,urlImage:true,
          }
        },
        medidor:{id:true,estado:true,nroMedidor:true,medicion:true},
        multasAsociadas:{id:true,isActive:true,pagado:true,estado:true,moneda:true,monto:true,motivo:true}
      },
      relations:{multasAsociadas:true,afiliado:{perfil:true},medidor:true }
    })
    if(!asociacion) throw new NotFoundException(`Asociacion con id ${idAsociacion} no encontrada`);

    return {
      OK:true,
      message:'Datos de asociacion',
      data:asociacion
    }
  }


  async exportMedidorAsociadosListFilter(){
    //FILTERS

    const dataSeguimiento = await this.anioSeguimientoLecturaRepository.find(
      {
        order:{
          anio:'DESC',
          meses:{
            id:'DESC'
          }
        },
        relations:{
          meses:true
        },
        take:1
      },
    )
    if(dataSeguimiento.length===0)throw new BadRequestException(`NO SE ENCUENTRA LA GESTION ACTUAL DE REGISTRO`);
    
      const asociados = await this.dataSource.getRepository(MedidorAsociado).find({
        where:{
          registrable:true,
          isActive:true,
          planillas:{
            gestion:dataSeguimiento[0].anio,
            registrable:true,
            isActive:true,
            lecturas:{
              PlanillaMesLecturar:dataSeguimiento[0].meses[0].mes,
              registrable:true,
              registrado:false,
              isActive:true
            }
          }
        },
        select:{
          id:true,isActive:true,estado:true,estadoMedidorAsociado:true,lecturaSeguimiento:true,
          afiliado:{id:true,estado:true,isActive:true,ubicacion:{barrio:true,manzano:true,nroLote:true,numeroManzano:true,},
          perfil:{id:true,estado:true,isActive:true,apellidoPrimero:true,apellidoSegundo:true,nombrePrimero:true,nombreSegundo:true,CI:true,contacto:true,},},
          medidor:{id:true,nroMedidor:true,lecturaMedidor:true,medicion:true,},
          planillas:{id:true,isActive:true,gestion:true,lecturas:{
            id:true,isActive:true,PlanillaMesLecturar:true,registrado:true,registrable:true,
          }}
        },
        relations:{
          afiliado:{
            perfil:true
          },
          planillas:{
            lecturas:true
          },
          medidor:true
        },
        order:{
          id:'ASC',
        }
      })
    return {
      OK:true,
      message:'Medidres asociadios para exportar',
      data:asociados
    }
  }
  async findAllManzanos(){
      const tipos:string[]=[];
      const perfiles = await this.perfilRepository.find({
        where:{isActive:true,afiliado:{isActive:true,medidorAsociado:{isActive:true}}},
        relations:{
          afiliado:{medidorAsociado:true}
        }
      })
      for(const perfil of perfiles){
        if(!tipos.includes(perfil.afiliado!.ubicacion!.manzano!)){
          tipos.push(perfil.afiliado!.ubicacion!.manzano!);
        }
        for(const asc of perfil!.afiliado!.medidorAsociado!)
        if(!tipos.includes(asc!.ubicacion!.manzano!)){
          tipos.push(asc.ubicacion!.manzano!);
        }
      }
      return {
        OK:true,
        message:'todos los manzanos',
        data:tipos.map(manzano=>{
        return{
          name:manzano.toUpperCase(),
          value:manzano 
        }
      })};
    }
  
}
