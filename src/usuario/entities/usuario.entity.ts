import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Curso } from 'src/cursos/entities/curso.entity';
import { Exclude } from 'class-transformer';

export enum RolUsuario {
  ADMIN = 'ADMIN',
  NORMAL = 'NORMAL',
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  BANEADO = 'BANEADO',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  correo: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'text', nullable: true })
  fotoUrl?: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.NORMAL })
  rol: RolUsuario;

  @Column({ type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.ACTIVO })
  estado: EstadoUsuario;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @OneToMany(() => Curso, (curso) => curso.usuario)
  cursos: Curso[];
}
