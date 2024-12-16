export enum Barrio {
  mendezFortaleza = 'MENDEZ FORTALEZA',
  _20DeMarzo =      '20 DE MARZO',
  sanAntonio =      'SAN ANTONIO',
  verdeOlivo =      'VERDE OLIVO',
  primavera =       'PRIMAVERA',
}
export enum Estado{
  ACTIVO='ACTIVO',
  INACTIVO='INACTIVO',
  DESHABILITADO='DESHABILITADO'
  // SUSPENDIDO='SUSPENDIDO',
  // PROCESO='EN PROCESAMIENTO'
}

export enum TipoPerfil{
  administrativo='ADMINISTRACION',
  afiliado='AFILIADO',
  usuario='USUARIO',
  // secretaria ='SECRETARIA',
  // lecturador='LECTURADOR',
}
export enum Nivel{
  afiliado=10,
  secreataria=30,
  administrativo=50,
  root=100,
}
export enum Mes{
  enero="ENERO",
  febrero="FEBRERO",
  marzo="MARZO",
  abril="ABRIL",
  mayo="MAYO",
  junio="JUNIO",
  julio="JULIO",
  agosto="AGOSTO",
  septiembre="SEPTIEMBRE",
  octubre="OCTUBRE",
  noviembre="NOVIEMBRE",
  diciembre="DICIEMBRE",
}
export enum Monedas{
  Bs ="Bs"
}
export enum Medicion{
  ft3 = "ft3",
  mt3 = 'mt3',
}
export enum MetodoPago{
  presencial='PRESENCIAL',
  deposito='DEPOSITO',
}
export enum RetrasoTipo{
  mensual='MES',
  bimestral='BIMESTRE',
  trimestral='TRIMESTRE',
  demas='DEMAS'
}
export enum TipoMulta{
  retrasoPago='RETRASO-PAGO',
  reconexion='RECONEXIÓN',
  // varios='VARIOS',
}
export enum EstadoAsociacion{
  conectado='CONECTADO',
  desconectado='DESCONECTADO'
}
export enum TipoAccion{
  conexion='CONEXION',
  desconexion='DESCONEXION'
}
