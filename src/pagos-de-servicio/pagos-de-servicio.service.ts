import { Injectable } from '@nestjs/common';
import { CreatePagosDeServicioDto } from './dto/create-pagos-de-servicio.dto';
import { UpdatePagosDeServicioDto } from './dto/update-pagos-de-servicio.dto';

@Injectable()
export class PagosDeServicioService {
  create(createPagosDeServicioDto: CreatePagosDeServicioDto) {
    return 'This action adds a new pagosDeServicio';
  }

  findAll() {
    return `This action returns all pagosDeServicio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pagosDeServicio`;
  }

  update(id: number, updatePagosDeServicioDto: UpdatePagosDeServicioDto) {
    return `This action updates a #${id} pagosDeServicio`;
  }

  remove(id: number) {
    return `This action removes a #${id} pagosDeServicio`;
  }
}
