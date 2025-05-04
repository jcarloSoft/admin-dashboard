import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService, Client } from '../../services/client.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import * as bootstrap from 'bootstrap';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    HighlightPipe,
  ],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss'],
})
export class ClientListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private toastService = inject(ToastService);

  clienteForm!: FormGroup;
  clients: Client[] = [];
  filteredClients: Client[] = [];
  clientToDelete?: Client;

  isEditMode = false;
  selectedClientId?: number;
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.initForm();
    this.loadClients();

    this.searchControl.valueChanges.subscribe((term) => {
      this.applyFilter(term || '');
    });

    const modalEl = document.getElementById('newClientModal');
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.resetForm(); // Al cerrar, resetea correctamente
      });
    }
  }

  loadClients(): void {
    this.clientService.getClients().subscribe((data) => {
      this.clients = data;
      this.filteredClients = data;
    });
  }

  applyFilter(term: string): void {
    const lowerTerm = term.toLowerCase().trim();
    this.filteredClients = this.clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowerTerm) ||
        client.documentId?.includes(lowerTerm) ||
        client.nickTiktok?.toLowerCase().includes(lowerTerm)
    );
  }

  initForm(): void {
    this.clienteForm = this.fb.group({
      name: ['', [this.validateOptionalPattern(/^.{3,}$/)]],
      documentId: [
        '',
        [
          Validators.minLength(7),
          Validators.maxLength(10),
          Validators.pattern(/^\d+$/), // solo números
        ],
      ],
      phone: [
        '',
        [
          Validators.minLength(7),
          Validators.maxLength(10),
          Validators.pattern(/^\d+$/), // solo números si lo escriben
        ],
      ],

      email: ['', [Validators.email]],
      nickTiktok: ['', [Validators.required]],
      initialDeposit: [10, [Validators.required, Validators.min(0)]],
      shippingPreference: ['ACCUMULATE'],
    });
  }

  openEditModal(client: Client): void {
    this.isEditMode = true;
    this.selectedClientId = client.id;
    this.clienteForm.patchValue(client);
    this.clienteForm.markAllAsTouched();

    const modalEl = document.getElementById('newClientModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  openDeleteModal(client: Client): void {
    this.clientToDelete = client;
    const modalElement = document.getElementById('confirmDeleteModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete(): void {
    if (!this.clientToDelete) return;

    this.clientService.deleteClient(this.clientToDelete.id).subscribe(() => {
      this.loadClients();
      this.clientToDelete = undefined;

      const modal = bootstrap.Modal.getInstance(
        document.getElementById('confirmDeleteModal')!
      );
      modal?.hide();
    });
  }

  toggleShippingPreference(client: Client): void {
    const newValue =
      client.shippingPreference === 'ACCUMULATE' ? 'SHIP' : 'ACCUMULATE';

    const updatedClient: Client = {
      ...client,
      shippingPreference: newValue,
    };

    this.clientService.updateClient(client.id, updatedClient).subscribe({
      next: () => {
        client.shippingPreference = newValue;
      },
      error: (err) => {
        alert('❌ Error al actualizar preferencia de envío.');
        console.error(err);
      },
    });
  }

  submitForm(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    const formData = this.clienteForm.value as Client;
    console.log('Datos a enviar:', formData);
    const request$ = this.isEditMode
      ? this.clientService.updateClient(this.selectedClientId!, formData)
      : this.clientService.createClient(formData);

    request$.subscribe({
      next: () => {
        this.loadClients();
        this.resetForm();
        this.closeModal();

        const toastEl = document.getElementById('successToast');
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
      },
      error: (err) => {
        console.error('❌ Error al guardar cliente:', err);
      },
    });
  }
  resetForm(): void {
    this.clienteForm.reset({
      name: '',
      documentId: '',
      phone: '',
      email: '',
      nickTiktok: '',
      initialDeposit: 10,
      shippingPreference: 'ACCUMULATE',
    });
    this.isEditMode = false;
    this.selectedClientId = undefined;
  }

  closeModal(): void {
    const modalEl = document.getElementById('newClientModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
        document.body.classList.remove('modal-open');
        document.body.removeAttribute('style');
      }
    }
  }

  validateOptionalPattern(pattern: RegExp) {
    return (control: FormControl) => {
      const value = control.value?.toString().trim();
      if (!value) return null;
      return pattern.test(value) ? null : { pattern: true };
    };
  }
}
