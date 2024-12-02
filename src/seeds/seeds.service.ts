import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, QueryRunner, Repository, ILike } from 'typeorm';
import { initialData } from './data/data';
import { CommonService } from '../common/common.service';
import { Menu } from '../manager/menus/menus/entities/menu.entity';
import { ItemMenu } from '../manager/menus/items-menu/entities/item-menu.entity';
import { Role } from '../manager/roles/roles/entities/role.entity';
import { Afiliado } from '../auth/modules/usuarios/entities/afiliado.entity';
import { Perfil, Usuario } from 'src/auth/modules/usuarios/entities';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { MenuToRole } from 'src/manager/roles/menu-to-role/entities/menuToRole.entity';
import { RoleToUsuario } from 'src/auth/modules/usuarios/roles-to-usuario/entities/role-to-usuario.entity';
import { AnioSeguimientoLectura } from 'src/medidores-agua/entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from 'src/medidores-agua/entities/mes-seguimiento-registro-lectura.entity';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { Estado, Mes, Monedas } from 'src/interfaces/enum/enum-entityes';
import { PlanillaMesLectura } from 'src/medidores-agua/entities/planilla-mes-lectura.entity';
import { ComprobantePorPago } from 'src/pagos-de-servicio/entities';
import { MedidorAsociado } from 'src/asociaciones/entities/medidor-asociado.entity';
import { ValidMenu, ValidRole } from 'src/interfaces/valid-auth.enum';

