import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { ToastComponent } from './components/toast/toast.component'; // 👈 Ajusta la ruta si está en otra carpeta

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ToastComponent,
  ], // 🔥 IMPORTANTE
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  authservice = inject(AuthService);
  isAuthenticated$ = this.authservice.isAuthenticated$;
  constructor(public authService: AuthService) {
    this.isAuthenticated$.subscribe((auth) => {
      console.log('🔍 isAuthenticated$ changed:', auth); // 🔥 Verificar si cambia
    });
  }
}
