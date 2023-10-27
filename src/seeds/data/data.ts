import * as bcrypt from 'bcrypt';
import { Ubicacion } from 'src/common/inherints-db';
import { Barrio, Estado, Mes, Nivel, TipoPerfil } from 'src/interfaces/enum/enum-entityes';

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
  nombre: string;
  linkMenu: string;
  estado?: Estado;
  visible?:boolean;
}
class RoleSeed {
  nombre: string;
  nivel:  Nivel;
  estado?: Estado;
}

class MedidorSeed {
  nroMedidor: string;
  fechaInstalacion: Date;
  lecturaInicial: number;
  estado?: Estado;
  marca: string;
  ubicacion:Ubicacion;
  ultimaLectura: number;
}
class PlanillaLecturasSeed{
  gestion:number;
}
class MesLecturaSeed{
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
      genero: 'masculino',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.administrativo],
    },
    {
      nombrePrimero: 'Arturo',
      apellidoPrimero: 'Ortega',
      apellidoSegundo: 'Nogales',
      CI: '45824111',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1987, 8, 10),
      genero: 'masculino',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Franz',
      apellidoPrimero: 'Mamani',
      apellidoSegundo: 'Machaca',
      CI: '65842174',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1990, 6, 10),
      genero: 'masculino',
      profesion: 'Ingenieria Electrica',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Gwato',
      apellidoPrimero: 'Gato',
      CI: '6352478',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1998, 7, 24),
      genero: 'masculino',
      profesion: 'Contaduria',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Luis',
      nombreSegundo: 'Rodrigo',
      apellidoPrimero: 'Ventura',
      apellidoSegundo: 'Zacapata',
      CI: '752401254',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1995, 1, 18),
      genero: 'masculino',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Rosa',
      apellidoPrimero: 'Belgrano',
      apellidoSegundo: 'Sanchez',
      CI: '24501247',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1974, 8, 19),
      genero: 'femenino',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Victor',
      apellidoPrimero: 'Soto',
      apellidoSegundo: 'Fernandez',
      CI: '7410005',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1992, 10, 17),
      genero: 'masculino',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Ricardo',
      apellidoPrimero: 'Serrano',
      apellidoSegundo: 'Galarza',
      CI: '85421077',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1990, 4, 5),
      genero: 'masculino',
      profesion: 'Contador',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Ricardo',
      nombreSegundo: 'Leonel',
      apellidoPrimero: 'Corazon',
      CI: '885011424',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1992, 8, 8),
      genero: 'masculino',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Ana',
      nombreSegundo: 'Paola',
      apellidoPrimero: 'Ortiz',
      apellidoSegundo: 'Mamani',
      CI: '65201487',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1989, 4, 24),
      genero: 'femenino',
      profesion: 'Doctorado',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Kira',
      nombreSegundo: 'Leon',
      apellidoPrimero: 'Quispe',
      apellidoSegundo: 'Segundo',
      CI: '66258001',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1987, 12, 17),
      genero: 'masculino',
      profesion: 'Ingenieria Industrial',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Marina',
      apellidoPrimero: 'Ramos',
      CI: '7002541',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1985, 5, 10),
      genero: 'femenino',
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
      genero: 'femenino',
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
      genero: 'masculino',
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
      genero: 'masculino',
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
      genero: 'masculino',
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
      genero: 'femenino',
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
      genero: 'femenino',
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
      genero: 'masculino',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
    },
    {
      nombrePrimero: 'Robin',
      apellidoPrimero: 'Hood',
      CI: '6600777',
      estado: Estado.ACTIVO,
      fechaNacimiento: new Date(1997, 5, 2),
      genero: 'masculino',
      profesion: 'comerciante',
      tipoPerfil: [TipoPerfil.afiliado],
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
        numeroVivienda: '270588'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.verdeOlivo, 
        numeroVivienda: '270588'
      },
      estado: Estado.ACTIVO,
    },
    {
      ubicacion: { 
        barrio: Barrio.primavera, 
        numeroVivienda: '270588'
      },
      estado: Estado.ACTIVO,
    },
  ],
  usuarios: [
    {
      username: 'admin',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
    {
      username: 'root',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
    {
      username: 'administrativo',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
    {
      username: 'contador',
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
    {
      username: 'afiliado2',
      password: bcrypt.hashSync('123456', 10),
      estado: Estado.ACTIVO,
    },
  ],
  itemsMenu: [
    {
      nombre: 'registrar itemMenu',
      linkMenu: 'item-menu-register',
      estado: Estado.ACTIVO,
      visible:true,
    },
    {
      nombre: 'detalles de item menu',
      linkMenu: 'item-menu-details',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'modificar itemMenu',
      linkMenu: 'item-menu-update',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'bajar itemMenu',
      linkMenu: 'item-menu-update-status',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'listar items de menus',
      linkMenu: 'item-menu-list',
      estado: Estado.ACTIVO,
      visible:true
    },
    {
      nombre: 'registrar menu',
      linkMenu: 'menu-register',
      estado: Estado.ACTIVO,
      visible:true
    },
    {
      nombre: 'detalles de menu',
      linkMenu: 'menu-details',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'modificar menu',
      linkMenu: 'menu-update',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'bajar menu',
      linkMenu: 'menu-update-status',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'listar menus',
      linkMenu: 'menu-list',
      estado: Estado.ACTIVO,
    },
    {
      nombre: 'registrar rol',
      linkMenu: 'rol-register',
      estado: Estado.ACTIVO,
    },
    {
      nombre: 'detalles de rol',
      linkMenu: 'rol-details',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'modificar rol',
      linkMenu: 'rol-update',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'bajar rol',
      linkMenu: 'rol-update-status',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'listar roles',
      linkMenu: 'rol-list',
      estado: Estado.ACTIVO,
    },
    {
      nombre: 'registrar medidor',
      linkMenu: 'medidor-register',
      estado: Estado.ACTIVO,
    },
    {
      nombre: 'detalles de afiliado con medidores',
      linkMenu: 'medidor-details',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'modificar medidor',
      linkMenu: 'medidor-update',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'bajar medidor',
      linkMenu: 'medidor-update-status',
      estado: Estado.ACTIVO,
      visible:false,
    },
    {
      nombre: 'listar afiliados con medidores',
      linkMenu: 'medidor-list',
      estado: Estado.ACTIVO,
    },
    {
      nombre:'registrar nuevo perfil',
      linkMenu:'perfil-register',
      estado:Estado.ACTIVO,
    },
    {
      nombre:'listar perfiles',
      linkMenu:'perfil-list',
      estado:Estado.ACTIVO,
    },
    {
      nombre:'actualizar perfil',
      linkMenu:'perfil-update',
      estado:Estado.ACTIVO,
      visible:false,
    },
    {
      nombre:'bajar perfil',
      linkMenu:'perfil-update-status',
      estado:Estado.ACTIVO,
      visible:false,
    },
    {
      nombre:'detalles de perfil',
      linkMenu:'perfil-details',
      estado:Estado.ACTIVO,
      visible:false,
    },
    {
      nombre:'asignar usuario a perfil',
      linkMenu:'perfil-user-register',
      estado:Estado.ACTIVO,
      visible:false,
    },
    {
      nombre:'asignar afiliacion a perfil',
      linkMenu:'perfil-afiliado-register',
      estado:Estado.ACTIVO,
      visible:false,
    },
    {
      nombre:'actualizar usuario de perfil',
      linkMenu:'perfil-user-update',
      estado:Estado.ACTIVO,
      visible:false,
    },
    {
      nombre:'bajar usuario de perfil',
      linkMenu:'perfil-user-update-status',
      estado:Estado.ACTIVO,
      visible:false,
    },
    {
      nombre:'actualizar afiliado de perfil',
      linkMenu:'perfil-afiliado-update',
      estado:Estado.ACTIVO,
      visible:false,
    },
    {
      nombre:'bajar afiliado de perfil',
      linkMenu:'perfil-afiliado-update-status',
      estado:Estado.ACTIVO,
      visible:false,
    },
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
      nombre: 'medidores-agua',
      linkMenu: 'medidores',
      estado: Estado.ACTIVO,
    },{
      nombre:'perfiles',
      linkMenu:'perfiles',
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
      nombre: 'administrativo',
      estado: Estado.ACTIVO,
      nivel:Nivel.administrativo,
    },
    {
      nombre: 'contador',
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
      // fechaInstalacion: new Date('24/05/2012'),
      fechaInstalacion: new Date(2012, 4, 23),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio._20DeMarzo
      },ultimaLectura:0,
    },
    {
      nroMedidor: '98CSX477744QW',
      marca: 'LAO TAO',
      fechaInstalacion: new Date(2012, 8, 16),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio._20DeMarzo
      },ultimaLectura:0,
    },
    {
      nroMedidor: '26HJT5645DF4D4W',
      marca: 'LAO TAO',
      fechaInstalacion: new Date(2015, 9, 9),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio.mendezFortaleza
      },ultimaLectura:0,
    },
    {
      nroMedidor: '5R4ET45V4B4BVFGH5555',
      marca: 'LAO TAO',
      fechaInstalacion: new Date(2019, 5, 18),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio.sanAntonio
      },ultimaLectura:0,
    },
    {
      nroMedidor: '138R78944165465E',
      marca: 'LAO TAO',
      fechaInstalacion: new Date(2018, 8, 8),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio.primavera
      },ultimaLectura:0,
    },
    {
      nroMedidor: '5995DASD4WQ4',
      marca: 'LAO TAO',
      fechaInstalacion: new Date(2014, 2, 24),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio.verdeOlivo
      },ultimaLectura:0,
    },
    {
      nroMedidor: '6QW8E7645ASD6W',
      marca: 'LAO TAO',
      fechaInstalacion: new Date(2019, 11, 11),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio.primavera
      },ultimaLectura:0,
    },
    {
      nroMedidor: '9QWE5QWE4ASD4W',
      marca: 'LAO TAO',
      fechaInstalacion: new Date(2021, 2, 18),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio.mendezFortaleza
      },ultimaLectura:0,
    },
    {
      nroMedidor: '4E48R7WW44',
      marca: 'LAO TAO',
      fechaInstalacion: new Date(2020, 11, 11),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio.verdeOlivo
      },ultimaLectura:0,
    },
    {
      nroMedidor: '59QWE89Q8WE98QWE4',
      marca: 'LAO TAO',
      fechaInstalacion: new Date(2022, 8, 9),
      lecturaInicial: 0,
      estado: Estado.ACTIVO,
      ubicacion:{
        barrio:Barrio.sanAntonio
      },ultimaLectura:0,
    },
  ],
  planillas:[
    {
      gestion:2023
    }
  ]
};
