import { Estado } from "src/interfaces/Entityes/entityes.res";
import * as bcrypt from 'bcrypt';

 class AfiliadoSeed{
    nombrePrimero: string;
    nombreSegundo?: string;
    apellidoPrimero: string;
    apellidoSegundo?: string;
    CI: string;
    genero: string;
    profesion?: string;
    fechaNacimiento: Date;
    estado: number;
}
 class MenuSeed{
    nombre:string;
    linkMenu?:string
    estado?:number
    itemsMenu?: MenuItemSeed[]
}
 class MenuItemSeed{
    nombre: string;
    linkMenu?: string;
    estado?: number;
}
 class RoleSeed{
    nombre:string;
    estado?:number;
    menus?: MenuSeed[];
}
 class UsuarioSeed{
    userName:string;
    password:string;
    estado?:number;
    afiliado?:AfiliadoSeed;
}
 class MedidorSeed{
    nroMedidor: string;
    fechaInstalacion: Date;
    lecturaInicial: number;
    estado?: number;
    marca: string;
    afiliado?: AfiliadoSeed;
}
 class SeedData{
    afiliados:AfiliadoSeed[];
    menus:MenuSeed[];
    itemsMenu:MenuItemSeed[];
    roles:RoleSeed[];
    usuarios:UsuarioSeed[];
    medidores:MedidorSeed[];
 }
 const formatDate=(date)=> [
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
        ].join('/');
  
  const padTo2Digits=(num)=> num.toString().padStart(2, '0');
  
