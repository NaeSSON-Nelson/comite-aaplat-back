export enum ValidRole{
    root="root",
    // admin="admin",
    administrativo="administrativo",
    secretaria="secretaria",
    afiliado="afiliado",
    // contador="contador",
    // user="user"
}

//VALID MENU
export enum ValidMenu{
    
    menus="menus",
    itemsMenu="items-menu",

    perfiles="perfiles",
    medidores="medidores-agua",
    asociaciones="asociaciones",
    roles="roles",
    cobros="cobros-de-servicio-agua",
    lecturas="lecturas",
    consultar="user",
    reportes="reportes",
    opciones="opciones-configuracion"
    // multasRetrasoPago="multas-de-servicio"
    // afiliados="afiliados",
    //  usuarios="usuarios",
}

//VALID ITEM MENU
export enum ValidItemMenu{
    //recursos de perfiles
    perfilRegister="perfil-register",
    perfilUpdate="perfiles-update",
    perfilUpdateStatus="perfil-update-status",
    perfilList="perfil-list",
    perfilDetails="perfil-details",

    //recursos de perfil usuarios
    perfilUserRegister="perfil-user-register",
    perfilUserUpdate="perfil-user-update",
    perfilUserUpdateStatus="perfil-user-update-status",
    perfilUserDetails="perfil-user-details",
    //recursos de perfil afiliado
    perfilAfiliadoRegister="perfil-afiliado-register",
    perfilAfiliadoDetails="perfil-afiliado-details",
    perfilAfiliadoUpdate="perfil-afiliado-update",
    perfilAfiliadoUpdateStatus="perfil-afiliado-update-status",
    perfilAfiliadoPagoRegister="perfil-afiliado-pago-register",
    perfilAfiliadoPagoUpdate="perfil-afiliado-pago-update",
    //RECURSOS DE AFILIADOS
    // afiliadoRegister ="afiliado-register",
    // afiliadoUpdate ="afiliado-update",
    // afiliadoStatus ="afiliado-update-status",
    // afiliadoList ="afiliado-list",
    // afiliadoDetails ="afiliado-details",
    //RECURSOS DE GESTION DE LOS USUARIOS
    // usuarioRegister ="usuario-register",
    // usuarioUpdate ="usuario-update",
    // usuarioStatus ="usuario-update-status",
    // usuarioUpdateProfile ="usuario-update-profile",
    // usuarioList ="usuario-list",
    // usuarioDetails ="usuario-details",
    //RECURSOS DE GESTION DE LOS MENUS
    menuRegister ="menu-register",
    menuUpdate ="menu-update",
    menuUpdateStatus ="menu-update-status",
    menuList ="menus-list",
    menuDetails ="menu-details",
    //RECURSOS DE GESTION DE LOS ITEMS MENU
    // itemMenuRegister ="item-menu-register",
    // itemMenuUpdate ="item-menu-update",
    // itemMenuUpdateStatus ="item-menu-update-status",
    // itemMenuList ="item-menu-list",
    // itemMenuDetails ="item-menu-details",
    //RECURSOS DE GESTION DE ROLES D
    rolRegister="rol-register",
    rolUpdate="rol-update",
    rolUpdateStatus="rol-update-status",
    rolList="roles-list",
    rolDetails='rol-details',
    

    //RECURSOS DE GESTION DE MEDIDORES
    medidorRegister="medidor-agua-register",
    medidorUpdate="medidor-agua-update",
    medidorUpdateStatus="medidor-agua-update-status",
    medidorList="medidores-de-agua-list",
    medidorDetails='medidor-agua-details',
    medidorHistorialAsociaciones='medidor-agua-asociaciones-historial',
    //ASOCIACIONES
    asociacionList="asociaciones-list", 
    asociacionesAfiliadoDetails ="asociaciones-afiliado-details",
    asociacionRegister="asociacion-register",
    asociacionUpdate="asociacion-update",
    asociacionUpdateStatus="asociacion-update-status",
    asociacionDetails="asociacion-details",
    asociacionGestiones="asociacion-gestiones",
    asociacionLecturas="asociacion-lecturas",
    asociacionReportesGraficos="asociacion-graphic-reports",

    //COBROS
    cobrosListarAsociacionesAfiliados="afiliados-asociados-list",
    cobrosDeudasPorPagarAsociacion="deudas-afiliados",
    cobrosRegistrarPagoDeudas="registrar-deudas",
    cobrosHistorialRegistroDeCobros="historial-deudas",
    cobrosMultasActivas="multas-afiliado",
    cobrosMultasRegistrarNuevo="registrar-multa",
    cobrosRegistrarPagoMultasSelected="registrar-multas",
    cobrosMultasHistorial="multas-afiliado-historial",
    cobrosMultaDetails="multa-afiliado-details",

    // RECORTES EN COBROS
    cobrosRecortesDeServicio="listar-recortes",
    cobrosRecortesRegistrarCortes="registrar-cortes",

    //RECONEXIONES EN COBROS
    cobrosReconexionesDeServicio="listar-reconexiones",
    cobrosReconexionesRegistrarReconexiones="registrar-reconexiones",

    //MODULO DE REGISTRO DE LECTURAS
    lecturasListarAfiliadosPlanillasLecturas="planillas-afiliados-lecturas",
    lecturasRegistrarLecturasAfiliados="registrar-lecturas",

    //REPORTES

    
    reportesPagosService="reportes-pagos",
    reportesDeudores="reportes-deudores",

    //FUNCIONES DE USUARIO AFILIADO

    consultarConsultarMedidoresAgua="consultar-medidores-de-agua",
    consultarDeudas="consultar-deudas",

    //TARIFA POR CONSUMO DE AGUA
    opcionesConfiguracionlistarTarifasPorConsumoAgua="opciones-configuracion-listar-tarifas-por-consumo-agua",
    opcionesConfiguracionRegistrarTarifaPorConsumoAgua="opciones-configuracion-registrar-tarifa-por-consumo-agua",
    opcionesConfiguracionUpdateTarifaPorConsumoAgua="opciones-configuracion-update-tarifa-por-consumo-agua",
    opcionesConfiguracionUpdateStautsTarifaPorConsumoAgua="opciones-configuracion-update-status-tarifa-por-consumo-agua",
    //TARIFA MULTA POR RETRASO DE PAGO DE SERVICIO
    opcionesConfiguracionlistarTarifasMultasPorRetrasoDePago="opciones-configuracion-listar-tarifas-multas-por-retraso-de-pago",
    opcionesConfiguracionRegistrarTarifaMultaPorRetrasoDePago="opciones-configuracion-registrar-tarifa-multa-por-retraso-de-pago",
    opcionesConfiguracionUpdateTarifaMultaPorRetrasoDePago="opciones-configuracion-update-tarifa-multa-por-retraso-de-pago",
    opcionesConfiguracionUpdateStautsTarifaMultaPorRetrasoDePago="opciones-configuracion-update-status-tarifa-multa-por-retraso-de-pago",
    
    //BENEFICIARIOS
    opcionesConfiguracionlistarBeneficiarios="opciones-configuracion-listar-beneficiarios",
    opcionesConfiguracionRegistrarBeneficiarioPagos="opciones-configuracion-registrar-beneficiario",
    opcionesConfiguracionUpdateBeneficiario="opciones-configuracion-update-beneficiario",
    opcionesConfiguracionUpdateStautsBeneficiario="opciones-configuracion-update-status-beneficiario",

}