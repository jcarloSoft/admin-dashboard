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
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories-list',
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss',
})
export class CategoriesListComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  categoryForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();

    document.addEventListener('hidden.bs.modal', () => {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    });

    setTimeout(() => {
      const tooltipElements = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
      );
      tooltipElements.forEach((el) => new Tooltip(el));
    }, 500);
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: [''],
      status: ['ACTIVO'],
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.totalPages = Math.ceil(this.categories.length / this.pageSize);
        this.applyFilters();
      },
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  applyFilters(): void {
    let temp = [...this.categories];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      temp = temp.filter((c) => c.name.toLowerCase().includes(query));
    }

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    this.filteredCategories = temp.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  filterCategories(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  openNewCategoryModal(): void {
    this.isEditMode = false;
    this.categoryForm.reset({ status: 'ACTIVO' });
    const modalElement = document.getElementById('categoryModal');
    if (modalElement) {
      const modal = new Modal(modalElement, {
        backdrop: 'static',
        keyboard: true,
        focus: true,
      });
      modal.show();
    }
  }

  editCategory(category: Category): void {
    this.isEditMode = true;
    this.categoryForm.patchValue(category);

    const modalElement = document.getElementById('categoryModal');
    if (modalElement) {
      const modal = new Modal(modalElement);
      modal.show();
    }
  }

  async submitCategory(): Promise<void> {
    if (this.categoryForm.invalid) return;

    const formData = this.categoryForm.value;
    const wasEditing = this.isEditMode; // <- guarda esto

    try {
      if (wasEditing && formData.id) {
        await this.categoryService
          .updateCategory(formData.id, formData)
          .toPromise();
      } else {
        await this.categoryService.createCategory(formData).toPromise();
      }

      this.loadCategories();
      this.categoryForm.reset();
      this.isEditMode = false;

      const modalElement = document.getElementById('categoryModal');
      if (modalElement) {
        const modal = Modal.getInstance(modalElement);
        modal?.hide();
      }

      await Swal.fire({
        icon: 'success',
        title: wasEditing
          ? '¡Categoría actualizada!'
          : '¡Categoría registrada!',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('❌ Error al guardar la categoría:', error);

      const responseData = error?.error?.data;

      if (error?.status === 400 && responseData?.errors?.length) {
        const validationMessages = responseData.errors
          .map((e: { field: string; message: string }) => `• ${e.message}`)
          .join('<br>');

        responseData.errors.forEach(
          (err: { field: string; message: string }) => {
            const control = this.categoryForm.get(err.field);
            if (control) {
              control.setErrors({ custom: err.message });
            }
          }
        );

        await Swal.fire({
          icon: 'error',
          title: 'Errores de validación',
          html: validationMessages,
        });
      } else {
        await Swal.fire(
          'Error',
          'Hubo un problema al guardar la categoría.',
          'error'
        );
      }
    }
  }

  deleteCategory(category: Category): void {
    Swal.fire({
      title: '¿Estás seguro?',
      html: `Esta acción eliminará <b>todos los productos asociados</b> a la categoría: "${category.name}".<br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar todo',
      cancelButtonText: 'Cancelar',
      input: 'text',
      inputPlaceholder: 'Escribe ELIMINAR para confirmar',
      preConfirm: (input) => {
        if (input !== 'ELIMINAR') {
          Swal.showValidationMessage(
            'Debes escribir "ELIMINAR" para confirmar'
          );
          return false; // Devuelve false si la entrada no es válida
        }
        return true; // Si la entrada es válida, retorna true
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Deleting category with id:', category.id); // Verifica el id en la consola

        // Asegúrate de que `category.id` sea un número
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'La categoría y todos los productos asociados han sido eliminados.',
              timer: 1800,
              showConfirmButton: false,
            });
            this.loadCategories();
          },
          error: (err) => {
            console.error('❌ Error al eliminar categoría:', err);
            Swal.fire(
              'Error',
              'Ocurrió un problema al eliminar la categoría.',
              'error'
            );
          },
        });
      }
    });
  }

  get totalPagesArray(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
  }

  getStatusBadgeClass(status: string): string {
    if (status.toUpperCase() === 'ACTIVO') return 'badge bg-success';
    if (status.toUpperCase() === 'INACTIVO') return 'badge bg-secondary';
    return 'badge bg-dark';
  }
}
