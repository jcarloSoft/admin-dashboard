import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Order } from '../order-list.component';
import { ClientService } from '../../../services/client.service';

@Component({
  selector: 'app-order-detail-modal',
  standalone: true,
  imports: [CommonModule, NgbModalModule],
  templateUrl: './order-detail-modal.component.html',
})
export class OrderDetailModalComponent implements OnInit {
  @Input() orders: Order[] = [];
  @Input() customerMap!: Record<number, string>;
  @Input() campaignMap!: Record<number, string>;
  @Input() sessionMap!: Record<number, string>;
  @Input() remainingDeposit: number = 0;

  // ✅ Calculado en ngOnInit
  aperturaAplicada: number = 0;

  constructor(
    public modal: NgbActiveModal,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    const customerId = this.orders[0]?.customerId;

    if (customerId) {
      this.clientService.getClientById(customerId).subscribe({
        next: (cliente) => {
          this.remainingDeposit = cliente.remainingDeposit ?? 0;
        },
        error: (err) => {
          console.error('❌ Error al obtener cliente actualizado:', err);
        },
      });
    }

    if (!this.customerMap || Object.keys(this.customerMap).length === 0) {
      this.clientService.getClients().subscribe((clients) => {
        for (const c of clients) {
          this.customerMap[c.id] = c.nickTiktok;
        }
      });
    }

    this.calcularAperturaAplicada();
  }

  /** 🧮 Calcular cuánto del monto inicial se aplicó (solo en primer pedido) */
  calcularAperturaAplicada(): void {
    const primerPedido = this.orders.find((o) => o.apertura && o.apertura > 0);
    const montoReal = primerPedido?.realAmountToPay ?? 0;
    const totalPedido = primerPedido?.totalAmount ?? 0;

    this.aperturaAplicada = primerPedido ? totalPedido - montoReal : 0;
  }

  /** 🧾 Nombre del cliente */
  getCustomerName(id: number): string {
    return this.customerMap?.[id] ?? `#${id}`;
  }

  getCampaignName(id: number | null): string {
    return id !== null ? this.campaignMap?.[id] ?? `Campaña ${id}` : '-';
  }

  getSessionTitle(id: number | null): string {
    return id !== null ? this.sessionMap?.[id] ?? `Sesión ${id}` : '-';
  }

  /** 💰 Total de pedidos NO pagados */
  get totalDeuda(): number {
    return this.orders
      .filter((o) => o.status === 'NO_PAGADO')
      .reduce((acc, o) => acc + (o.realAmountToPay ?? o.totalAmount), 0);
  }

  /** 💰 Saldo a favor actual */
  get saldoAFavor(): number {
    return this.remainingDeposit;
  }

  /** 💳 Total que realmente falta pagar */
  get totalFinalAPagar(): number {
    const resultado = this.totalDeuda - this.saldoAFavor;
    return resultado > 0 ? resultado : 0;
  }

  pagarAhora(): void {
    alert('💰 Redirigiendo a módulo de pagos...');
  }
}
