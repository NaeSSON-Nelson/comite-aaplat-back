import * as bcrypt from 'bcrypt';
import { Ubicacion } from 'src/common/inherints-db';
import { Barrio, Estado, Medicion, Mes, Nivel, TipoPerfil } from 'src/interfaces/enum/enum-entityes';

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
  estado?: Estado;
}
class MenuItemSeed {
  linkMenu: string;
  estado?: Estado;
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
  estadoMedidorAsociado:string;
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
class SeedData {
  perfiles: PerfilSeed[];
  afiliados: AfiliadoSeed[];
  menus: MenuSeed[];
  itemsMenu: MenuItemSeed[];
  roles: RoleSeed[];
  usuarios: UsuarioSeed[];
  planillas:PlanillaLecturasSeed[]
  medidores: MedidorSeed[];
  medidoresAsociados:MedidorAsociadoSeed[];
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
      nombreSegundo: 'Robles',
      apellidoPrimero: 'Armadillo',
      apellidoSegundo: 'Second',
      CI: '5425762',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1995, 2, 24),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.administrativo,TipoPerfil.usuario],
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
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario,TipoPerfil.secretaria],
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
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario,TipoPerfil.secretaria],
    },
    {
      nombrePrimero: 'Gwato',
      apellidoPrimero: 'Gato',
      CI: '6352478',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1998, 7, 24),
      genero: 'MASCULINO',
      profesion: 'Contaduria',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario,TipoPerfil.lecturador],
    },
    {
      nombrePrimero: 'Luis',
      nombreSegundo: 'Rodrigo',
      apellidoPrimero: 'Ventura',
      apellidoSegundo: 'Zacapata',
      CI: '752401254',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1995, 1, 18),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario,TipoPerfil.lecturador],
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
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario,TipoPerfil.lecturador],
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
      tipoPerfil: [TipoPerfil.afiliado,TipoPerfil.usuario,TipoPerfil.lecturador],
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
      nombrePrimero: 'Kira',
      nombreSegundo: 'Leon',
      apellidoPrimero: 'Quispe',
      apellidoSegundo: 'Segundo',
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
      apellidoPrimero: 'Freeman',
      apellidoSegundo: 'Gordon',
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
      apellidoSegundo: 'Esprella',
      CI: '70114820',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1975, 5, 1),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Robin',
      apellidoPrimero: 'Hood',
      CI: '6600777',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1997, 5, 2),
      genero: 'MASCULINO',
      profesion: 'comerciante',
      tipoPerfil: [,TipoPerfil.usuario],
    },
  ],
  afiliados: [
    {
      ubicacion: { 
        barrio: Barrio._20DeMarzo, 
        numeroVivienda: '270588'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.mendezFortaleza, 
        numeroVivienda: '55804'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '99804'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.sanAntonio, 
        numeroVivienda: '5405'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.verdeOlivo, 
        numeroVivienda: '5408'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '6874'
      },
      estado: Estado.ACTIVO,
    },
    //
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '7848'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '9857'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '4501'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio._20DeMarzo, 
        numeroVivienda: '1047'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.mendezFortaleza, 
        numeroVivienda: '2508'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.verdeOlivo, 
        numeroVivienda: '2659'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '5684'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio._20DeMarzo, 
        numeroVivienda: '4700'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '8754'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.mendezFortaleza, 
        numeroVivienda: '2504'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.sanAntonio, 
        numeroVivienda: '6678'
      },
      estado: Estado.ACTIVO,
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
    {
      username: 'lecturador',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
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
  ],
  itemsMenu: [
    {
      linkMenu: 'details',
      estado: Estado.ACTIVO,
    },
    {
      linkMenu: 'edit',
      estado: Estado.ACTIVO,
    },
    {
      linkMenu: 'form',
      estado: Estado.ACTIVO,
    },
    {
      linkMenu:'list',
      estado:Estado.ACTIVO,
    },
    {
      linkMenu:'pagar',
      estado:Estado.ACTIVO,
    },
    {
      linkMenu:'medidores',
      estado:Estado.ACTIVO,
    },
    {
      linkMenu:'deudas',
      estado:Estado.ACTIVO,
    },
    {
      linkMenu:'cobrar',
      estado:Estado.ACTIVO,
    }
  ],
  menus: [
    {
      nombre: 'menus',
      linkMenu: 'menus',
      estado: Estado.ACTIVO,
    },
    {
      nombre: 'items menus',
      linkMenu: 'items-menu',
      estado: Estado.ACTIVO,
    },
    {
      nombre: 'roles',
      linkMenu: 'roles',
      estado: Estado.ACTIVO,
    },
    {
      nombre: 'medidores de agua',
      linkMenu: 'medidores-agua',
      estado: Estado.ACTIVO,
    },
    {
      nombre:'asociaciones de medidores',
      linkMenu:'asociaciones',
      estado:Estado.ACTIVO,
    },
    {
      nombre:'perfiles',
      linkMenu:'perfiles',
      estado:Estado.ACTIVO,
    },
    {
      nombre:'Cobros de servicio',
      linkMenu:'cobros',
      estado:Estado.ACTIVO,
    },
    {
      nombre:'Lecturas de medidor de agua',
      linkMenu:'lecturas',
      estado:Estado.ACTIVO,
    },
    {
      nombre:'Consultar',
      linkMenu:'user',
      estado:Estado.ACTIVO,
    }
  ],
  roles: [
    {
      nombre: 'root',
      estado: Estado.ACTIVO,
      nivel:Nivel.root
    },
    {
      nombre: 'admin',
      estado: Estado.ACTIVO,
      nivel:Nivel.administrativo,
    },
    {
      nombre: 'administrador',
      estado: Estado.ACTIVO,
      nivel:Nivel.administrativo,
    },
    {
      nombre: 'secretaria',
      estado: Estado.ACTIVO,
      nivel:Nivel.contador,
    },
    {
      nombre: 'lecturador',
      estado: Estado.ACTIVO,
      nivel:Nivel.contador,
    },
    {
      nombre: 'afiliado',
      estado: Estado.ACTIVO,
      nivel:Nivel.afiliado,
    },
    {
      nombre: 'user',
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
        barrio:Barrio._20DeMarzo
      },
      estadoMedidorAsociado:'uso',
    },
    {
      fechaInstalacion: new Date(2012, 8, 16),
      ubicacion:{
        barrio:Barrio._20DeMarzo
      },
      estadoMedidorAsociado:'uso'
    },
    {
      fechaInstalacion: new Date(2015, 9, 9),
      ubicacion:{
        barrio:Barrio.mendezFortaleza
      },
      estadoMedidorAsociado:'uso'
    },
    {
      fechaInstalacion: new Date(2019, 5, 18),
      ubicacion:{
        barrio:Barrio.sanAntonio
      },
      estadoMedidorAsociado:'uso'
    },
    {
      fechaInstalacion: new Date(2018, 8, 8),
      ubicacion:{
        barrio:Barrio.primavera
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2014, 2, 24),
      ubicacion:{
        barrio:Barrio.verdeOlivo
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2019, 11, 11),
      ubicacion:{
        barrio:Barrio.primavera
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2021, 2, 18),
      ubicacion:{
        barrio:Barrio.mendezFortaleza
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2020, 11, 11),
      ubicacion:{
        barrio:Barrio.verdeOlivo
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2022, 8, 9),
      ubicacion:{
        barrio:Barrio.mendezFortaleza
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2020, 8, 9),
      ubicacion:{
        barrio:Barrio.primavera
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2019, 5, 5),
      ubicacion:{
        barrio:Barrio.mendezFortaleza
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2020, 2, 9),
      ubicacion:{
        barrio:Barrio._20DeMarzo
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2020, 7, 2),
      ubicacion:{
        barrio:Barrio.verdeOlivo
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2019, 1, 2),
      ubicacion:{
        barrio:Barrio.sanAntonio
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2020, 6, 6),
      ubicacion:{
        barrio:Barrio.primavera
      },
      estadoMedidorAsociado:'uso'
    },{
      fechaInstalacion: new Date(2020, 4, 7),
      ubicacion:{
        barrio:Barrio._20DeMarzo
      },
      estadoMedidorAsociado:'uso'
    }
  ],
  planillas:[
    {
      gestion:2020
    },
    {
      gestion:2021
    },
    {
      gestion:2022
    },
    {
      gestion:2023
    },
    {
      gestion:2024
    },
  ]
};