export const initialData: SeedData={
    afiliados:[
        {
            nombrePrimero:'Juan',
            nombreSegundo:'Robles',
            apellidoPrimero:'Armadillo',
            apellidoSegundo:'Second',
            CI:'5425762',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1995,2,24),
            genero:'masculino',
            profesion:'comerciante'
        },
        {
            nombrePrimero:'Arturo',
            apellidoPrimero:'Ortega',
            apellidoSegundo:'Nogales',
            CI:'45824111',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1987,8,10),
            genero:'masculino',
            profesion:'comerciante'
        },
        {
            nombrePrimero:'Franz',
            apellidoPrimero:'Mamani',
            apellidoSegundo:'Machaca',
            CI:'65842174',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1990,6,10),
            genero:'masculino',
            profesion:'Ingenieria Electrica'
        },
        {
            nombrePrimero:'Gwato',
            apellidoPrimero:'Gato',
            CI:'6352478',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1998,7,24),
            genero:'masculino',
            profesion:'Contaduria'
        },
        {
            nombrePrimero:'Luis',
            nombreSegundo:'Rodrigo',
            apellidoPrimero:'Ventura',
            apellidoSegundo:'Zacapata',
            CI:'752401254',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1995,1,18),
            genero:'masculino',
            profesion:'comerciante'
        },
        {
            nombrePrimero:'Rosa',
            apellidoPrimero:'Belgrano',
            apellidoSegundo:'Sanchez',
            CI:'24501247',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1974,8,19),
            genero:'femenino',
            profesion:'comerciante'
        },
        {
            nombrePrimero:'Victor',
            apellidoPrimero:'Soto',
            apellidoSegundo:'Fernandez',
            CI:'7410005',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1992,10,17),
            genero:'masculino',
            profesion:'comerciante'
        },
        {
            nombrePrimero:'Ricardo',
            apellidoPrimero:'Serrano',
            apellidoSegundo:'Galarza',
            CI:'85421077',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1990,4,5),
            genero:'masculino',
            profesion:'Contador'
        },
        {
            nombrePrimero:'Ricardo',
            nombreSegundo:'Leonel',
            apellidoPrimero:'Corazon',
            CI:'885011424',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1992,8,8),
            genero:'masculino',
            profesion:'comerciante'
        },
        {
            nombrePrimero:'Ana',
            nombreSegundo:'Paola',
            apellidoPrimero:'Ortiz',
            apellidoSegundo:'Mamani',
            CI:'65201487',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1989,4,24),
            genero:'femenino',
            profesion:'Doctorado'
        },
        {
            nombrePrimero:'Kira',
            nombreSegundo:'Leon',
            apellidoPrimero:'Quispe',
            apellidoSegundo:'Segundo',
            CI:'66258001',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1987,12,17),
            genero:'masculino',
            profesion:'Ingenieria Industrial'
        },
        {
            nombrePrimero:'Marina',
            apellidoPrimero:'Ramos',
            CI:'7002541',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1985,5,10),
            genero:'femenino',
            profesion:'comerciante'
        },
        {
            nombrePrimero:'Reyna',
            nombreSegundo:'Noemi',
            apellidoPrimero:'Sanchez',
            apellidoSegundo:'Vaca',
            CI:'7749001',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1995,5,18),
            genero:'femenino',
            profesion:'Modelo'
        },
        {
            nombrePrimero:'Juan',
            apellidoPrimero:'Cortez',
            apellidoSegundo:'Mena',
            CI:'6899504',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1997,8,17),
            genero:'masculino',
            profesion:'Ingenieria Informatica'
        },
        {
            nombrePrimero:'Hector',
            apellidoPrimero:'Freeman',
            apellidoSegundo:'Gordon',
            CI:'7895510',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1992,1,24),
            genero:'masculino',
            profesion:'Doctorado'
        },
        {
            nombrePrimero:'Arturo',
            nombreSegundo:'Marino',
            apellidoPrimero:'Martinez',
            apellidoSegundo:'Quispe',
            CI:'45102477',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1992,5,18),
            genero:'masculino',
            profesion:'comerciante'
        },
        {
            nombrePrimero:'Jimena',
            apellidoPrimero:'Cruz',
            apellidoSegundo:'Villca',
            CI:'7100245',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1992,10,10),
            genero:'femenino',
            profesion:'dentista'
        },
        {
            nombrePrimero:'Noemi',
            nombreSegundo:'Elizabeth',
            apellidoPrimero:'Cruz',
            apellidoSegundo:'Villca',
            CI:'7100526',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1990,8,24),
            genero:'femenino',
            profesion:'Ingenieria'
        },
        {
            nombrePrimero:'Samuel',
            apellidoPrimero:'Colque',
            apellidoSegundo:'Esprella',
            CI:'70114820',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1975,5,1),
            genero:'masculino',
            profesion:'comerciante'
        },
        {
            nombrePrimero:'Robin',
            apellidoPrimero:'Hood',
            CI:'6600777',
            estado:Estado.ACTIVO,
            fechaNacimiento: new Date(1997,5,2),
            genero:'masculino',
            profesion:'comerciante'
        },
    ],
    itemsMenu:[
        {
        nombre:'registrar afiliado',
        linkMenu:'afiliado-register',
        estado:Estado.ACTIVO
        },
        {
        nombre:'modificar afiliado',
        linkMenu:'afiliado-update',
        estado:Estado.ACTIVO
        },
        {
        nombre:'bajar afiliado',
        linkMenu:'afiliado-update-status',
        estado:Estado.ACTIVO
        },
        {
        nombre:'buscar afiliado',
        linkMenu:'afiliado-find',
        estado:Estado.ACTIVO
        },
        {
        nombre:'registrar itemMenu',
        linkMenu:'itemMenu-register',
        estado:Estado.ACTIVO
        },
        {
        nombre:'modificar itemMenu',
        linkMenu:'itemMenu-update',
        estado:Estado.ACTIVO
        },
        {
        nombre:'bajar itemMenu',
        linkMenu:'itemMenu-update-status',
        estado:Estado.ACTIVO
        },
        {
        nombre:'buscar itemMenu',
        linkMenu:'itemMenu-find',
        estado:Estado.ACTIVO
        },
        {
        nombre:'registrar menu',
        linkMenu:'menu-register',
        estado:Estado.ACTIVO
        },
        {
        nombre:'modificar menu',
        linkMenu:'menu-update',
        estado:Estado.ACTIVO
        },
        {
        nombre:'bajar menu',
        linkMenu:'menu-update-status',
        estado:Estado.ACTIVO
        },
        {
        nombre:'buscar menu',
        linkMenu:'menu-find',
        estado:Estado.ACTIVO
        },
        {
        nombre:'registrar rol',
        linkMenu:'rol-register',
        estado:Estado.ACTIVO
        },
        {
        nombre:'modificar rol',
        linkMenu:'rol-update',
        estado:Estado.ACTIVO
        },
        {
        nombre:'bajar rol',
        linkMenu:'rol-update-status',
        estado:Estado.ACTIVO
        },
        {
        nombre:'buscar rol',
        linkMenu:'rol-find',
        estado:Estado.ACTIVO
        },
        {
        nombre:'registrar usuario',
        linkMenu:'usuario-register',
        estado:Estado.ACTIVO
        },
        {
        nombre:'modificar usuario',
        linkMenu:'usuario-update',
        estado:Estado.ACTIVO
        },
        {
        nombre:'bajar usuario',
        linkMenu:'usuario-update-status',
        estado:Estado.ACTIVO
        },
        {
        nombre:'buscar usuario',
        linkMenu:'usuario-find',
        estado:Estado.ACTIVO
        },
        {
        nombre:'registrar medidor',
        linkMenu:'medidor-register',
        estado:Estado.ACTIVO
        },
        {
        nombre:'modificar medidor',
        linkMenu:'medidor-update',
        estado:Estado.ACTIVO
        },
        {
        nombre:'bajar medidor',
        linkMenu:'medidor-update-status',
        estado:Estado.ACTIVO
        },
        {
        nombre:'buscar medidor',
        linkMenu:'medidor-find',
        estado:Estado.ACTIVO
        },
    ],
    menus:[
        {
            nombre:'afiliados',
            linkMenu:'afiliados',
            estado:Estado.ACTIVO
        },
        {
            nombre:'menus',
            linkMenu:'menus',
            estado:Estado.ACTIVO
        },
        {
            nombre:'menusItems',
            linkMenu:'menusItems',
            estado:Estado.ACTIVO
        },
        {
            nombre:'roles',
            linkMenu:'roles',
            estado:Estado.ACTIVO
        },
        {
            nombre:'usuarios',
            linkMenu:'usuarios',
            estado:Estado.ACTIVO
        },
        {
            nombre:'medidores',
            linkMenu:'afiliados',
            estado:Estado.ACTIVO
        },
    ],
    roles:[
        {
            nombre:'root',
            estado:Estado.ACTIVO,
        },
        {
            nombre:'admin',
            estado:Estado.ACTIVO,
        },
        {
            nombre:'administrativo',
            estado:Estado.ACTIVO,
        },
        {
            nombre:'contador',
            estado:Estado.ACTIVO,
        },
        {
            nombre:'afiliado',
            estado:Estado.ACTIVO,
        },
        {
            nombre:'user',
            estado:Estado.ACTIVO,
        },
    ],
    usuarios:[
        {
            userName:'admin',
            password:bcrypt.hashSync('123456',10),
            estado:Estado.ACTIVO
        },
        {
            userName:'root',
            password:bcrypt.hashSync('123456',10),
            estado:Estado.ACTIVO
        },
        {
            userName:'contador',
            password:bcrypt.hashSync('123456',10),
            estado:Estado.ACTIVO
        },
        {
            userName:'user',
            password:bcrypt.hashSync('123456',10),
            estado:Estado.ACTIVO
        },
        {
            userName:'afiliado',
            password:bcrypt.hashSync('123456',10),
            estado:Estado.ACTIVO
        },
        {
            userName:'afiliado',
            password:bcrypt.hashSync('123456',10),
            estado:Estado.ACTIVO
        },
    ],
    medidores:[
        {
            nroMedidor:'98QW98E7SD',
            marca:'LAO TAO',
            fechaInstalacion: new Date('24/05/2012'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
        {
            nroMedidor:'98CSX477744QW',
            marca:'LAO TAO',
            fechaInstalacion: new Date('18/08/2012'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
        {
            nroMedidor:'26HJT5645DF4D4W',
            marca:'LAO TAO',
            fechaInstalacion: new Date('09/09/2015'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
        {
            nroMedidor:'5R4ET45V4B4BVFGH5555',
            marca:'LAO TAO',
            fechaInstalacion: new Date('24/05/2019'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
        {
            nroMedidor:'138R78944165465E',
            marca:'LAO TAO',
            fechaInstalacion: new Date('06/08/2018'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
        {
            nroMedidor:'5995DASD4WQ4',
            marca:'LAO TAO',
            fechaInstalacion: new Date('05/04/2014'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
        {
            nroMedidor:'6QW8E7645ASD6W',
            marca:'LAO TAO',
            fechaInstalacion: new Date('11/11/2019'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
        {
            nroMedidor:'9QWE5QWE4ASD4W',
            marca:'LAO TAO',
            fechaInstalacion: new Date('06/02/2021'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
        {
            nroMedidor:'4E48R7WW44',
            marca:'LAO TAO',
            fechaInstalacion: new Date('11/11/2020'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
        {
            nroMedidor:'59QWE89Q8WE98QWE4',
            marca:'LAO TAO',
            fechaInstalacion: new Date('23/09/2022'),
            lecturaInicial:0,
            estado:Estado.ACTIVO,
        },
    ]
}