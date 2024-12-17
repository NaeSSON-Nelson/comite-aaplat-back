import * as bcrypt from 'bcrypt';
import { Ubicacion } from 'src/common/inherints-db';
import { Barrio, Estado, EstadoAsociacion, Medicion, Mes, Monedas, Nivel, TipoMulta, TipoPerfil } from 'src/interfaces/enum/enum-entityes';
import { ValidItemMenu, ValidMenu, ValidRole } from 'src/interfaces/valid-auth.enum';

class PerfilSeed {
  nombrePrimero: string;
  nombreSegundo?: string;
  apellidoPrimero: string;
  apellidoSegundo?: string;
  CI: string;
  genero: string;
  direccion?: string;
  profesion?: string;
  fechaNacimiento: Date;
  tipoPerfil: TipoPerfil[];
  estado?: Estado;
}
class AfiliadoSeed {
  estado: Estado;
  ubicacion: Ubicacion;
  montoAfiliacion:number;
  monedaAfiliacion:Monedas;
}
class UsuarioSeed {
  username: string;
  password: string;
  correo?: string;
  estado?: Estado;
}
class MenuSeed {
  nombre: string;
  linkMenu: string;
  prioridad:number;
  estado?: Estado;
  items:MenuItemSeed[];
}
class MenuItemSeed {
  nombre:string;
  linkMenu: string;
  estado?: Estado;
  visible:boolean;
}
// class ItemToMenuSeed{
//   itemMenuId:
//   nombre: string;
//   visible?:boolean;
// }
class RoleSeed {
  nombre: string;
  nivel:  Nivel;
  estado?: Estado;
}

