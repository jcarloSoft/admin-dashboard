// toast.service.ts
import { Injectable } from '@angular/core';

export interface ToastData {
  text: string;
  classname?: string;
  delay?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: ToastData[] = [];

  show(toast: ToastData) {
    this.toasts.push(toast);
    setTimeout(() => this.remove(toast), toast.delay ?? 3000);
  }

  remove(toast: ToastData) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
