import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { ClientListComponent } from './pages/clientes/client-list.component';
import { ClientEditComponent } from './pages/clientes/client-edit.component'; // 👈 nuevo import
import { OrderListComponent } from './pages/orders/order-list.component';
import { OrderCreateComponent } from './pages/orders/order-create/order-create.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { CategoriesListComponent } from './pages/categories/categories-list/categories-list.component';
import { OverviewComponent } from './pages/dashboard/overview.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: SidebarComponent,
    children: [
      { path: 'dashboard', component: OverviewComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'clientes', component: ClientListComponent },
      { path: 'clientes/editar/:id', component: ClientEditComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'orders/create', component: OrderCreateComponent }, // 👈 nueva ruta
      { path: 'products', component: ProductListComponent },
      { path: 'categories', component: CategoriesListComponent },
    ],
  },
];
