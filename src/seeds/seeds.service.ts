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
import { ItemToMenu } from 'src/manager/menus/items-to-menu/entities/item-to-menu.entity';
import { MenuToRole } from 'src/manager/roles/menu-to-role/entities/menuToRole.entity';
import { RoleToUsuario } from 'src/auth/modules/usuarios/roles-to-usuario/entities/role-to-usuario.entity';
import { AnioSeguimientoLectura } from 'src/medidores-agua/entities/anio-seguimiento-lecturas.entity';
import { MesSeguimientoRegistroLectura } from 'src/medidores-agua/entities/mes-seguimiento-registro-lectura.entity';
import { PlanillaLecturas } from 'src/medidores-agua/entities/planilla-lecturas.entity';
import { Mes, Monedas } from 'src/interfaces/enum/enum-entityes';
import { MesLectura } from 'src/medidores-agua/entities/mes-lectura.entity';
import { ComprobantePorPago } from 'src/pagos-de-servicio/entities';
import { MedidorAsociado } from 'src/medidores-agua/entities/medidor-asociado.entity';

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
    @InjectRepository(ItemToMenu)
    private readonly itemToMenuRepository: Repository<ItemToMenu>,
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
    @InjectRepository(MesLectura)
    private readonly mesLecturaRepository: Repository<MesLectura>,
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
      const perfilesSave = await this.insertPerfiles();
      await queryRunner.manager.save(perfilesSave);
      const itemsMenusSave = await this.insertItemsMenu();
      await queryRunner.manager.save(itemsMenusSave);
      const menusSave = await this.insertMenus();
      await queryRunner.manager.save(menusSave);
      const rolesSave = await this.insertRoles();
      await queryRunner.manager.save(rolesSave);
      //DEPENDENCIES
      const afiliadosSave = await this.insertAfiliados(perfilesSave);
      await queryRunner.manager.save(afiliadosSave);
      const usuariosSave = await this.insertUsuarios(perfilesSave);
      await queryRunner.manager.save(usuariosSave);
      const medidoresSave = await this.insertMedidores();
      await queryRunner.manager.save(medidoresSave);

      const anioSeguimientoSave = await this.insertAnioSeguimientos();
      await queryRunner.manager.save(anioSeguimientoSave);
      const mesesSeguimientoSave = await this.insertMesSeguimiento(anioSeguimientoSave);
      await queryRunner.manager.save(mesesSeguimientoSave);
      const medidoresAsociadosSave = await this.insertAsociacionMedidoresWithAfiliado(afiliadosSave,medidoresSave);
      await queryRunner.manager.save(medidoresAsociadosSave);
      const planillasSave = await this.insertPlanillas(medidoresAsociadosSave);
      await queryRunner.manager.save(planillasSave)
      const lecturasSave = await this.insertLecturas(planillasSave);
      await queryRunner.manager.save(lecturasSave);
      const comprobantesPorPagar = await this.insertComprobantesPorPagarAnteriores(lecturasSave);
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
  private async deleteTables() {
    const AfiliadosList = await this.afiliadoRepository.find();
    const ItemsMenuList = await this.ItemMenuRepository.find();
    const MenusList = await this.menuRepository.find();
    const RolesList = await this.roleRepository.find();
    const UsuariosList = await this.usuarioRepository.find();
    const medidoresList = await this.medidorRepository.find();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // console.log('hola delete:3');
      // console.log(queryRunner);
      // console.log('hola delete afiliados :3');
      for(let val of ItemsMenuList)await queryRunner.manager.delete(ItemMenu,{id:val.id});
      for(let val of MenusList)await queryRunner.manager.delete(Menu,{id:val.id});
      for(let val of RolesList)await queryRunner.manager.delete(Role,{id:val.id});
      for(let val of UsuariosList)await queryRunner.manager.delete(Usuario,{id:val.id});
      for(let val of medidoresList)await queryRunner.manager.delete(Medidor,{id:val.id});
      for(let val of AfiliadosList){ console.log('val',val);await queryRunner.manager.delete(Afiliado,{id:val.id});}
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log('hola delete error 500 :3');
      await queryRunner.rollbackTransaction();
      await queryRunner.release()
      this.commonService.handbleDbErrors(error);
    } finally{
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
  private async insertItemsMenu() {
    const seedItemsMenu = initialData.itemsMenu;
    const itemsMenus: ItemMenu[] = [];
    seedItemsMenu.forEach((item) => {
      itemsMenus.push(this.ItemMenuRepository.create(item));
    });
    return itemsMenus;
  }
  private async insertMenus() {
    const seedMenus = initialData.menus;
    const menus: Menu[] = [];
    seedMenus.forEach((menu) => {
      menus.push(this.menuRepository.create(menu));
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
    const planillas = await initialData.planillas;

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
    const seedPlanillas = await initialData.planillas;
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
    const lecturas:MesLectura[]=[];
    this.medidorName=planillas[0].medidor.medidor.nroMedidor;
    for(const planilla of planillas){
      if(this.medidorName !== planilla.medidor.medidor.nroMedidor){
        this.medidorName= planilla.medidor.medidor.nroMedidor;
        this.lecturaSalvada=0;
      }
      let lecturaSeguimiento = this.lecturaSalvada;
      if(planilla.gestion<fechaActual.getFullYear()){
        for(let index=0;index<12;index++){
          let lecturaGen = Math.round((Math.random()*100)+5);
          lecturaSeguimiento=lecturaSeguimiento+lecturaGen;
          const lectura = this.mesLecturaRepository.create({
            lectura:lecturaSeguimiento,
            consumoTotal:(lecturaSeguimiento-this.lecturaSalvada),
            mesLecturado:index===0?Mes.enero
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
          })
          lecturas.push(lectura);
          this.lecturaSalvada=lecturaSeguimiento;
        }
      }
      else 
      for(let index=0;index<fechaActual.getMonth()-1;index++){
        let lecturaGen = Math.round((Math.random()*100)+10);
        lecturaSeguimiento=lecturaSeguimiento+lecturaGen;
        const lectura = this.mesLecturaRepository.create({
          lectura:lecturaSeguimiento,
          consumoTotal:(lecturaSeguimiento-this.lecturaSalvada),
          mesLecturado:index===0?Mes.enero
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
        })
        lecturas.push(lectura);
        this.lecturaSalvada=lecturaSeguimiento;
      }
      //await this.medidorRepository.save(planilla.medidor);
    }
    return lecturas;
  }
  private readonly TARIFA_MINIMA = 10;
  private readonly LECTURA_MINIMA = 10;
  private readonly COSTO_ADICIONAL = 2;
  private async insertComprobantesPorPagarAnteriores(lecturas:MesLectura[]){
    const comprobantesPorPagar:ComprobantePorPago[]=[];
    for(const lectu of lecturas){
      const comp = this.comprobantesPorPagarRepository.create({
        lectura:lectu,
        metodoRegistro:'GENERADO POR GENERACION DE RAIZ',
        monto:lectu.consumoTotal >this.LECTURA_MINIMA
                ? this.TARIFA_MINIMA +(lectu.consumoTotal -this.LECTURA_MINIMA) *this.COSTO_ADICIONAL
                : this.TARIFA_MINIMA,
        motivo: `PAGO DE SERVICIO, GESTION:${lectu.planilla.gestion}, MES: ${lectu.mesLecturado}`,
        moneda: Monedas.Bs,
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
  private async insertFunctionsAll(menuName:string){
    const itemsMenus = await this.ItemMenuRepository.find(
      {where:
        [{linkMenu:'list'   },
        {linkMenu:'form'   },
        {linkMenu:'details'},
        {linkMenu:'edit'   },
        ]});
        // console.log(itemsMenus);
    const menu = await this.menuRepository.findOne({
      where:{linkMenu:ILike(`${menuName}%`)}
    });
    // console.log(menu);
    const itemMenuToMenu:ItemToMenu[]=[];
    itemsMenus.forEach(itemMenu=>{
      itemMenuToMenu.push(this.itemToMenuRepository.create({
        itemMenu,
        menu,
        nombre:
          itemMenu.linkMenu=='list'?`${menuName}`:
          itemMenu.linkMenu=='form'?`registrar ${menuName}`:
          itemMenu.linkMenu=='details'?`detalles ${menuName}`:
          itemMenu.linkMenu=='edit'?`editar ${menuName}`:'SIN NOMBRE DE LINK'
      }))
    })
    return itemMenuToMenu;
  }
  private async insertRelationsMenuToRole(menuName:string[],roleName:string){
    const menus:Menu[]=[]; 
    menuName.forEach(async menuName=>{
      const menu =await this.menuRepository.findOne({where:{linkMenu:menuName}})
      if(menu)
      menus.push(menu);
    })
    const role = await this.roleRepository.findOne({where:{nombre:roleName}});
    const menuToRole:MenuToRole[]=[];
    menus.forEach(menu=>{
      menuToRole.push(this.menuToRoleRepository.create({
        menu,
        role
      }))
    })
    return menuToRole;
  }
  //TODO: REPARAR
  private async insertRolesToUsuario(roles:string[],username:string){
    const rolesExist:Role[]=[];
    roles.forEach(async roleName=>{
      const role = await this.roleRepository.findOne({where:{nombre:roleName}});
      rolesExist.push(role);
    })
    const usuario = await this.usuarioRepository.findOne({where:{username}})
    const roleToUsuario:RoleToUsuario[]=[];
    rolesExist.forEach(role=>{
      roleToUsuario.push(this.roleToUsuarioRepository.create({
        usuario,
        role
      }))
    })
    return roleToUsuario
  }
  async updateLecturaMedidores(){

    const asociados = await this.medidorAsociadoRepository.find({select:{id:true,lecturaSeguimiento:true,medidor:{id:true,nroMedidor:true,lecturaMedidor:true,},},relations:{medidor:true,}})
    const updates:MedidorAsociado[]=[];
    const updateMedidor:Medidor[]=[];
    for(const asc of asociados){
      const lastLectura = await this.mesLecturaRepository.findOne({where:{planilla:{medidor:{id:asc.id,}}},relations:{planilla:{medidor:{medidor:true,}}},order:{lectura:{direction:'DESC'}}})
      // console.log(lastLectura,'\n fin lectura', asc.id);
      const asoc = await this.medidorAsociadoRepository.preload({id:asc.id,lecturaSeguimiento:lastLectura.lectura});
      const medi = await this.medidorRepository.preload({id:asc.medidor.id,lecturaMedidor:lastLectura.lectura}) 
      updates.push(asoc);
      updateMedidor.push(medi)
    }
    return {updates,updateMedidor};
  }
  async executeSeedPartTwo() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //INSERT INTO RELATIONS TABLES
      // const datita = new Date();
      //INSERT INTO RELATIONS ITEMS TO MENU 
      const itemToMenuRelationsPerfil = await this.insertFunctionsAll('perfiles')
      await queryRunner.manager.save(itemToMenuRelationsPerfil);
      const itemToMenuRelationsMedidores = await this.insertFunctionsAll('medidores')
      await queryRunner.manager.save(itemToMenuRelationsMedidores);
      const itemToMenuRelationsItemsMenu = await this.insertFunctionsAll('items-menu')
      await queryRunner.manager.save(itemToMenuRelationsItemsMenu);
      const itemToMenuRelationsMenu = await this.insertFunctionsAll('menus')
      await queryRunner.manager.save(itemToMenuRelationsMenu);
      const itemToMenuRelationsRoles = await this.insertFunctionsAll('roles')
      await queryRunner.manager.save(itemToMenuRelationsRoles);
      // const itemToMenuRelationsCobros = await this.insertFunctionsAll('cobros')
      // await queryRunner.manager.save(itemToMenuRelationsCobros);
      // const itemToMenuRelationsUser = await this.insertFunctionsAll('user')
      // await queryRunner.manager.save(itemToMenuRelationsUser);
      //INSERT INTO RELATIONS MENU TO ROLE
      
      const menuToRoleRelationsRoot = await this.insertRelationsMenuToRole(['perfiles','menus','items-menu','roles','medidores-agua','cobros'],'root');
      await queryRunner.manager.save(menuToRoleRelationsRoot);
      
      const menuToRoleRelationsAdmin = await this.insertRelationsMenuToRole(['perfiles','menus','items-menu','roles'],'admin');
      await queryRunner.manager.save(menuToRoleRelationsAdmin);
      
      const menuToRoleRelationsContador = await this.insertRelationsMenuToRole(['perfiles','medidores-agua','cobros'],'contador');
      await queryRunner.manager.save(menuToRoleRelationsContador);
      
      const menuToRoleRelationsUser = await this.insertRelationsMenuToRole(['user'],'user');
      await queryRunner.manager.save(menuToRoleRelationsUser);
      
      const roleToUsuarioAdmin = await this.insertRolesToUsuario(['root','admin'],'admin');
      await queryRunner.manager.save(roleToUsuarioAdmin);
      const roleToUsuarioAdministrativo = await this.insertRolesToUsuario(['administrativo'],'administrativo');
      await queryRunner.manager.save(roleToUsuarioAdministrativo);
      const roleToUsuarioAdministrativoContador = await this.insertRolesToUsuario(['administrativo','contador'],'contador');
      await queryRunner.manager.save(roleToUsuarioAdministrativoContador);
      const roleToUsuarioContador = await this.insertRolesToUsuario(['contador'],'afiliado2');
      await queryRunner.manager.save(roleToUsuarioContador);
      const roleToUsuarioAfiliadoUser1 = await this.insertRolesToUsuario(['afiliado','user'],'user');
      await queryRunner.manager.save(roleToUsuarioAfiliadoUser1);
      const roleToUsuarioAfiliadoUser2 = await this.insertRolesToUsuario(['afiliado','user'],'afiliado');
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
      const saved= await this.updateLecturaMedidores();
      await queryRunner.manager.save(saved.updates)
      await queryRunner.manager.save(saved.updateMedidor)
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
