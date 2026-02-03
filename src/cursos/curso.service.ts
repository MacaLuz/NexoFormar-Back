import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Curso } from './entities/curso.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Categoria } from 'src/categoria/entities/categoria.entity';

import { CreateCursoDto } from './dto/createCursoDto';
import { UpdateCursoDto } from './dto/updateCursoDto';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async create(dto: CreateCursoDto, userId: number) {
    const usuario = await this.usuarioRepo.findOneBy({ id: userId });

    const categoria = await this.categoriaRepo.findOneBy({
      id: dto.categoria_id,
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const nuevoCurso = this.cursoRepo.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      imagenes: dto.imagenes,
      enlace: dto.enlace,
      usuario,
      categoria,
    });

    return this.cursoRepo.save(nuevoCurso);
  }

  async findAll() {
    return this.cursoRepo.find({
      relations: ['usuario', 'categoria'],
      order: { fechaPublicacion: 'DESC' },
    });
  }

  async buscarPorCategoria(categoriaId: number) {
    return this.cursoRepo.find({
      where: {
        categoria: { id: categoriaId },
      },
      relations: ['usuario', 'categoria'],
      order: { fechaPublicacion: 'DESC' },
    });
  }

  async buscarPorUsuario(usuarioId: number) {
    return this.cursoRepo.find({
      where: {
        usuario: { id: usuarioId },
      },
      relations: ['usuario', 'categoria'],
      order: { fechaPublicacion: 'DESC' },
    });
  }

  async findOne(id: number) {
    const curso = await this.cursoRepo.findOne({
      where: { id },
      relations: ['usuario', 'categoria'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    return curso;
  }

  async update(id: number, dto: UpdateCursoDto) {
    const curso = await this.findOne(id);

    if (dto.categoria_id) {
      const categoria = await this.categoriaRepo.findOneBy({
        id: dto.categoria_id,
      });

      if (!categoria) {
        throw new NotFoundException('Categoría no encontrada');
      }

      curso.categoria = categoria;
    }

    const { categoria_id, usuario_id, ...campos } = dto as any;
    Object.assign(curso, campos);

    return this.cursoRepo.save(curso);
  }

  async updateSiAutorizado(
    id: number,
    dto: UpdateCursoDto,
    usuarioId: number,
    rol: string,
  ) {
    const curso = await this.cursoRepo.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    const esAdmin = rol === 'ADMIN';
    const esPropietario = curso.usuario.id === usuarioId;

    if (!esAdmin && !esPropietario) {
      throw new ForbiddenException(
        'No estás autorizado para modificar este curso',
      );
    }

    return this.update(id, dto);
  }

  async buscarPersonalizado(filtro: { categoriaId?: string; texto?: string }) {
    const query = this.cursoRepo
      .createQueryBuilder('curso')
      .leftJoinAndSelect('curso.usuario', 'usuario')
      .leftJoinAndSelect('curso.categoria', 'categoria')
      .orderBy('curso.fechaPublicacion', 'DESC');

    if (filtro.categoriaId) {
      const categoriaIds = filtro.categoriaId
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));

      if (categoriaIds.length > 0) {
        query.andWhere('categoria.id IN (:...categoriaIds)', {
          categoriaIds,
        });
      }
    }

    if (filtro.texto) {
      query.andWhere(
        '(LOWER(curso.titulo) LIKE :texto OR LOWER(curso.descripcion) LIKE :texto)',
        { texto: `%${filtro.texto.toLowerCase()}%` },
      );
    }

    return query.getMany();
  }

  async remove(id: number) {
    const curso = await this.cursoRepo.findOne({
      where: { id },
    });

    if (!curso) {
      throw new NotFoundException(`No se encontró un curso con id ${id}`);
    }

    await this.cursoRepo.softDelete(id);
    return { success: true };
  }

  async removeSiAutorizado(id: number, usuarioId: number, rol: string) {
    const curso = await this.cursoRepo.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    const esAdmin = rol === 'ADMIN';
    const esPropietario = curso.usuario.id === usuarioId;

    if (!esAdmin && !esPropietario) {
      throw new ForbiddenException(
        'No estás autorizado para borrar este curso',
      );
    }

    await this.cursoRepo.softDelete(id);
    return { success: true };
  }
}
