import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  imports: [CardModule],
  template: `
    <p-card>
      <ng-template #title>Dashboard</ng-template>
      <ng-template #subtitle>Placeholder inicial</ng-template>

      <p class="text-sm text-slate-600">
        Esta pantalla servira como punto de entrada para indicadores y resumen operativo.
      </p>
    </p-card>
  `
})
export class DashboardComponent {}
