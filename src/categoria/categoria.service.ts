import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { UpdateCategoriaDto } from './dto/updateCatDto';
import { CreateCategoriaDto } from './dto/createCatDto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepo: Repository<Categoria>,
  ) {}

  async create(dto: CreateCategoriaDto) {
    const nombre = dto?.nombre?.trim();
    if (!nombre) throw new BadRequestException('El nombre es obligatorio');

    const nueva = this.categoriaRepo.create({ nombre });
    return this.categoriaRepo.save(nueva);
  }

  findAll() {
    return this.categoriaRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const cat = await this.categoriaRepo.findOneBy({ id });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    await this.findOne(id); 
    await this.categoriaRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);

    try {
      return await this.categoriaRepo.remove(categoria);
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new BadRequestException(
          'No se puede eliminar la categoría porque tiene cursos asociados.',
        );
      }

      console.error('Error inesperado al eliminar categoría:', error);
      throw new InternalServerErrorException(
        'Error inesperado al eliminar la categoría.',
      );
    }
  }
}
