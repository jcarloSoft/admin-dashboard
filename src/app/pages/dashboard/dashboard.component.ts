import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="container mt-5">
      <h1>Welcome to the Dashboard</h1>
      <p>This is a protected page.</p>
    </div>
  `,
  styles: [],
})
export class DashboardComponent {}
