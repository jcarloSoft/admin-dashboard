import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent {
  usuarios = [
    { id: 1, nombre: 'Diego Bueno', correo: 'dbueno@gmail.com' },
    { id: 2, nombre: 'Carlos Hilario', correo: 'chilario@gmail.com' },
    { id: 3, nombre: 'Lisset Chicoma', correo: 'lchicoma@gmail.com' }
  ];

  editarUsuario(usuario: any) {
  }

  eliminarUsuario(id: number) {
    this.usuarios = this.usuarios.filter(user => user.id !== id);
  }
}
