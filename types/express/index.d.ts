import { Menu } from '../../src/manager/menus/menus/entities/menu.entity';
declare namespace Express {
  interface Request {
    menu: Menu;
  }
}