class MedidorSeed {
  nroMedidor: string;
  lecturaInicial: number;
  lecturaMedidor: number;
  estado?: Estado;
  marca: string;
  medicion:Medicion;
}
class MedidorAsociadoSeed{
  fechaInstalacion: Date;
  estadoMedidorAsociado:EstadoAsociacion;
  ubicacion:Ubicacion;
  
}
class PlanillaLecturasSeed{
  gestion:number;
}
class PlanillaMesLecturarSeed{
  lectura:number;
  estadoMedidor?:string;
  mesLecturado:Mes;
  planilla:PlanillaLecturasSeed;
}
class AnioSeguimientoLecturaSeed{
  anio:number;
}
class MesSeguimientoRegistroLectura{
  mes:Mes;
  fechaRegistroLecturas:Date;
  fechaFinRegistroLecturas:Date;
}
class TarifaConsumoAguaSeed{
  tarifaMinima:number;
  lecturaMinima:number;
  tarifaAdicional:number;
  diaLimitePago:number;
  moneda:Monedas;
  vigencia:Date;
}
class TarifaMultasPorRetrasoSeed{
  monto:number;
  moneda:Monedas;
  mesesDemora:number;
  vigencia:Date;
  tipoMulta:TipoMulta;
}
class beneficiariosDecuentosSeed{
  tipoBeneficiario:string;
  descuento:number;
  detalles?:string;
}
class SeedData {
  perfiles: PerfilSeed[];
  afiliados: AfiliadoSeed[];
  menus: MenuSeed[];
  // itemsMenu: MenuItemSeed[];
  roles: RoleSeed[];
  usuarios: UsuarioSeed[];
  planillas:PlanillaLecturasSeed[]
  medidores: MedidorSeed[];
  medidoresAsociados:MedidorAsociadoSeed[];
  tarifaConsumoAgua:TarifaConsumoAguaSeed[];
  tarifaMultasPorRetraso:TarifaMultasPorRetrasoSeed[];
  benficiarios:beneficiariosDecuentosSeed[]
  // aniosSeguimiento: AnioSeguimientoLecturaSeed[];
  // mesesSeguimiento: MesSeguimientoRegistroLectura[];
}
const formatDate = (date) =>
  [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/');

const padTo2Digits = (num) => num.toString().padStart(2, '0');

export const initialData: SeedData = {
  perfiles: [
    {
      nombrePrimero: 'Juan',
      nombreSegundo: 'Carlos',
      apellidoPrimero: 'Serrano',
      apellidoSegundo: 'Galarza',
      CI: '5425762',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1995, 2, 24),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.administrativo,TipoPerfil.usuario,TipoPerfil.administrativo],
    },
    {
      nombrePrimero: 'Arturo',
      apellidoPrimero: 'Ortega',
      apellidoSegundo: 'Nogales',
      CI: '45824111',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1987, 8, 10),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario],
    },
    {
      nombrePrimero: 'Franz',
      apellidoPrimero: 'Mamani',
      apellidoSegundo: 'Machaca',
      CI: '65842174',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1990, 6, 10),
      genero: 'MASCULINO',
      profesion: 'Ingenieria Electrica',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario],
    },
    {
      nombrePrimero: 'Francisco',
      apellidoPrimero: 'Colmenares',
      apellidoSegundo:'Yujra',
      CI: '6352478',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1960, 7, 24),
      genero: 'MASCULINO',
      profesion: 'Contaduria',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario],
    },
    {
      nombrePrimero: 'Luis',
      nombreSegundo: 'Rodrigo',
      apellidoPrimero: 'Ventura',
      apellidoSegundo: 'Zacapata',
      CI: '752401254',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1954, 1, 18),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario],
    },
    {
      nombrePrimero: 'Rosa',
      apellidoPrimero: 'Belgrano',
      apellidoSegundo: 'Sanchez',
      CI: '24501247',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1974, 8, 19),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario],
    },
    {
      nombrePrimero: 'Victor',
      apellidoPrimero: 'Soto',
      apellidoSegundo: 'Fernandez',
      CI: '7410005',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1992, 10, 17),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario],
    },
    {
      nombrePrimero: 'Ricardo',
      apellidoPrimero: 'Serrano',
      apellidoSegundo: 'Galarza',
      CI: '85421077',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1990, 4, 5),
      genero: 'MASCULINO',
      profesion: 'Contador',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario],
    },
    {
      nombrePrimero: 'Ricardo',
      nombreSegundo: 'Leonel',
      apellidoPrimero: 'Corazon',
      CI: '885011424',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1992, 8, 8),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario],
    },
    {
      nombrePrimero: 'Ana',
      nombreSegundo: 'Paola',
      apellidoPrimero: 'Ortiz',
      apellidoSegundo: 'Mamani',
      CI: '65201487',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1989, 4, 24),
      genero: 'FEMENINO',
      profesion: 'Doctorado',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario],
    },
    {
      nombrePrimero: 'Ramón',
      apellidoPrimero: 'Quispe',
      apellidoSegundo: 'Ortega',
      CI: '66258001',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1987, 12, 17),
      genero: 'MASCULINO',
      profesion: 'Ingenieria Industrial',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Marina',
      apellidoPrimero: 'Ramos',
      CI: '7002541',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1985, 5, 10),
      genero: 'FEMENINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Reyna',
      nombreSegundo: 'Noemi',
      apellidoPrimero: 'Sanchez',
      apellidoSegundo: 'Vaca',
      CI: '7749001',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1995, 5, 18),
      genero: 'FEMENINO',
      profesion: 'Modelo',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Juan',
      apellidoPrimero: 'Cortez',
      apellidoSegundo: 'Mena',
      CI: '6899504',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1997, 8, 17),
      genero: 'MASCULINO',
      profesion: 'Ingenieria Informatica',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Hector',
      apellidoPrimero: 'Rojas',
      apellidoSegundo: 'Delgado',
      CI: '7895510',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1992, 1, 24),
      genero: 'MASCULINO',
      profesion: 'Doctorado',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Arturo',
      nombreSegundo: 'Marino',
      apellidoPrimero: 'Martinez',
      apellidoSegundo: 'Quispe',
      CI: '45102477',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1992, 5, 18),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Jimena',
      apellidoPrimero: 'Cruz',
      apellidoSegundo: 'Villca',
      CI: '7100245',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1992, 10, 10),
      genero: 'FEMENINO',
      profesion: 'dentista',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Noemi',
      nombreSegundo: 'Elizabeth',
      apellidoPrimero: 'Cruz',
      apellidoSegundo: 'Villca',
      CI: '7100526',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1990, 8, 24),
      genero: 'FEMENINO',
      profesion: 'Ingenieria',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Samuel',
      apellidoPrimero: 'Colque',
      apellidoSegundo: 'Sprella',
      CI: '70114820',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1975, 5, 1),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Ramiro',
      apellidoPrimero: 'Soledad',
      apellidoSegundo: 'Mamani',
      CI: '6600777',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1997, 5, 2),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.usuario],
    },
  ],
  afiliados: [
    {
      ubicacion: { 
        barrio: Barrio._20DeMarzo, 
        numeroVivienda: '270588',
        manzano:'A',
        numeroManzano:1,
        nroLote:1,
      },
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.mendezFortaleza, 
        numeroVivienda: '55804',
        manzano:'A',
        numeroManzano:1,
        nroLote:2,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '99804',
        manzano:'A',
        numeroManzano:1,
        nroLote:3,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.sanAntonio, 
        numeroVivienda: '5405',
        manzano:'A',
        numeroManzano:2,
        nroLote:1,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.verdeOlivo, 
        numeroVivienda: '5408',
        manzano:'A',
        numeroManzano:2,
        nroLote:2,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '6874',
        manzano:'A',
        numeroManzano:2,
        nroLote:3,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    //
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '7848',
        manzano:'B',
        numeroManzano:1,
        nroLote:1,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '9857',
        manzano:'B',
        numeroManzano:1,
        nroLote:2,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '4501',
        manzano:'B',
        numeroManzano:1,
        nroLote:3,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio._20DeMarzo, 
        numeroVivienda: '1047',
        manzano:'B',
        numeroManzano:2,
        nroLote:1,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.mendezFortaleza, 
        numeroVivienda: '2508',
        manzano:'B',
        numeroManzano:2,
        nroLote:2,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.verdeOlivo, 
        numeroVivienda: '2659',
        manzano:'B',
        numeroManzano:2,
        nroLote:3,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '5684',
        manzano:'C',
        numeroManzano:1,
        nroLote:1,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio._20DeMarzo, 
        numeroVivienda: '4700',
        manzano:'C',
        numeroManzano:1,
        nroLote:2,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '8754',
        manzano:'B',
        numeroManzano:1,
        nroLote:3,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.mendezFortaleza, 
        numeroVivienda: '2504',
        manzano:'C',
        numeroManzano:2,
        nroLote:1,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
    {
      ubicacion: { 
        barrio: Barrio.sanAntonio, 
        numeroVivienda: '6678',
        manzano:'C',
        numeroManzano:2,
        nroLote:2,
      },
      estado: Estado.ACTIVO,
      montoAfiliacion:1500,
      monedaAfiliacion:Monedas.Bs,
    },
  ],
  usuarios: [
    {
      username: 'root',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
    {
      username: 'admin',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
    {
      username: 'administrativo',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
    {
      username: 'secretaria',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
    // {
    //   username: 'lecturador',
    //   password: bcrypt.hashSync('123456', 10),
    //   estado: Estado.ACTIVO,
    // },
    {
      username: 'user',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
    {
      username: 'afiliado',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
    {
      username: 'afiliado2',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
  ],
  
  menus: [
    // {
    //   nombre: 'menus',
    //   linkMenu: 'menus',
    //   estado: Estado.ACTIVO,
    // },
    // {
    //   nombre: 'items menus',
    //   linkMenu: 'items-menu',
    //   estado: Estado.ACTIVO,
    // },
    {
      nombre: 'Roles',
      linkMenu: ValidMenu.roles,
      estado: Estado.ACTIVO,
      prioridad:80,
      items:[
        
    //ROLES MENUS

    {
      nombre:'Listar roles',
      linkMenu:ValidItemMenu.rolList,
      visible:true,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Registrar nuevo rol',
      linkMenu:ValidItemMenu.rolRegister,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Mostrar rol',
      linkMenu:ValidItemMenu.rolDetails,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Modificar rol',
      linkMenu:ValidItemMenu.rolUpdate,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Eliminar rol',
      linkMenu:ValidItemMenu.rolUpdateStatus,
      visible:false,
      estado:Estado.ACTIVO
    },
      ]
    },
    {
      nombre: 'Medidores de agua',
      linkMenu: ValidMenu.medidores,
      estado: Estado.ACTIVO,
      prioridad:60,
      items:[
        
    // MENUS DE MEDIDORES DE AGUA
    {
      nombre:'Listar medidores de agua',
      linkMenu:ValidItemMenu.medidorList,
      visible:true,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Registrar nuevo medidor de agua',
      linkMenu:ValidItemMenu.medidorRegister,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Mostrar medidor de agua',
      linkMenu:ValidItemMenu.medidorDetails,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Modificar medidor de agua',
      linkMenu:ValidItemMenu.medidorUpdate,
      visible:false,
      estado:Estado.ACTIVO
    },{
      nombre:'Modificar estado de medidor de agua',
      linkMenu:ValidItemMenu.medidorUpdateStatus,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Historial de asociaciones',
      linkMenu:ValidItemMenu.medidorHistorialAsociaciones,
      visible:false,
      estado:Estado.ACTIVO
    },
      ]
    },
    {
      nombre:'Asociaciones de afiliados',
      linkMenu:ValidMenu.asociaciones,
      estado:Estado.ACTIVO,
      
      prioridad:60,
      items:[
        
    //ASOCIACIONES
    {
      nombre:'Listar afiliados',
      linkMenu:ValidItemMenu.asociacionList,
      visible:true,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Mostrar asociaciones de afiliado',
      linkMenu:ValidItemMenu.asociacionesAfiliadoDetails,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Registrar nueva asociación',
      linkMenu:ValidItemMenu.asociacionRegister,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Mostrar datos de asociación',
      linkMenu:ValidItemMenu.asociacionDetails,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Actualizar datos de asociación',
      linkMenu:ValidItemMenu.asociacionUpdate,
      visible:false,
      estado:Estado.ACTIVO
    },
    {
      nombre:'Eliminar asociación',
      linkMenu:ValidItemMenu.asociacionUpdateStatus,
      visible:false,
    },
    {
      nombre:'Administrar gestiones de asociación',
      linkMenu:ValidItemMenu.asociacionGestiones,
      visible:false,
    },
    {
      nombre:'Administrar lecturas de asociación',
      linkMenu:ValidItemMenu.asociacionLecturas,
      visible:false,
    },
    {
      nombre:'Reportes de consumo de agua de asociación',
      linkMenu:ValidItemMenu.asociacionReportesGraficos,
      visible:false,
    },
      ]
    },
    {
      nombre:'Perfiles',
      linkMenu:ValidMenu.perfiles,
      estado:Estado.ACTIVO,
      prioridad:80,
      items:[
        //Menus de Perfiles
    {
      nombre:'Listar Perfiles',
      linkMenu:ValidItemMenu.perfilList,
      visible:true,
    },
    {
      nombre:'Registrar nuevo perfil',
      linkMenu:ValidItemMenu.perfilRegister,
      visible:false,
    },
    {
      nombre:'Asignar afiliacion a perfil',
      linkMenu:ValidItemMenu.perfilAfiliadoRegister,
      visible:false,
    },
    {
      nombre:'Asignar usuario de acceso a perfil',
      linkMenu:ValidItemMenu.perfilUserRegister,
      visible:false,
    },
    {
      nombre:'Mostrar perfil',
      linkMenu:ValidItemMenu.perfilDetails,
      visible:false,
    },
    {
      nombre:'Mostrar afiliado',
      linkMenu:ValidItemMenu.perfilAfiliadoDetails,
      visible:false,
    },
    {
      nombre:'Mostrar usuario',
      linkMenu:ValidItemMenu.perfilUserDetails,
      visible:false,
    },
    {
      nombre:'Modificar perfil',
      linkMenu:ValidItemMenu.perfilUpdate,
      visible:false,
    },
    {
      nombre:'Modificar afiliacion',
      linkMenu:ValidItemMenu.perfilAfiliadoUpdate,
      visible:false,
    },
    {
      nombre:'Modificar usuario',
      linkMenu:ValidItemMenu.perfilUserUpdate,
      visible:false,
    },
    {
      nombre:'Eliminar perfil',
      linkMenu:ValidItemMenu.perfilUpdateStatus,
      visible:false,
    },
    {
      nombre:'Eliminar afiliación',
      linkMenu:ValidItemMenu.perfilAfiliadoUpdateStatus,
      visible:false,
    },
    {
      nombre:'Eliminar usuario',
      linkMenu:ValidItemMenu.perfilUserUpdateStatus,
      visible:false,
    },
    {
      nombre:'Registrar pago de afiliación',
      linkMenu:ValidItemMenu.perfilAfiliadoPagoRegister,
      visible:false,
    },
    {
      nombre:'Modificar pago de afiliación',
      linkMenu:ValidItemMenu.perfilAfiliadoPagoUpdate,
      visible:false,
    },
      ]
    },
    {
      nombre:'Cobros de servicio',
      linkMenu:ValidMenu.cobros,
      estado:Estado.ACTIVO,
      
      prioridad:70,
      items:[
    //COBROS DE SERVICIO
    {
      nombre:'Cobros de servicio',
      linkMenu:ValidItemMenu.cobrosListarAsociacionesAfiliados,
      visible:true,
    },
    {
// RECORTES EN COBROS
      nombre:'Cortes del servicio de agua',
    linkMenu:ValidItemMenu.cobrosRecortesDeServicio,
    visible:true
  },
    {
    nombre:'Reconexiones del servicio de agua',
    linkMenu:ValidItemMenu.cobrosReconexionesDeServicio,
    visible:true
    },

    {
      nombre:'Mostrar deudas de afiliado',
      linkMenu:ValidItemMenu.cobrosDeudasPorPagarAsociacion,
      visible:false,
    },
    {
      nombre:'Registrar pago de servicio',
      linkMenu:ValidItemMenu.cobrosRegistrarPagoDeudas,
      visible:false,
    },
    {
      nombre:'Historial de cobros de servicio',
      linkMenu:ValidItemMenu.cobrosHistorialRegistroDeCobros,
      visible:false,
    },

    //MENUS DE MULTAS
    {
      nombre:'Listar multas activas',
      linkMenu:ValidItemMenu.cobrosMultasActivas,
      visible:false,
    },
    {
      nombre:'Historial de multas',
      linkMenu:ValidItemMenu.cobrosMultasHistorial,
      visible:false,
    },
    {
      nombre:'Registrar nueva multa',
      linkMenu:ValidItemMenu.cobrosMultasRegistrarNuevo,
      visible:false,
    },
    {
      nombre:'Registrar pago de multas seleccionadas',
      linkMenu:ValidItemMenu.cobrosRegistrarPagoMultasSelected,
      visible:false,
    },
      ]
    },
    {
      nombre:'Registrar lecturas',
      linkMenu:ValidMenu.lecturas,
      estado:Estado.ACTIVO,
      prioridad:50,
      items:[
        //MENUS DE REGISTRO DE LECTURAS
    {
      nombre:'Registrar planillas de lecturas',
      linkMenu:ValidItemMenu.lecturasRegistrarLecturasAfiliados,
      visible:false,
    },
    {
      nombre:'Listar planillas de lecturas de afiliados disponibles',
      linkMenu:ValidItemMenu.lecturasListarAfiliadosPlanillasLecturas,
      visible:true,
    },
      ]
    },
    {
      nombre:'Consultar',
      linkMenu:'user',
      estado:Estado.ACTIVO,
      prioridad:30,
      items:[
         //menus usuario afiliado 
    {
      nombre:'Medidores de agua',
      linkMenu:ValidItemMenu.consultarConsultarMedidoresAgua,
      visible:true,
    },
    {
      nombre:'Deudas pendientes',
      linkMenu:ValidItemMenu.consultarDeudas,
      visible:true,
    },
      ]
    },
    {
      nombre:'Reportes',
      linkMenu:ValidMenu.reportes,
      prioridad:60,
      items:[
        {
          nombre:'Reportes de deudores morosos',
          linkMenu:ValidItemMenu.reportesDeudores,
          visible:true,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Reportes pagos de servicio',
          linkMenu:ValidItemMenu.reportesPagosService,
          visible:true,
          estado:Estado.ACTIVO
        },
      ]
    },
    {
      nombre:'Configuraciones',
      linkMenu:ValidMenu.opciones,
      prioridad:31,
      items:[
        {
          nombre:'Tarifas de consumo de agua',
          linkMenu:ValidItemMenu.opcionesConfiguracionlistarTarifasPorConsumoAgua,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Tarifas de multas por retraso de pago de servicio',
          linkMenu:ValidItemMenu.opcionesConfiguracionlistarTarifasMultasPorRetrasoDePago,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Descuentos de beneficiarios',
          linkMenu:ValidItemMenu.opcionesConfiguracionlistarBeneficiarios,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Nueva tarifa de consumo de agua',
          linkMenu:ValidItemMenu.opcionesConfiguracionRegistrarTarifaPorConsumoAgua,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Actualizar datos de tarifa de consumo de agua',
          linkMenu:ValidItemMenu.opcionesConfiguracionUpdateTarifaPorConsumoAgua,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Actualizar estado tarifa de consumo de agua',
          linkMenu:ValidItemMenu.opcionesConfiguracionUpdateStautsTarifaPorConsumoAgua,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Nueva tarifa de multa por retrasos de pago de servicio',
          linkMenu:ValidItemMenu.opcionesConfiguracionRegistrarTarifaMultaPorRetrasoDePago,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Actualizar datos de tarifa de multa por retrasos de pago de servicio',
          linkMenu:ValidItemMenu.opcionesConfiguracionUpdateTarifaMultaPorRetrasoDePago,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Actualizar estado tarifa de multa por retrasos de pago de servicio',
          linkMenu:ValidItemMenu.opcionesConfiguracionUpdateStautsTarifaMultaPorRetrasoDePago,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Nuevo beneficiario de descuentos',
          linkMenu:ValidItemMenu.opcionesConfiguracionRegistrarBeneficiarioPagos,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Actualizar datos de beneficiario',
          linkMenu:ValidItemMenu.opcionesConfiguracionUpdateBeneficiario,
          visible:false,
          estado:Estado.ACTIVO
        },
        {
          nombre:'Actualizar estado de beneficiario',
          linkMenu:ValidItemMenu.opcionesConfiguracionUpdateStautsBeneficiario,
          visible:false,
          estado:Estado.ACTIVO
        },
      ]
    }
  ],
  roles: [
    {
      nombre: ValidRole.root,
      estado: Estado.ACTIVO,
      nivel:Nivel.root
    },
    {
      nombre: ValidRole.administrativo,
      estado: Estado.ACTIVO,
      nivel:Nivel.administrativo,
    },
    {
      nombre: ValidRole.secretaria,
      estado: Estado.ACTIVO,
      nivel:Nivel.secreataria,
    },
    {
      nombre: ValidRole.afiliado,
      estado: Estado.ACTIVO,
      nivel:Nivel.afiliado,
    },
  ],
  medidores: [
    {
      nroMedidor: '98QW98E7SD',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
    },
    {
      nroMedidor: '98CSX477744QW',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      
      medicion:Medicion.mt3
    },
    {
      nroMedidor: '26HJT5645DF4D4W',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '5R4ET45V4B4BVFGH5555',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '138R78944165465E',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '5995DASD4WQ4',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '6QW8E7645ASD6W',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '9QWE5QWE4ASD4W',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '4E48R7WW44',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '59QWE89Q8WE98QWE4',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: 'EWRWE8W87W00',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: 'UX488448EWQ77LL',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '98798ER7987E8',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '3A1SD5DQ53W4EW',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '6Q5W4645AS6D54',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      
      medicion:Medicion.mt3
    },
    {
      nroMedidor: 'Q5W66XCC1C15',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '645SD4546VVDDD',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    //* MAS MEDIDORES
    
    {
      nroMedidor: '54Y5YTYE6WER45WERWER',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: 'CVB46577F8REER',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: 'Z65DF4G64D465B4NN',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: 'ERT77UIOUI78BB',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: '165H65G04RGE0WEWE',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: 'XC65VXC6V7SD68EWR',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: 'FD54G6S8F7GDF68GE',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: 'SD98F7WERW465E465',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
    {
      nroMedidor: 'TY68A7645HFG645FGH',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      
      medicion:Medicion.mt3
    },
    {
      nroMedidor: 'DF3574ER6864R0',
      marca: 'LAO TAO',
      lecturaInicial: 0,
      lecturaMedidor:0,
      estado: Estado.ACTIVO,
      medicion:Medicion.mt3
      
    },
  ],
  medidoresAsociados:[
    {
      fechaInstalacion: new Date(2012, 4, 23),
      ubicacion:{
        barrio:Barrio._20DeMarzo,
        manzano:'A',
        numeroManzano:1,
        nroLote:1,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado,
    },
    {
      fechaInstalacion: new Date(2012, 8, 16),
      ubicacion:{
        barrio:Barrio._20DeMarzo,
        manzano:'A',
        numeroManzano:1,
        nroLote:2,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },
    {
      fechaInstalacion: new Date(2015, 9, 9),
      ubicacion:{
        barrio:Barrio.mendezFortaleza,
        manzano:'A',
        numeroManzano:1,
        nroLote:3,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },
    {
      fechaInstalacion: new Date(2019, 5, 18),
      ubicacion:{
        barrio:Barrio.sanAntonio,
        manzano:'A',
        numeroManzano:2,
        nroLote:1,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },
    {
      fechaInstalacion: new Date(2018, 8, 8),
      ubicacion:{
        barrio:Barrio.primavera,
        manzano:'A',
        numeroManzano:2,
        nroLote:2,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2014, 2, 24),
      ubicacion:{
        barrio:Barrio.verdeOlivo,
        manzano:'A',
        numeroManzano:2,
        nroLote:3,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2019, 11, 11),
      ubicacion:{
        barrio:Barrio.primavera,
        manzano:'B',
        numeroManzano:1,
        nroLote:1,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2021, 2, 18),
      ubicacion:{
        barrio:Barrio.mendezFortaleza,
        manzano:'B',
        numeroManzano:1,
        nroLote:2,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2020, 11, 11),
      ubicacion:{
        barrio:Barrio.verdeOlivo,
        manzano:'B',
        numeroManzano:1,
        nroLote:3,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2022, 8, 9),
      ubicacion:{
        barrio:Barrio.mendezFortaleza,
        manzano:'B',
        numeroManzano:2,
        nroLote:1,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2020, 8, 9),
      ubicacion:{
        barrio:Barrio.primavera,
        manzano:'B',
        numeroManzano:2,
        nroLote:2,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2019, 5, 5),
      ubicacion:{
        barrio:Barrio.mendezFortaleza,
        manzano:'B',
        numeroManzano:2,
        nroLote:3,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2020, 2, 9),
      ubicacion:{
        barrio:Barrio._20DeMarzo,
        manzano:'C',
        numeroManzano:1,
        nroLote:1,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2020, 7, 2),
      ubicacion:{
        barrio:Barrio.verdeOlivo,
        manzano:'C',
        numeroManzano:1,
        nroLote:2,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2019, 1, 2),
      ubicacion:{
        barrio:Barrio.sanAntonio,
        manzano:'C',
        numeroManzano:1,
        nroLote:3,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2020, 6, 6),
      ubicacion:{
        barrio:Barrio.primavera,
        manzano:'C',
        numeroManzano:2,
        nroLote:1,
      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    },{
      fechaInstalacion: new Date(2020, 4, 7),
      ubicacion:{
        barrio:Barrio._20DeMarzo,
        manzano:'C',
        numeroManzano:2,
        nroLote:2,

      },
      estadoMedidorAsociado:EstadoAsociacion.conectado
    }
  ],
  planillas:[
    // {
    //   gestion:2020
    // },
    // {
    //   gestion:2021
    // },
    // {
    //   gestion:2022
    // },
    // {
    //   gestion:2023
    // },
    {
      gestion:2024
    },
  ],
  tarifaConsumoAgua:[
    {
      lecturaMinima:10,
      tarifaMinima:8,
      moneda:Monedas.Bs,
      tarifaAdicional:1.5,
      diaLimitePago:20,
      vigencia:new Date(2022,0,1,0,0,0,0) //VIGENCIA EN FECHA 1/01/2024 00:00
    },
    {
      lecturaMinima:10,
      tarifaMinima:10,
      moneda:Monedas.Bs,
      tarifaAdicional:2,
      vigencia:new Date(2024,0,1,0,0,0,0), //VIGENCIA EN FECHA 1/01/2024 00:00
      diaLimitePago:25,
    },
  ],
  tarifaMultasPorRetraso:[
    {mesesDemora:6,
      moneda:Monedas.Bs,
      monto:30,
      vigencia:new Date(2022,0,1,0,0,0,0), //VIGENCIA EN FECHA 1/01/2024 00:00
      tipoMulta:TipoMulta.retrasoPago
    },
    {
      mesesDemora:3,
      moneda:Monedas.Bs,
      monto:50,
      vigencia:new Date(2024,0,1,0,0,0,0),
      tipoMulta:TipoMulta.retrasoPago
    },
    {mesesDemora:6,
      moneda:Monedas.Bs,
      monto:30,
      vigencia:new Date(2022,0,1,0,0,0,0), //VIGENCIA EN FECHA 1/01/2024 00:00
      tipoMulta:TipoMulta.reconexion
    },
    {
      mesesDemora:3,
      moneda:Monedas.Bs,
      monto:50,
      vigencia:new Date(2024,0,1,0,0,0,0),
      tipoMulta:TipoMulta.reconexion
    },
  ],
  benficiarios:[
    {
      descuento:20,
      tipoBeneficiario:'Adulto mayor',
    },
    {
      descuento:10,
      tipoBeneficiario:'Discapacidades Físicas',
      detalles:'Personas con deficiencias anatómicas y neuromúsculofuncionales'
    }
  ],
};
