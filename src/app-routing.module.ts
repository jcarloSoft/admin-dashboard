import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes'; // Importa las rutas

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
