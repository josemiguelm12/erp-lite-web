import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-not-found',
  imports: [ButtonModule, CardModule, RouterLink],
  template: `
    <div class="flex min-h-dvh items-center justify-center bg-slate-100 p-6">
      <p-card styleClass="w-full max-w-xl">
        <ng-template #title>Pagina no encontrada</ng-template>
        <ng-template #subtitle>La ruta solicitada no existe dentro de ERP-Lite Web.</ng-template>

        <div class="mt-4 flex justify-end">
          <p-button label="Ir al dashboard" routerLink="/app/dashboard" />
        </div>
      </p-card>
    </div>
  `
})
export class NotFoundComponent {}
