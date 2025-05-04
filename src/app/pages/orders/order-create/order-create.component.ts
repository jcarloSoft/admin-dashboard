import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import * as bootstrap from 'bootstrap'; // 👈 Asegúrate de instalar bootstrap

import { OrderService } from '../../../services/order.service';
import { ClientService } from '../../../services/client.service';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../interfaces/product.model';
import { Client } from '../../../interfaces/client';

@Component({
  selector: 'app-order-create',
  standalone: true,
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
  ],
})
export class OrderCreateComponent implements OnInit {
  orderForm!: FormGroup;
  clients: Client[] = [];
  filteredClients: Client[] = [];
  paginatedClients: Client[] = [];
  products: Product[] = [];
  selectedClient: Client | null = null;
  searchQuery: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  totalPagesArray: number[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private orderService: OrderService,
    private clientService: ClientService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      customerId: [null, Validators.required],
      campaignId: [null],
      liveSessionId: [null],
      accumulation: [false],
      items: this.fb.array([this.createItemGroup()]),
    });

    this.loadClients();
    this.loadProducts();
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (res) => {
        this.clients = res;
        this.filteredClients = res;
        this.calculatePagination();
      },
      error: (err) => console.error(err),
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res) => (this.products = res),
      error: (err) => console.error(err),
    });
  }

  filterClients() {
    const query = this.searchQuery.toLowerCase();
    this.filteredClients = this.clients.filter((client) =>
      client.nickTiktok.toLowerCase().includes(query)
    );
    this.currentPage = 1; // resetear paginación al filtrar
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredClients.length / this.pageSize);
    this.totalPagesArray = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
    this.updatePaginatedClients();
  }

  updatePaginatedClients() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedClients = this.filteredClients.slice(
      start,
      start + this.pageSize
    );
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedClients();
    }
  }

  selectClient(client: Client) {
    this.selectedClient = client;
    this.orderForm.get('customerId')?.setValue(client.id);
  }

  createItemGroup(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount: [0],
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const orderData = this.orderForm.value;
    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        alert('✅ Pedido registrado correctamente');
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        console.error('Error:', error);
        alert('❌ Error al registrar pedido');
      },
    });
  }

  get totalPedido(): number {
    return this.items.controls.reduce((acc, itemGroup) => {
      const { productId, quantity, discount } = itemGroup.value;
      const product = this.products.find((p) => p.id === productId);
      if (!product) return acc;
      return acc + product.salePrice * quantity - discount;
    }, 0);
  }

  get saldoAFavor(): number {
    return this.selectedClient?.remainingDeposit ?? 0;
  }

  get totalFinalAPagar(): number {
    const result = this.totalPedido - this.saldoAFavor;
    return result > 0 ? result : 0;
  }
}
