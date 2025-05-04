import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client } from '../../interfaces/client';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client-edit.component.scss'],
})
export class ClientEditComponent implements OnInit {
  isSubmitting = false; // <- al inicio de la clase
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private router = inject(Router); // ✅ inyectamos Router

  form!: FormGroup;
  clientId!: number;

  ngOnInit(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadClient();
  }

  buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      documentId: ['', Validators.required], // correcto
      phone: [''],
      email: [''],
      nickTiktok: [''],
      initialDeposit: [0], // importante
      shippingPreference: ['ACCUMULATE'], // valor por defecto
    });
  }

  loadClient(): void {
    this.clientService.getClientById(this.clientId).subscribe({
      next: (client: Client) => this.form.patchValue(client),
      error: (err) => alert('❌ Error al cargar cliente: ' + err.message),
    });
  }

  onSubmit(): void {
    if (this.form.valid && this.isModified()) {
      this.isSubmitting = true;
      this.clientService
        .updateClient(this.clientId, this.form.value)
        .subscribe({
          next: () => {
            alert('✅ Cliente actualizado correctamente');
            this.router.navigate(['/clientes']); // ✅ Redirige al listado
          },
          error: (err) => alert('❌ Error al actualizar: ' + err.message),
        });
    }
  }
  onCancel(): void {
    // ✅ Al presionar "Cancelar"
    this.router.navigate(['/clientes']);
  }
  isModified(): boolean {
    return this.form.dirty;
  }
}
