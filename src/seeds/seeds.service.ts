import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, QueryRunner, Repository } from 'typeorm';
import { initialData } from './data/data';
import { CommonService } from '../common/common.service';
import { Menu } from '../manager/menus/menus/entities/menu.entity';
import { ItemMenu } from '../manager/menus/items-menu/entities/item-menu.entity';
import { Role } from '../manager/roles/roles/entities/role.entity';
import { Afiliado } from '../auth/modules/afiliados/entities/afiliado.entity';
import { Usuario } from 'src/auth/modules/usuarios/entities';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { ItemToMenu } from 'src/manager/menus/items-to-menu/entities/item-to-menu.entity';
import { MenuToRole } from 'src/manager/roles/menu-to-role/entities/menuToRole.entity';
import { RoleToUsuario } from 'src/auth/modules/usuarios/roles-to-usuario/entities/role-to-usuario.entity';

@Injectable()
export class SeedsService {
  constructor(
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
      const afiliadosSave = await this.insertAfiliados();
      await queryRunner.manager.save(afiliadosSave);
      const itemsMenusSave = await this.insertItemsMenu();
      await queryRunner.manager.save(itemsMenusSave);
      const menusSave = await this.insertMenus();
      await queryRunner.manager.save(menusSave);
      const rolesSave = await this.insertRoles();
      await queryRunner.manager.save(rolesSave);
      const usuariosSave = await this.insertUsuarios(afiliadosSave);
      await queryRunner.manager.save(usuariosSave);
      
      //INSERT INTO RELATIONS TABLES
      
      //INSERT INTO RELATIONS ITEMS TO MENU 
      const itemToMenuRelationsAfiliado = await this.insertRelationsItemMenuToMenu('afiliado','afiliado')
      await queryRunner.manager.save(itemToMenuRelationsAfiliado);
      const itemToMenuRelationsItemsMenu = await this.insertRelationsItemMenuToMenu('item-menu','items-menu')
      await queryRunner.manager.save(itemToMenuRelationsItemsMenu);
      const itemToMenuRelationsMenu = await this.insertRelationsItemMenuToMenu('menu','menus')
      await queryRunner.manager.save(itemToMenuRelationsMenu);
      const itemToMenuRelationsRoles = await this.insertRelationsItemMenuToMenu('role','roles')
      await queryRunner.manager.save(itemToMenuRelationsRoles);
      const itemToMenuRelationsUsuarios = await this.insertRelationsItemMenuToMenu('usuario','usuarios')
      await queryRunner.manager.save(itemToMenuRelationsUsuarios);
      const itemToMenuRelationsMedidores = await this.insertRelationsItemMenuToMenu('medidor','medidores')
      await queryRunner.manager.save(itemToMenuRelationsMedidores);
      //INSERT INTO RELATIONS MENU TO ROLE
      
      const menuToRoleRelationsRoot = await this.insertRelationsMenuToRole(['afiliados','menus','items-menu','roles','usuarios','medidores'],'root');
      await queryRunner.manager.save(menuToRoleRelationsRoot);
      
      const roleToUsuario = await this.insertRolesToUsuario(['root'],'admin');
      await queryRunner.manager.save(roleToUsuario);
      
      const medidoresSave = await this.insertMedidores(afiliadosSave);
      await queryRunner.manager.save(medidoresSave);
      console.log('hola:3');
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
  private async insertAfiliados() {
    const seedAfiliados = initialData.afiliados;
    const afiliados: Afiliado[] = [];
    seedAfiliados.forEach((afi) => {
      afiliados.push(this.afiliadoRepository.create(afi));
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
  private async insertUsuarios(afiliados: Afiliado[]) {
    const seedUsuarios = initialData.usuarios;
    const usuarios: Usuario[] = [];
    seedUsuarios.forEach((usuario, index) => {
      usuarios.push(
        this.usuarioRepository.create({
          ...usuario,
          afiliado: afiliados[index],
        }),
      );
    });
    return usuarios;
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
  private async insertRolesToUsuario(roles:string[],userName:string){
    const rolesExist:Role[]=[];
    roles.forEach(async roleName=>{
      const role = await this.roleRepository.findOne({where:{nombre:roleName}});
      if(role)
      rolesExist.push(role);
    })
    const usuario = await this.usuarioRepository.findOne({where:{userName}})
    const roleToUsuario:RoleToUsuario[]=[];
    rolesExist.forEach(role=>{
      roleToUsuario.push(this.roleToUsuarioRepository.create({
        usuario,
        role
      }))
    })
    return roleToUsuario
  }
  
}
