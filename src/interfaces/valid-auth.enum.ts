export enum ValidRole{
    root="root",
    admin="admin",
    administrativo="administrativo",
    contador="contador",
    afiliado="afiliado",
    user="user"
}

//VALID MENU
export enum ValidMenu{
    afiliados="afiliados",
    menus="menus",
    itemsMenu="items-menu",
    roles="roles",
    usuarios="usuarios",
    medidores="medidores"
    // afiliados="afiliados",
}

//VALID ITEM MENU
export enum ValidItemMenu{
    //RECURSOS DE AFILIADOS
    afiliadoRegister ="afiliado-register",
    afiliadoUpdate ="afiliado-update",
    afiliadoStatus ="afiliado-update-status",
    afiliadoList ="afiliado-list",
    afiliadoDetails ="afiliado-details",
    //RECURSOS DE GESTION DE LOS MENUS
    menuRegister ="menu-register",
    menuUpdate ="menu-update",
    menuStatus ="menu-status",
    menuList ="menu-list",
    menuDetails ="menu-details",
    //RECURSOS DE GESTION DE LOS ITEMS MENU
    itemMenuRegister ="item-menu-register",
    itemMenuUpdate ="item-menu-update",
    itemMenuStatus ="item-menu-status",
    itemMenuList ="item-menu-list",
    itemMenuDetails ="item-menu-details",
    //RECURSOS DE GESTION DE ROLES D
    roleRegister="role-register",
    roleUpdate="role-update",
    roleUpdateStatus="role-update-status",
    roleList="role-list",
    roleDetails='role-details',
    //RECURSOS DE GESTION DE LOS USUARIOS
    usuarioRegister ="usuario-register",
    usuarioUpdate ="usuario-update",
    usuarioStatus ="usuario-update-status",
    usuarioUpdateProfile ="usuario-update-profile",
    usuarioList ="usuario-list",
    usuarioDetails ="usuario-details",

    //RECURSOS DE GESTION DE MEDIDORES
    medidorRegister="medidor-register",
    medidorUpdate="medidor-update",
    medidorUpdateStatus="medidor-update-status",
    medidorList="medidor-list",
    medidorDetails='medidor-details',
}