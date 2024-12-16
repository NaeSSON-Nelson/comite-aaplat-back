import { Afiliado } from 'src/auth/modules/usuarios/entities';
import { ColumnsAlways, Ubicacion } from 'src/common/inherints-db';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { MultaServicio } from 'src/pagos-de-servicio/entities';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { HistorialConexiones } from './historial-cortes.entity';
import { EstadoAsociacion } from 'src/interfaces/enum/enum-entityes';


@Entity('medidor_asociado')
export class MedidorAsociado extends ColumnsAlways {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'lectura_inicial',
    type: 'integer',
    nullable: false,
  })
  lecturaInicial: number;
  @Column({
    name: 'fecha_instalacion',
    type: 'text',
    nullable: false,
  })
  fechaInstalacion: Date;
  
  @Column({
    name: 'estado_medidor_asociado',
    type: 'enum',
    enum:EstadoAsociacion,
    default:EstadoAsociacion.conectado
  })
  estadoMedidorAsociado:EstadoAsociacion;
  @Column(() => Ubicacion)
  ubicacion: Ubicacion;
  @Column({
    name: 'lectura_seguimiento',
    type: 'integer',
    nullable:false,
  })
  lecturaSeguimiento: number;
  @Column({ //PARA REALIZAR EL CORTE DE SERVICIO
    type:'bool',
    default:false,
  })
  corte:boolean;
  @Column({
    type:'text',
    default:null,
  })
  motivoTipoConexion:string;

  @Column({ // PARA SOLICITAR RECONECCIÓN DE SERVICIO
    type:'bool',
    default:false,
  })
  reconexion:boolean;
  @Column({
    type:'bool',
    default:true,
    nullable:false,
  })
  registrable:boolean;
  @OneToMany(() => PlanillaLecturas, (planillaLecturas) => planillaLecturas.medidor)
  planillas: PlanillaLecturas[];
  @ManyToOne(()=>Afiliado,(afiliado)=>afiliado.medidorAsociado,{nullable:false})
  afiliado:Afiliado;
  @ManyToOne(()=>Medidor,(medidor)=>medidor.medidorAsociado,{nullable:false})
  medidor:Medidor;
  @OneToMany(() => MultaServicio, (multas) => multas.medidorAsociado)
  multasAsociadas:MultaServicio [];

  @OneToMany(()=>HistorialConexiones,(conexiones)=>conexiones.asociacion)
  historial:HistorialConexiones[]
}
