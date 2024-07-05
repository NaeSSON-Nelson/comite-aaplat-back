import { Afiliado } from 'src/auth/modules/usuarios/entities';
import { ColumnsAlways, Ubicacion } from 'src/common/inherints-db';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Medidor } from './medidor.entity';
import { PlanillaLecturas } from './planilla-lecturas.entity';

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
    type: 'text',
    nullable: false,
  })
  estadoMedidorAsociado:string;
  @Column(() => Ubicacion)
  ubicacion: Ubicacion;
  @Column({
    name: 'lectura_seguimiento',
    type: 'integer',
    nullable:false,
  })
  lecturaSeguimiento: number;

  @Column({
    type:'bool',
    default:true,
    nullable:false,
  })
  registrable:boolean;
  @OneToMany(() => PlanillaLecturas, (planillaLecturas) => planillaLecturas.medidor)
  planillas: PlanillaLecturas[];
  @ManyToOne(()=>Afiliado,(afiliado)=>afiliado.medidorAsociado)
  afiliado:Afiliado;
  @ManyToOne(()=>Medidor,(medidor)=>medidor.medidorAsociado)
  medidor:Medidor;
}
