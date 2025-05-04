import { Component, inject, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor() {
    const fb = inject(FormBuilder);
    this.loginForm = fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  login() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      console.log('🔄 Attempting login with:', { username, password });

      this.ngZone.run(() => {
        console.log('🚀 Navigating to /sidebar');
        this.router.navigate(['/dashboard']).then(() => {
          console.log('🔄 Reloading window');
          window.location.reload();
        });
      });

      // this.authService.login(username, password).subscribe({
      //   next: (response) => {
      //     console.log('✅ Login successful:', response.token);
      //     this.authService.saveToken(response.token);

      //     // 🔥 Asegurar que la redirección se ejecute correctamente
      //     this.ngZone.run(() => {
      //       console.log('🚀 Navigating to /dashboard');
      //       this.router.navigate(['/dashboard']).then(() => {
      //         console.log('🔄 Reloading window');
      //         window.location.reload();
      //       });
      //     });
      //   },
      //   error: (err) => {
      //     console.error('❌ Login error:', err);
      //   },
      // });
    }
  }
}
