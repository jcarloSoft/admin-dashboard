import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModalModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { OrderService } from '../../../app/services/order.service';
import { ClientService } from '../../../app/services/client.service';
import { OrderDetailModalComponent } from './order-detail/order-detail-modal.component';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  discount: number;
}

export interface Order {
  id: number;
  customerId: number;
  campaignId: number | null;
  liveSessionId: number | null;
  apertura: number | null;
  totalAmount: number;
  status: string;
  accumulation: boolean;
  paymentDueDate: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  realAmountToPay: number;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  imports: [CommonModule, RouterModule, NgbModalModule, FormsModule],
})
export class OrderListComponent implements OnInit {
  filtroCliente: string = '';
  orders: Order[] = [];
  groupedOrders: { [customerId: number]: Order[] } = {};

  clients: any[] = [];
  customerMap: Record<number, string> = {};
  remainingMap: Record<number, number> = {};
  campaignMap: Record<number, string> = {};
  sessionMap: Record<number, string> = {};

  collapsedClients: Record<number, boolean> = {};

  currentPage: number = 1;
  pageSize: number = 4;
  totalPages: number = 1;
  paginatedGroupedOrders: [string, Order[]][] = [];

  constructor(
    private orderService: OrderService,
    private clientService: ClientService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.clientService.getClients().subscribe((clients) => {
      this.clients = clients;
      for (const client of clients) {
        this.customerMap[client.id] = client.nickTiktok;
        this.remainingMap[client.id] = client.remainingDeposit || 0;
      }
    });

    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.orders = Array.isArray(res) ? res : res.data || [];

        // 🆕 Ordenar pedidos por fecha de creación (más reciente primero)
        this.orders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.groupOrdersByCustomer(this.orders);
        this.updatePagination();
      },
      error: (err) => {
        console.error('❌ Error al cargar pedidos:', err);
      },
    });
  }

  groupOrdersByCustomer(orders: Order[]): void {
    this.groupedOrders = {};
    for (const order of orders) {
      if (!this.groupedOrders[order.customerId]) {
        this.groupedOrders[order.customerId] = [];
      }
      this.groupedOrders[order.customerId].push(order);
    }

    // 🆕 Ordenar internamente cada grupo también por fecha descendente
    for (const key in this.groupedOrders) {
      this.groupedOrders[key].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    this.updatePagination();
  }

  updatePagination(): void {
    const allGroups = Object.entries(this.groupedOrders)
      .filter(([id]) =>
        this.getCustomerName(+id)
          .toLowerCase()
          .includes(this.filtroCliente.toLowerCase())
      )
      // ✅ Ordenar los grupos por la fecha de creación más reciente dentro del grupo
      .sort(([, groupA], [, groupB]) => {
        const latestA = new Date(groupA[0]?.createdAt || '').getTime();
        const latestB = new Date(groupB[0]?.createdAt || '').getTime();
        return latestB - latestA;
      });

    this.totalPages = Math.ceil(allGroups.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedGroupedOrders = allGroups.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  set filtroClienteReactive(value: string) {
    this.filtroCliente = value;
    this.currentPage = 1;
    this.updatePagination();
  }

  getCustomerName(id: number): string {
    return this.customerMap[id] || `#${id}`;
  }

  getCampaignName(id: number | null): string {
    return id !== null ? this.campaignMap?.[id] ?? `Campaña ${id}` : '-';
  }

  getSessionTitle(id: number | null): string {
    return id !== null ? this.sessionMap?.[id] ?? `Sesión ${id}` : '-';
  }

  hasPending(orders: Order[]): boolean {
    return orders.some((order) => order.realAmountToPay > 0);
  }

  getPendingAmount(orders: Order[]): number {
    return orders
      .filter((order) => order.realAmountToPay > 0)
      .reduce((sum, order) => sum + order.realAmountToPay, 0);
  }

  toggleCollapse(clientId: number): void {
    this.collapsedClients[clientId] = !this.collapsedClients[clientId];
  }

  isCollapsed(clientId: number): boolean {
    return !!this.collapsedClients[clientId];
  }

  openCustomerOrders(customerId: number): void {
    this.orderService.getOrdersByCustomerId(customerId).subscribe({
      next: (orders) => {
        const modalRef = this.modalService.open(OrderDetailModalComponent, {
          centered: true,
          size: 'lg',
          backdrop: 'static',
        });

        modalRef.componentInstance.orders = orders;
        modalRef.componentInstance.customerMap = this.customerMap;
        modalRef.componentInstance.campaignMap = this.campaignMap;
        modalRef.componentInstance.sessionMap = this.sessionMap;

        this.clientService.getClientById(customerId).subscribe({
          next: (updatedCustomer) => {
            modalRef.componentInstance.remainingDeposit =
              updatedCustomer.remainingDeposit ?? 0;
          },
          error: (err) => {
            console.error('❌ Error al obtener cliente actualizado:', err);
            modalRef.componentInstance.remainingDeposit = 0;
          },
        });
      },
      error: (err) => {
        console.error('❌ Error al obtener pedidos por cliente:', err);
      },
    });
  }
}
