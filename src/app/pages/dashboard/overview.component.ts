import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface DashboardSummary {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
}

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  imports: [CommonModule],
})
export class OverviewComponent implements OnInit {
  summary: DashboardSummary | null = null;

  ngOnInit(): void {
    // Simulación de carga (después esto lo conectamos a un servicio real)
    this.summary = {
      totalUsers: 8,
      totalProducts: 31,
      totalCategories: 6,
      totalOrders: 14,
    };
  }
}
