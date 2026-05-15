import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-payments',
  imports: [CardModule],
  template: `
    <p-card>
      <ng-template #title>Pagos</ng-template>
      <ng-template #subtitle>Placeholder inicial</ng-template>

      <p class="text-sm text-slate-600">
        Aqui se administrara el registro y consulta de pagos por factura.
      </p>
    </p-card>
  `
})
export class PaymentsComponent {}
