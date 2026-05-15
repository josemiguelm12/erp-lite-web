import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-customers',
  imports: [CardModule],
  template: `
    <p-card>
      <ng-template #title>Clientes</ng-template>
      <ng-template #subtitle>Placeholder inicial</ng-template>

      <p class="text-sm text-slate-600">
        Aqui se montara el listado, busqueda y mantenimiento de clientes.
      </p>
    </p-card>
  `
})
export class CustomersComponent {}
