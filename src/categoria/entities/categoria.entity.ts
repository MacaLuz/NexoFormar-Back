import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Curso } from '../../cursos/entities/curso.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => Curso, (curso) => curso.categoria)
  cursos: Curso[];
}
