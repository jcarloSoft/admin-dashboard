import { Component } from '@angular/core';
import { ToastService } from './../../services/toast.service';
import { CommonModule } from '@angular/common'; // ✅ importa esto

@Component({
  selector: 'app-toast',

  templateUrl: 'toast.component.html',
  styleUrls: ['toast.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