@Injectable()
export class SeedsService {

  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepository:Repository<Perfil>,
    @InjectRepository(Afiliado)
    private readonly afiliadoRepository: Repository<Afiliado>,
    @InjectRepository(MedidorAsociado)
    private readonly medidorAsociadoRepository: Repository<MedidorAsociado>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(ItemMenu)
    private readonly ItemMenuRepository: Repository<ItemMenu>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Medidor)
    private readonly medidorRepository: Repository<Medidor>,
    @InjectRepository(MenuToRole)
    private readonly menuToRoleRepository: Repository<MenuToRole>,
    @InjectRepository(RoleToUsuario)
    private readonly roleToUsuarioRepository: Repository<RoleToUsuario>,
    @InjectRepository(AnioSeguimientoLectura)
    private readonly anioSeguimientoLecturaRepository: Repository<AnioSeguimientoLectura>,
    @InjectRepository(MesSeguimientoRegistroLectura)
    private readonly mesSeguimientoRegistroLecturaRepository: Repository<MesSeguimientoRegistroLectura>,
    @InjectRepository(PlanillaLecturas)
    private readonly planillaLecturasRepository: Repository<PlanillaLecturas>,
    @InjectRepository(PlanillaMesLectura)
    private readonly planillaMesLecturasRepository: Repository<PlanillaMesLectura>,
    @InjectRepository(ComprobantePorPago)
    private readonly comprobantesPorPagarRepository: Repository<ComprobantePorPago>,
    
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async executeSeed() {
    // return 'In process';
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // await this.deleteTables();
      //INSERT INTO TABLES
      // const itemsMenusSave = await this.insertItemsMenu();
      // await queryRunner.manager.save(itemsMenusSave);
      const menusSave = await this.insertMenus();
      const menusCreateds=await queryRunner.manager.save(menusSave);
      const itemsSaved:ItemMenu[]=[];
      for(const menC of menusCreateds){
        const men = menusSave.find(men=>men.nombre === menC.nombre);
        if(men){
          for(const item of men.itemMenu){
            itemsSaved.push(this.ItemMenuRepository.create({
              ...item,
              isActive:true,
              menu:menC,
              estado:Estado.ACTIVO,
            }))
          }
        }
      }
      await queryRunner.manager.save(itemsSaved);
      const rolesSave = await this.insertRoles();
      await queryRunner.manager.save(rolesSave);

      const anioSeguimientoSave = await this.insertAnioSeguimientos();
      await queryRunner.manager.save(anioSeguimientoSave);
      const mesesSeguimientoSave = await this.insertMesSeguimiento(anioSeguimientoSave);
      await queryRunner.manager.save(mesesSeguimientoSave);
      
      const perfilesSave = await this.insertPerfiles();
      await queryRunner.manager.save(perfilesSave);
      const usuariosSave = await this.insertUsuarios(perfilesSave);
      await queryRunner.manager.save(usuariosSave);
      const afiliadosSave = await this.insertAfiliados(perfilesSave);
      await queryRunner.manager.save(afiliadosSave);
      const medidoresSave = await this.insertMedidores();
      await queryRunner.manager.save(medidoresSave);
      //DEPENDENCIES

      const medidoresAsociadosSave = await this.insertAsociacionMedidoresWithAfiliado(afiliadosSave,medidoresSave);
      await queryRunner.manager.save(medidoresAsociadosSave);
      const planillasSave = await this.insertPlanillas(medidoresAsociadosSave);
      await queryRunner.manager.save(planillasSave)
      const {lecturasActuales,lecturasPasadas} = await this.insertLecturas(planillasSave);
      await queryRunner.manager.save(lecturasPasadas);
      await queryRunner.manager.save(lecturasActuales);
      const comprobantesPorPagar = await this.insertComprobantesPorPagarAnteriores(lecturasPasadas);
      await queryRunner.manager.save(comprobantesPorPagar);
      
      // console.log('hola:3');
      await queryRunner.commitTransaction();
      return { OK: true, msg: 'SEED EXECUTED' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
  
  private async insertPerfiles(){
    const seedPerfiles = initialData.perfiles;
    const perfiles:Perfil[]=[];
    seedPerfiles.forEach(val=>{
      perfiles.push(this.perfilRepository.create(val));
    })
    return perfiles;
  }
  private async insertAfiliados(perfiles:Perfil[]) {
    const seedAfiliados = initialData.afiliados;
    const afiliados: Afiliado[] = [];
    seedAfiliados.forEach((afi,index) => {
      afiliados.push(
        this.afiliadoRepository.create({...afi,perfil:perfiles[index]}));
    });
    return afiliados;
  }
  private async insertMenus() {
    const seedMenus = initialData.menus;
    // console.log('seed menus',seedMenus);
    const menus: Menu[] = [];
    seedMenus.forEach((menu) => {
      menus.push(this.menuRepository.create({...menu,itemMenu:menu.items}));
    });

    return menus;
  }
  private async insertRoles() {
    const seedRoles = initialData.roles;
    const roles: Role[] = [];
    seedRoles.forEach((role) => {
      roles.push(this.roleRepository.create(role));
    });
    return roles;
  }
  private async insertUsuarios(perfiles:Perfil[]) {
    const seedUsuarios = initialData.usuarios;
    const usuarios: Usuario[] = [];
    seedUsuarios.forEach((usuario, index) => {
      usuarios.push(
        this.usuarioRepository.create({
          ...usuario,
          
          perfil: perfiles[index],
        }),
      );
    });
    return usuarios;
  }
  private async insertAnioSeguimientos(){
    const planillas = initialData.planillas;

    const yearSeg = this.anioSeguimientoLecturaRepository.create(planillas.map(plan=>{
      return {
        anio:plan.gestion
      }
    }))
    return yearSeg;
  }
  private async insertMesSeguimiento(anioSeguimientoSave:AnioSeguimientoLectura[]){
    const fechaActual = new Date();
    //const anioSeguimiento = await this.anioSeguimientoLecturaRepository.findOneBy({anio:fechaActual.getFullYear()});
    const meses:MesSeguimientoRegistroLectura[]=[];
    for(const year of anioSeguimientoSave){

      if(year.anio<fechaActual.getFullYear()){
        for (let index = 0; index < 12; index++) {
          const mes = this.mesSeguimientoRegistroLecturaRepository.create(
            {
            mes: index===0?Mes.enero
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
            fechaRegistroLecturas: new Date(year.anio,index+1,2,8,0,0,0),
            fechaFinRegistroLecturas: new Date(year.anio,index+1,28,12,59,59,0),
          }
          ) 
          meses.push(mes);
        }
      }else
      for(let index=0;index<fechaActual.getMonth();index++){
        const mes = this.mesSeguimientoRegistroLecturaRepository.create(
          {
          mes: index===0?Mes.enero
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
          fechaRegistroLecturas: new Date(fechaActual.getFullYear(),index+1,2,8,0,0,0),
          fechaFinRegistroLecturas: new Date(fechaActual.getFullYear(),index+1,28,12,59,59,0),
        }
        ) 
        meses.push(mes);
      }
    }
    return meses;
  }
  private async insertAsociacionMedidoresWithAfiliado(afiliados:Afiliado[],medidores:Medidor[]){
    const seedAsociacion = await initialData.medidoresAsociados;
    const asociacion:MedidorAsociado[]=[];
    seedAsociacion.forEach((val,index)=>{
      asociacion.push(this.medidorAsociadoRepository.create({
        afiliado:afiliados[index],
        lecturaInicial:medidores[index].lecturaInicial,
        lecturaSeguimiento:medidores[index].lecturaMedidor,
        medidor:medidores[index],
        ...val,
      }))
    })
    return asociacion;
  }
  private async insertPlanillas(medidoresAsociados:MedidorAsociado[]){
    const seedPlanillas = initialData.planillas;
    const planillas:PlanillaLecturas[]=[];
    for(const medidor of medidoresAsociados){
      for(const {gestion} of seedPlanillas){
        planillas.push(this.planillaLecturasRepository.create({gestion,medidor}))
      }
    }
    return planillas;
  }
  
  lecturaSalvada:number=0
  medidorName:string='';
  private async insertLecturas(planillas:PlanillaLecturas[]){

    const fechaActual = new Date();
    const lecturasPasadas:PlanillaMesLectura[]=[];
   const lecturasActuales:PlanillaMesLectura[]=[];
    this.medidorName=planillas[0].medidor.medidor.nroMedidor;
    for(const planilla of planillas){
      if(this.medidorName !== planilla.medidor.medidor.nroMedidor){
        this.medidorName= planilla.medidor.medidor.nroMedidor;
        this.lecturaSalvada=0;
      }
      let lecturaSeguimiento = this.lecturaSalvada;
      // GESTIONES PASADAS
      if(planilla.gestion<fechaActual.getFullYear()){
        for(let index=0;index<12;index++){
          let lecturaGen = Math.round((Math.random()*100)+5);
          lecturaSeguimiento=lecturaSeguimiento+lecturaGen;
          const lectura = this.planillaMesLecturasRepository.create({
            lectura:lecturaSeguimiento,
            consumoTotal:(lecturaSeguimiento-this.lecturaSalvada),
            PlanillaMesLecturar:index===0?Mes.enero
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
            planilla,
            registrable:false,
            registrado:true,
            medicion:planilla.medidor.medidor.medicion,
            editable:false,
            tarifaGenerada:true,
          })
          lecturasPasadas.push(lectura);
          this.lecturaSalvada=lecturaSeguimiento;
        }
      }
      else  //GESTION ACTUAL
      for(let index=0;index<=fechaActual.getMonth()-1;index++){
        let lecturaGen = Math.round((Math.random()*100)+10);
        lecturaSeguimiento=lecturaSeguimiento+lecturaGen;
        //MES PASADO PARA REGISTRO ACTUAL
        if(index === (fechaActual.getMonth()-1)){
          const lectura = this.planillaMesLecturasRepository.create({
            PlanillaMesLecturar:
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
            planilla,
            registrable:true,
            registrado:false,
            editable:true,
          })
          lecturasActuales.push(lectura);
        }else{
          //MESES PASADOS
          const lectura= this.planillaMesLecturasRepository.create({
            lectura:lecturaSeguimiento,
            consumoTotal:(lecturaSeguimiento-this.lecturaSalvada),
            PlanillaMesLecturar:index===0?Mes.enero
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
            planilla,
            registrable:false,
            registrado:true,
            medicion:planilla.medidor.medidor.medicion,
            editable:false,
            tarifaGenerada:true,
          })
          lecturasPasadas.push(lectura);

        }
        
        this.lecturaSalvada=lecturaSeguimiento;
      }
      //await this.medidorRepository.save(planilla.medidor);
    }
    return {lecturasPasadas,lecturasActuales};
  }
  private readonly TARIFA_MINIMA = 10;
  private readonly LECTURA_MINIMA = 10;
  private readonly COSTO_ADICIONAL = 2;
  private async insertComprobantesPorPagarAnteriores(lecturas:PlanillaMesLectura[]){
    const comprobantesPorPagar:ComprobantePorPago[]=[];
    for(const lectu of lecturas){
      let fechaLimitePago:Date;
      if(lectu.PlanillaMesLecturar === Mes.diciembre){
        fechaLimitePago = new Date(lectu.planilla.gestion+1,0,25)
      }else{
        fechaLimitePago = new Date(lectu.planilla.gestion,
        lectu.PlanillaMesLecturar === Mes.enero?(1)
        :lectu.PlanillaMesLecturar === Mes.febrero?(2)
        :lectu.PlanillaMesLecturar === Mes.marzo?(3)
        :lectu.PlanillaMesLecturar === Mes.abril?(4)
        :lectu.PlanillaMesLecturar === Mes.mayo?(5)
        :lectu.PlanillaMesLecturar === Mes.junio?(6)
        :lectu.PlanillaMesLecturar === Mes.julio?(7)
        :lectu.PlanillaMesLecturar === Mes.agosto?(8)
        :lectu.PlanillaMesLecturar === Mes.septiembre?(9)
        :lectu.PlanillaMesLecturar === Mes.octubre?(10)
        :lectu.PlanillaMesLecturar === Mes.noviembre?(11)
        :0,25)
      }
      const comp = this.comprobantesPorPagarRepository.create({
        lectura:lectu,
        metodoRegistro:'GENERADO POR GENERACION DE RAIZ',
        monto:lectu.consumoTotal >this.LECTURA_MINIMA
                ? this.TARIFA_MINIMA +(lectu.consumoTotal -this.LECTURA_MINIMA) *this.COSTO_ADICIONAL
                : this.TARIFA_MINIMA,
        motivo: `PAGO DE SERVICIO, GESTION:${lectu.planilla.gestion}, MES: ${lectu.PlanillaMesLecturar}`,
        moneda: Monedas.Bs,
        fechaLimitePago
      })
      comprobantesPorPagar.push(comp);
    }
    return comprobantesPorPagar;
  }
  private async insertMedidores() {
    const seedMedidores = initialData.medidores;
    const medidores: Medidor[] = [];
    seedMedidores.forEach((medidor) => {
      medidores.push(
        this.medidorRepository.create({
          ...medidor,
        }),
      );
    });
    return medidores;
  }
  // private async insertFunctionsAll(menuName:string){
  //   const itemsMenus = await this.ItemMenuRepository.find(
  //     {where:
  //       [
  //       {linkMenu:'list'   },
  //       {linkMenu:'form'   },
  //       {linkMenu:'details'},
  //       {linkMenu:'edit'   },
  //       ]});
  //       // console.log(itemsMenus);
  //   const menu = await this.menuRepository.findOne({
  //     where:{linkMenu:ILike(`${menuName}%`)}
  //   });
  //   // console.log(menu);
  //   const itemMenuToMenu:ItemToMenu[]=[];
  //   itemsMenus.forEach(itemMenu=>{
  //     itemMenuToMenu.push(this.itemToMenuRepository.create({
  //       itemMenu,
  //       menu,
  //       nombre:
  //         itemMenu.linkMenu=='list'?`${menuName}`:
  //         itemMenu.linkMenu=='form'?`registrar ${menuName}`:
  //         itemMenu.linkMenu=='details'?`detalles ${menuName}`:
  //         itemMenu.linkMenu=='edit'?`editar ${menuName}`:'SIN NOMBRE DE LINK',
  //       visible: itemMenu.linkMenu === 'list'?true:false,
  //     }))
  //   })
  //   return itemMenuToMenu;
  // }
  // private async insertFuncionesLecturas(){
  //   const itemsMenu = await this.ItemMenuRepository.find({
  //     where:[{
  //       linkMenu:'list'
  //     },{
  //       linkMenu:'form'
  //     },{
  //       linkMenu:'details'
  //     }]});
  //   const menu = await this.menuRepository.findOneBy({
  //     linkMenu:'lecturas'
  //   });
  //   const items:ItemToMenu[]=[];
  //   for(let i=0;i<itemsMenu.length;i++){
  //     switch (i) {
  //       case 0:
  //         items.push(this.itemToMenuRepository.create({
  //           visible:true,
  //           itemMenu:itemsMenu[i],
  //           menu,
  //           nombre:'Registrar nuevas lecturas',
  //         }))
  //         break;
  //         case 1:
  //         items.push(this.itemToMenuRepository.create({
  //           visible:false,
  //           itemMenu:itemsMenu[i],
  //           menu,
  //           nombre:'Formulario de registro de lectura',
  //         }))
  //         break;
  //         case 2:
  //         items.push(this.itemToMenuRepository.create({
  //           visible:false,
  //           itemMenu:itemsMenu[i],
  //           menu,
  //           nombre:'detalles de registro de lectura',
  //         }))
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  //   return items;
  // }
  // private async insertFuncionesCobros(){
  //   const itemsMenu = await this.ItemMenuRepository.find({
  //     where:[{
  //       linkMenu:'list'
  //     },{
  //       linkMenu:'details'
  //     },{
  //       linkMenu:'cobrar'
  //     }]
  // });
  // const menu = await this.menuRepository.findOneBy({linkMenu:'cobros'});
  // const items:ItemToMenu[]=[];
  // for(let i=0;i<itemsMenu.length;i++){
  //   switch (i) {
  //     case 0:
  //       items.push(this.itemToMenuRepository.create({
  //         visible:true,
  //         itemMenu:itemsMenu[i],
  //         menu,
  //         nombre:'cobros de servicio',
  //       }))
  //       break;
  //       case 1:
  //       items.push(this.itemToMenuRepository.create({
  //         visible:false,
  //         itemMenu:itemsMenu[i],
  //         menu,
  //         nombre:'detalles de cobros de servicio',
  //       }))
  //       break;
  //       case 2:
  //       items.push(this.itemToMenuRepository.create({
  //         visible:false,
  //         itemMenu:itemsMenu[i],
  //         menu,
  //         nombre:'cobro de servicio',
  //       }))
  //       break;
  //     default:
  //       break;
  //   }
  // }
  // return items;
  // }

  // private async insertItemsFuncionesUsuario(){
  //   const itemMenuMedidor = await this.ItemMenuRepository.findOneBy({
  //       linkMenu:'medidores'
  //   });
  //   const itemMenuDeudas = await this.ItemMenuRepository.findOneBy({
  //       linkMenu:'deudas'
  //   });
  //   if(!itemMenuMedidor) console.log('NO HAY ITEM CONSULTAR');
  //   if(!itemMenuDeudas) console.log('NO HAY ITEM CONSULTAR');
  //   const menu = await this.menuRepository.findOneBy({
  //   linkMenu:'user'
  //   });
  //   if(!menu) console.log('NO HAY MENU CONSULTAR');

  //   const items:ItemToMenu[]=[];
  //   items.push(this.itemToMenuRepository.create({
  //     itemMenu:itemMenuMedidor,
  //     menu,
  //     nombre:'Consultar medidores',
  //     visible:true,
  //   }))
  //   items.push(this.itemToMenuRepository.create({
  //     itemMenu:itemMenuDeudas,
  //     menu,
  //     nombre:'Consultar deudas',
  //     visible:true,
  //   }))
  //   return items
  // }
  private async insertRelationsMenuToRole(menuName:string[],roleName:string){
    const menus:Menu[]=[]; 
    for(let i =0 ;i<menuName.length;i++){
      const menu = await this.menuRepository.findOne({where:{linkMenu:menuName[i]}})
      if(menu)
      menus.push(menu);
    }
    const role = await this.roleRepository.findOne({where:{nombre:roleName}});
    const menuToRole:MenuToRole[]=[];
    menus.forEach(menu=>{
      menuToRole.push(this.menuToRoleRepository.create({
        menu,
        role,
      }))
    })
    return menuToRole;
  }
  //TODO: REPARAR
  private async insertRolesToUsuario(roles:ValidRole[],username:string){
    const rolesExist:Role[]=[];
    for(const rol of roles){
      const role = await this.roleRepository.findOne({where:{nombre:rol}});
      if(role)
      rolesExist.push(role);
    }
    const usuario = await this.usuarioRepository.findOne({where:{username}});
    if(!usuario) return [];
    const roleToUsuario:RoleToUsuario[]=[];
    rolesExist.forEach(role=>{
      roleToUsuario.push(this.roleToUsuarioRepository.create({
        usuario,
        role
      }))
    });
    return roleToUsuario
  }
  async updateLecturaMedidores(){

    const asociados = await this.medidorAsociadoRepository.find({select:{id:true,lecturaSeguimiento:true,medidor:{id:true,nroMedidor:true,lecturaMedidor:true,},},relations:{medidor:true,}})
    const updates:MedidorAsociado[]=[];
    const updateMedidor:Medidor[]=[];
    for(const asc of asociados){
      const lastLectura = await this.planillaMesLecturasRepository.findOne(
        {where:
          {planilla:
            {medidor:{id:asc.id,
            }
          },registrado:true,
        },
          relations:{planilla:{medidor:{medidor:true,}}},order:{lectura:{direction:'DESC'}}})
      // console.log(lastLectura,'\n fin lectura', asc.id);
      const asoc = await this.medidorAsociadoRepository.preload({id:asc.id,lecturaSeguimiento:lastLectura.lectura});
      const medi = await this.medidorRepository.preload({id:asc.medidor.id,lecturaMedidor:lastLectura.lectura}) 
      updates.push(asoc);
      updateMedidor.push(medi)
    }
    return {updates,updateMedidor};
  }
  async updateStatusPerfiles(){
    const perfiles = await this.perfilRepository.find({
      relations:{usuario:true},
      select:{id:true,usuario:{id:true,isActive:true}}
    })
    const perfilActu:Promise<Perfil>[]=[];
    for(const per of perfiles){
      if(per.usuario){
        const preload = this.perfilRepository.preload({id:per.id,accessAcount:true,})
        perfilActu.push(preload);
      }
    }
    return perfilActu;
  }
  async executeSeedPartTwo() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //INSERT INTO RELATIONS TABLES
      // const datita = new Date();
      //INSERT INTO RELATIONS ITEMS TO MENU 
      // const itemToMenuRelationsPerfil = await this.insertFunctionsAll('perfiles')
      // await queryRunner.manager.save(itemToMenuRelationsPerfil);
      // const itemToMenuRelationsMedidores = await this.insertFunctionsAll('medidores')
      // await queryRunner.manager.save(itemToMenuRelationsMedidores);
      // const itemToMenuRelationsAsociaciones = await this.insertFunctionsAll('asociaciones')
      // await queryRunner.manager.save(itemToMenuRelationsAsociaciones);
      // const itemToMenuRelationsItemsMenu = await this.insertFunctionsAll('items-menu')
      // await queryRunner.manager.save(itemToMenuRelationsItemsMenu);
      // const itemToMenuRelationsMenu = await this.insertFunctionsAll('menus')
      // await queryRunner.manager.save(itemToMenuRelationsMenu);
      // const itemToMenuRelationsRoles = await this.insertFunctionsAll('roles')
      // await queryRunner.manager.save(itemToMenuRelationsRoles);

      // const consultasAF= await this.insertItemsFuncionesUsuario();
      // await queryRunner.manager.save(consultasAF)
      // const itemsCOBRRAR = await this.insertFuncionesCobros();
      // await queryRunner.manager.save(itemsCOBRRAR);
      // const lecturasDM = await this.insertFuncionesLecturas();
      // await queryRunner.manager.save(lecturasDM);
      // const itemToMenuRelationsCobros = await this.insertFunctionsAll('cobros')
      // await queryRunner.manager.save(itemToMenuRelationsCobros);
      // const itemToMenuRelationsUser = await this.insertFunctionsAll('user')
      // await queryRunner.manager.save(itemToMenuRelationsUser);
     
      //INSERT INTO RELATIONS MENU TO ROLE
      
      const menuToRoleRelationsRoot = await this.insertRelationsMenuToRole([ValidMenu.perfiles,ValidMenu.roles,ValidMenu.medidores,ValidMenu.asociaciones,ValidMenu.cobros,ValidMenu.lecturas,ValidMenu.consultar],ValidRole.root);
      await queryRunner.manager.save(menuToRoleRelationsRoot);
      
      const menuToRoleRelationsAdmin = await this.insertRelationsMenuToRole([ValidMenu.perfiles,ValidMenu.roles,ValidMenu.medidores,ValidMenu.asociaciones,ValidMenu.cobros,ValidMenu.lecturas],ValidRole.administrativo);
      await queryRunner.manager.save(menuToRoleRelationsAdmin);
      
      const menuToRoleRelationsContador = await this.insertRelationsMenuToRole([ValidMenu.perfiles,ValidMenu.roles,ValidMenu.medidores,ValidMenu.asociaciones,ValidMenu.cobros,ValidMenu.lecturas],ValidRole.secretaria);
      await queryRunner.manager.save(menuToRoleRelationsContador);

      // const menuToRoleRelationsLecturador = await this.insertRelationsMenuToRole(['medidores-agua','asociaciones','lecturas'],'lecturador');
      // await queryRunner.manager.save(menuToRoleRelationsLecturador);
      
      const menuToRoleRelationsUser = await this.insertRelationsMenuToRole([ValidRole.afiliado],ValidRole.root);
      await queryRunner.manager.save(menuToRoleRelationsUser);
      

      //ADD ROLES TO USUARIO
      const roleToUsuarioAdmin = await this.insertRolesToUsuario([ValidRole.root,ValidRole.administrativo],'admin');
      await queryRunner.manager.save(roleToUsuarioAdmin);

      const roleToUsuarioAdministrativo = await this.insertRolesToUsuario([ValidRole.administrativo],'administrativo');
      await queryRunner.manager.save(roleToUsuarioAdministrativo);

      const roleToUsuarioAdministrativoSecretaria = await this.insertRolesToUsuario([ValidRole.secretaria],'secretaria');
      await queryRunner.manager.save(roleToUsuarioAdministrativoSecretaria);

      // const roleToUsuarioAdministrativoLecturador = await this.insertRolesToUsuario(['lecturador','user'],'lecturador');
      // await queryRunner.manager.save(roleToUsuarioAdministrativoLecturador);

      const roleToUsuarioContador = await this.insertRolesToUsuario([ValidRole.afiliado],'afiliado2');
      await queryRunner.manager.save(roleToUsuarioContador);

      const roleToUsuarioAfiliadoUser1 = await this.insertRolesToUsuario([ValidRole.afiliado],'user');
      await queryRunner.manager.save(roleToUsuarioAfiliadoUser1);

      const roleToUsuarioAfiliadoUser2 = await this.insertRolesToUsuario([ValidRole.afiliado],'afiliado');
      await queryRunner.manager.save(roleToUsuarioAfiliadoUser2);

      await queryRunner.commitTransaction();
      return { OK: true, msg: 'SEED PART TWO EXECUTE' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
  async executeSeedPartThree(){
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
    const asociados = await this.medidorAsociadoRepository.find(
      {
        where:{
        planillas:{lecturas:{registrado:true}}
        },
        select:{
        id:true,
        lecturaSeguimiento:true,
        registrable:true,
        planillas:{
          id:true,isActive:true,
          lecturas:{
            id:true,
            lectura:true,
            consumoTotal:true,
            PlanillaMesLecturar:true,
          }
        },
        medidor:{id:true,nroMedidor:true,lecturaMedidor:true}
      },
      relations:{medidor:true,planillas:{lecturas:true}}
    })
    for(const asc of asociados){
      const lastLectura = await this.planillaMesLecturasRepository.findOne(
        {where:{planilla:{medidor:{id:asc.id,}},registrado:true},
        relations:{planilla:{medidor:{medidor:true,}}},
        order:{lectura:{direction:'DESC'}}})
      await queryRunner.manager.update(MedidorAsociado,asc.id,{lecturaSeguimiento:lastLectura.lectura})
      await queryRunner.manager.update(Medidor,asc.medidor.id,{lecturaMedidor:lastLectura.lectura})
    }
    const perfiles = await this.perfilRepository.find({
      relations:{usuario:true},
      where:{
        usuario:{isActive:true}
      }
    })
    for(const per of perfiles){
      if(per.usuario){
        await queryRunner.manager.update(Perfil,per.id,{accessAcount:true});
      }
    }
    const perAfiliados = await this.perfilRepository.find({
      relations:{afiliado:true}
    })
    for(const per of perAfiliados){
      if(per.afiliado){
        await queryRunner.manager.update(Perfil,per.id,{isAfiliado:true});

      }
    }
    const medidores = await this.medidorRepository.find({
      where:{medidorAsociado:{isActive:true}},
      relations:{medidorAsociado:true}
    });
    for(const med of medidores){
      for(const asc of med.medidorAsociado){
        if(asc.isActive){
          await queryRunner.manager.update(Medidor,med.id,{funcionamiento:true});
          break;
        }
      }
    }
      await queryRunner.commitTransaction();
      return { OK: true, msg: 'SEED PART THREE EXECUTE' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }

  }
  async registrarSeeds3(){
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }
}
