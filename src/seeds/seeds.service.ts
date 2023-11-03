import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, QueryRunner, Repository } from 'typeorm';
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

@Injectable()
export class SeedsService {
  constructor(
    @InjectRepository(Perfil)
    private readonly perfilRepository:Repository<Perfil>,
    @InjectRepository(Afiliado)
    private readonly afiliadoRepository: Repository<Afiliado>,
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
      //CON DEPDENDENCIA
      const afiliadosSave = await this.insertAfiliados(perfilesSave);
      await queryRunner.manager.save(afiliadosSave);
      const usuariosSave = await this.insertUsuarios(perfilesSave);
      await queryRunner.manager.save(usuariosSave);
      
      const medidoresSave = await this.insertMedidores(afiliadosSave);
      await queryRunner.manager.save(medidoresSave);
      const planillasSave = await this.insertPlanillas(medidoresSave);
      await queryRunner.manager.save(planillasSave)
      const lecturasSave = await this.insertLecturas(planillasSave);
      await queryRunner.manager.save(lecturasSave);
      const comprobantesPorPagar = await this.insertComprobantesPorPagarAnteriores(lecturasSave);
      await queryRunner.manager.save(comprobantesPorPagar);
      const anioSeguimientoSave = await this.insertAnioSeguimientos();
      await queryRunner.manager.save(anioSeguimientoSave);
      const mesesSeguimientoSave = await this.insertMesSeguimiento(anioSeguimientoSave);
      await queryRunner.manager.save(mesesSeguimientoSave);
      // console.log('hola:3');
      await queryRunner.commitTransaction();
      return { OK: true, msg: 'SEED EXECUTE' };

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
    const yearSeg = this.anioSeguimientoLecturaRepository.create({anio:new Date().getFullYear()});
    return yearSeg;
  }
  private async insertMesSeguimiento(anioSeguimientoSave:AnioSeguimientoLectura){
    const fechaActual = new Date();
    //const anioSeguimiento = await this.anioSeguimientoLecturaRepository.findOneBy({anio:fechaActual.getFullYear()});
    const meses:MesSeguimientoRegistroLectura[]=[];
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
          anioSeguimiento:anioSeguimientoSave,
          fechaRegistroLecturas: new Date(fechaActual.getFullYear(),index+1,2,8,0,0,0),
          fechaFinRegistroLecturas: new Date(fechaActual.getFullYear(),index+1,28,12,59,59,0),
        }
      ) 
      meses.push(mes);
    }
    return meses;
  }
  private async insertPlanillas(medidores:Medidor[]){
    const seedPlanillas = initialData.planillas;
    const planillas:PlanillaLecturas[]=[];
    medidores.forEach(medidor=>{
      planillas.push(this.planillaLecturasRepository.create({...seedPlanillas[0],medidor}))
    })
    return planillas;
  }
  private async insertLecturas(planillas:PlanillaLecturas[]){
    const fechaActual = new Date();
    const lecturas:MesLectura[]=[];
    for(const planilla of planillas){
      let lecturaSeguimiento =0;
      for(let index=0;index<fechaActual.getMonth();index++){
        let lecturaGen = Math.round((Math.random()*100)+10);
        lecturaSeguimiento=lecturaSeguimiento+lecturaGen;
        const lectura = this.mesLecturaRepository.create({
          lectura:lecturaSeguimiento,
          consumoTotal:(lecturaSeguimiento-planilla.medidor.ultimaLectura),
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
        planilla.medidor.ultimaLectura=lecturaSeguimiento;
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
  private async insertMedidores(afiliados: Afiliado[]) {
    const seedMedidores = initialData.medidores;
    const medidores: Medidor[] = [];
    seedMedidores.forEach((medidor, index) => {
      medidores.push(
        this.medidorRepository.create({
          ...medidor,
          afiliado: afiliados[index],
        }),
      );
    });
    return medidores;
  }
  private async insertRelationsItemMenuToMenu(itemMenuName:string,menuName:string){
    const itemsMenus = await this.ItemMenuRepository.find({where:{linkMenu:Like(`${itemMenuName}%`)}});
    const menu = await this.menuRepository.findOne({where:{linkMenu:Like(`${menuName}%`)}});
    const itemMenuToMenu:ItemToMenu[]=[];
    itemsMenus.forEach(itemMenu=>{
      itemMenuToMenu.push(this.itemToMenuRepository.create({
        itemMenu,
        menu
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
  
  async executeSeedPartTwo() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //INSERT INTO RELATIONS TABLES
      // const datita = new Date();
      //INSERT INTO RELATIONS ITEMS TO MENU 
      const itemToMenuRelationsPerfil = await this.insertRelationsItemMenuToMenu('perfil','perfiles')
      await queryRunner.manager.save(itemToMenuRelationsPerfil);
      const itemToMenuRelationsItemsMenu = await this.insertRelationsItemMenuToMenu('item-menu','items-menu')
      await queryRunner.manager.save(itemToMenuRelationsItemsMenu);
      const itemToMenuRelationsMenu = await this.insertRelationsItemMenuToMenu('menu','menus')
      await queryRunner.manager.save(itemToMenuRelationsMenu);
      const itemToMenuRelationsRoles = await this.insertRelationsItemMenuToMenu('rol','roles')
      await queryRunner.manager.save(itemToMenuRelationsRoles);
      const itemToMenuRelationsMedidores = await this.insertRelationsItemMenuToMenu('medidor','medidores')
      await queryRunner.manager.save(itemToMenuRelationsMedidores);
      //INSERT INTO RELATIONS MENU TO ROLE
      
      const menuToRoleRelationsRoot = await this.insertRelationsMenuToRole(['perfiles','menus','items-menu','roles','medidores-agua'],'root');
      await queryRunner.manager.save(menuToRoleRelationsRoot);
      
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
