import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Categoria } from '../../categoria/entities/categoria.entity';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'text', array: true, nullable: true })
  imagenes: string[];

  @CreateDateColumn({
    name: 'fecha_publicacion',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaPublicacion: Date;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @Column()
  enlace: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
