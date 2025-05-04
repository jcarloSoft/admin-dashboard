import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import Tooltip from 'bootstrap/js/dist/tooltip';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../interfaces/product.model';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../interfaces/category.model';
import Modal from 'bootstrap/js/dist/modal'; // ✅ CORRECTO para Angular + Bootstrap
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  defaultImageUrl = 'assets/adminlte/assets/img/default-product.png';
  revenueData = [
    { amount: 1311, percentage: 39 },
    { amount: 860, percentage: 26 },
    { amount: 539, percentage: 16 },
    { amount: 343, percentage: 10 },
    { amount: 280, percentage: 8 },
  ];

  step: number = 1;
  productoForm!: FormGroup;
  isEditMode: boolean = false;
  categories: Category[] = [];

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.initForm();
    this.loadCategories();

    // Limpieza global al cerrar cualquier modal manualmente
    document.addEventListener('hidden.bs.modal', () => {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();

      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    });
    // Activar tooltips manualmente
    setTimeout(() => {
      const tooltipElements = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
      );
      tooltipElements.forEach((el) => new Tooltip(el));
    }, 500);
  }

  initForm() {
    this.productoForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      brand: [''],
      model: [''],
      purchasePrice: [0, [Validators.required, Validators.min(0.01)]],
      salePrice: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.min(0)]],
      minStock: [0, [Validators.min(0)]],
      unit: [''],
      barcode: [''],
      sku: [''],
      discount: [0],
      imageUrl: [''],
      description: [''],
      material: [''],
      capacity: [''],
      color: [''],
      status: ['ACTIVO'],
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.totalPages = Math.ceil(this.products.length / this.pageSize);
        this.applyFilters();
      },
      error: (err) => console.error('Error al cargar productos:', err),
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('❌ Error al cargar categorías:', err),
    });
  }

  applyFilters() {
    let tempProducts = [...this.products]; // 🔁 usar una copia para evitar mutaciones extrañas

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();

      tempProducts = tempProducts.filter((p) => {
        const name = p.name?.toLowerCase() || '';
        const brand = p.brand?.toLowerCase() || '';
        const model = p.model?.toLowerCase() || '';

        return (
          name.includes(query) || brand.includes(query) || model.includes(query)
        );
      });
    }

    this.totalPages = Math.ceil(tempProducts.length / this.pageSize);
    this.filteredProducts = tempProducts.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  filterProducts() {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterProducts();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  onImageError(event: any) {
    event.target.src = this.defaultImageUrl;
  }

  nextStep() {
    if (this.step === 1 && !this.productoForm.valid) return;
    if (this.step < 3) this.step++;
  }

  previousStep() {
    if (this.step > 1) this.step--;
  }

  getProgressPercentage(): string {
    const percentage = (this.step / 3) * 100;
    return `${percentage}%`;
  }

  async submitProduct() {
    if (this.productoForm.invalid) return;

    const form = this.productoForm.value;

    const productData: Product = {
      ...form,
      brand: form.brand ?? null,
      model: form.model ?? null,
      status: form.status ?? 'ACTIVO',
      specifications: {
        material: form.material ?? null,
        capacity: form.capacity ?? null,
        color: form.color ?? null,
      },
    };

    const { purchasePrice, salePrice, stock, minStock } = productData;
    if (purchasePrice > salePrice) {
      await Swal.fire(
        'Error',
        'El precio de compra no puede ser mayor que el de venta.',
        'warning'
      );
      return;
    }

    if (minStock > stock) {
      await Swal.fire(
        'Error',
        'El stock mínimo no puede ser mayor que el stock.',
        'warning'
      );
      return;
    }

    try {
      if (this.isEditMode && productData.id) {
        // 🔁 Modo edición: PUT
        await this.productService
          .updateProduct(productData.id, productData)
          .toPromise();
      } else {
        // 🆕 Modo nuevo: POST
        await this.productService.createProduct(productData).toPromise();
      }

      this.loadProducts();
      this.productoForm.reset();
      this.isEditMode = false;
      this.step = 1;

      const modalElement = document.getElementById('productModal');
      if (modalElement) {
        const modal =
          Modal.getInstance(modalElement) || new Modal(modalElement);
        modal.hide();
      }

      await Swal.fire({
        icon: 'success',
        title: this.isEditMode
          ? '¡Producto actualizado!'
          : '¡Producto registrado!',
        timer: 1800,
        showConfirmButton: false,
      });

      this.forceCloseBootstrapModal('productModal');
    } catch (err) {
      console.error(err);
      await Swal.fire(
        'Error',
        'Hubo un problema al guardar el producto.',
        'error'
      );
    }
  }

  showSuccessToast(message: string) {
    const modalElement = document.getElementById('productModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
      modal.hide();

      // Esperar cierre del modal y luego limpiar manualmente el backdrop
      setTimeout(() => {
        // ✅ Forzar limpieza de cualquier backdrop que haya quedado pegado
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
        }
      }, 500);
    }
  }

  editProduct(product: Product) {
    this.isEditMode = true;
    this.step = 1;

    this.productoForm.patchValue({
      id: product.id, // 👈 importante para que el submit sepa que es edición
      name: product.name,
      categoryId: product.categoryId,
      brand: product.brand,
      model: product.model,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      barcode: product.barcode,
      sku: product.sku,
      discount: product.discount,
      imageUrl: product.imageUrl,
      description: product.description,
      material: product.specifications?.material,
      capacity: product.specifications?.capacity,
      color: product.specifications?.color,
    });

    const modalElement = document.getElementById('productModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  openNewProductModal(): void {
    // ✅ Limpieza lógica (sin romper backdrop ni clases internas)
    this.isEditMode = false;
    this.step = 1;
    this.productoForm.reset();
    this.productoForm.markAsPristine();
    this.productoForm.markAsUntouched();
    this.loadCategories();

    const modalElement = document.getElementById('productModal');

    if (modalElement) {
      // ✅ Destruir instancia previa si existía
      const oldInstance = Modal.getInstance(modalElement);
      if (oldInstance) {
        oldInstance.dispose();
      }

      // ✅ Crear una nueva instancia correctamente (resuelve backdrop roto)
      const modal = new Modal(modalElement, {
        backdrop: 'static', // Puedes cambiar a true si lo deseas
        keyboard: true,
        focus: true,
      });

      // ✅ Mostrar modal limpio con backdrop funcionando
      setTimeout(() => modal.show(), 50);
    }
  }

  deleteProduct(product: Product) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el producto: "${product.name}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El producto ha sido eliminado correctamente.',
              timer: 1800,
              showConfirmButton: false,
            });
            this.loadProducts(); // Recargar lista
          },
          error: (error) => {
            console.error('❌ Error al eliminar producto:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un problema al eliminar el producto.',
            });
          },
        });
      }
    });
  }

  getCategoryName(id?: number): string {
    if (!id) return 'N/E';
    const category = this.categories.find((c) => c.id === id);
    return category ? category.name : 'N/E';
  }

  forceCloseBootstrapModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      // Forzar el cierre visual y accesibilidad del modal
      modalElement.classList.remove('show');
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.style.display = 'none';

      // Remover backdrop si existe
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach((b) => b.remove());

      // Limpiar clases del body
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    }
  }
  getStockPercentage(product: Product): number {
    const stock = product.stock ?? 0;
    const minStock = product.minStock ?? 1; // evitar dividir por cero
    const percentage = (stock / minStock) * 100;
    return Math.min(Math.round(percentage), 100);
  }

  getMinStockProgress(product: Product): number {
    const stock = product.stock ?? 0;
    const minStock = product.minStock ?? 0;

    if (stock === 0) return 100;
    if (stock <= minStock) return 100;

    const margen = stock - minStock;
    const consumo = minStock / stock;

    // Queremos que 100% signifique "ya estoy en el mínimo"
    return Math.round(consumo * 100);
  }

  getMinStockColor(product: Product): string {
    const stock = product.stock ?? 0;
    const minStock = product.minStock ?? 0;
    const diferencia = stock - minStock;

    if (stock === 0 || diferencia < 0) return 'bg-danger'; // 🔴 Crítico: ya está en o por debajo del mínimo
    if (diferencia <= 5) return 'bg-warning'; // 🟠 Advertencia: está muy cerca del mínimo
    return 'bg-silmaur2'; // 🔵 Normal: suficiente stock
  }

  getMinStockTooltip(product: Product): string {
    const stock = product.stock ?? 0;
    const minStock = product.minStock ?? 0;
    const diferencia = stock - minStock;

    if (stock === 0 || diferencia < 0) {
      return '⚠️ Stock crítico: por debajo del mínimo requerido';
    }

    if (diferencia <= 5) {
      return '🔔 Advertencia: el stock se acerca al mínimo establecido';
    }

    return '✅ Stock suficiente';
  }

  getProductStatus(product: Product): string {
    if (product.stock === 0) return 'INACTIVO';
    return product.status?.toUpperCase() || 'N/D';
  }

  getStatusIconClass(product: Product): string {
    const status = this.getProductStatus(product);
    switch (status) {
      case 'ACTIVO':
        return 'bi-check-circle-fill';
      case 'INACTIVO':
        return 'bi-dash-circle';
      default:
        return 'bi-question-circle';
    }
  }

  getStatusBadgeClass(product: Product): string {
    const status = this.getProductStatus(product);
    if (status === 'ACTIVO') return 'activo';
    if (status === 'INACTIVO') return 'inactivo';
    return 'nd';
  }

  get totalPagesArray(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  selectedProduct: Product | null = null;

  openDetailModal(product: Product): void {
    this.selectedProduct = product;

    const modalElement = document.getElementById('productDetailModal');
    if (modalElement !== null) {
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
      modal.show();
    }
  }

  showProductDetail(product: Product): void {
    this.selectedProduct = product;

    const modalElement = document.getElementById('productDetailModal');
    if (modalElement !== null) {
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
      modal.show();
    }
  }

  sortBy(criteria: string): void {
    console.log('🔄 Ordenando por:', criteria); // Verifica si entra

    switch (criteria) {
      case 'nameAsc':
        this.products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        this.products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'priceAsc':
        this.products.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'priceDesc':
        this.products.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'stockAsc':
        this.products.sort((a, b) => a.stock - b.stock);
        break;
      case 'stockDesc':
        this.products.sort((a, b) => b.stock - a.stock);
        break;
      case 'createdAsc':
        this.products.sort(
          (a, b) =>
            new Date(a.createdAt ?? '').getTime() -
            new Date(b.createdAt ?? '').getTime()
        );
        break;
      case 'createdDesc':
        this.products.sort(
          (a, b) =>
            new Date(b.createdAt ?? '').getTime() -
            new Date(a.createdAt ?? '').getTime()
        );
        break;
    }

    // ✅ Refrescar el paginado y aplicar filtros actualizados
    this.currentPage = 1;
    this.applyFilters();
  }

  dropdownOpen: boolean = false;

  applySort(criteria: string): void {
    this.dropdownOpen = false; // cerrar el dropdown manualmente
    this.sortBy(criteria); // llamar al método real
  }
}
