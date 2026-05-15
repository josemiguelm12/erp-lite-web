import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-invoices',
  imports: [CardModule],
  template: `
    <p-card>
      <ng-template #title>Facturas</ng-template>
      <ng-template #subtitle>Placeholder inicial</ng-template>

      <p class="text-sm text-slate-600">
        Aqui se administraran las facturas, estados y detalle de items.
      </p>
    </p-card>
  `
})
export class InvoicesComponent {}
