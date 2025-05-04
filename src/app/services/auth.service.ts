import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../interfaces/auth-response';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private authSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.authSubject.asObservable();

  private hasToken(): boolean {
    const tokenExists = !!localStorage.getItem('token');
    console.log('🔍 Token exists:', tokenExists);
    return tokenExists;
  }

  public saveToken(token: string): void {
    console.log('✅ Saving token:', token);
    localStorage.setItem('token', token);
    this.authSubject.next(true);
  }

  login(username: string, password: string): Observable<AuthResponse> {
    console.log('🔄 Sending login request...');
    return this.http
      .post<AuthResponse>('http://localhost:8080/api/auth/login', {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          console.log('✅ Login response received:', response);
          this.saveToken(response.token);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  logout(): void {
    console.log('🔴 Logging out...');
    localStorage.removeItem('token');
    this.authSubject.next(false);
    this.router.navigate(['/login']);
  }
}
