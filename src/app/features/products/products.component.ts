import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-products',
  imports: [CardModule],
  template: `
    <p-card>
      <ng-template #title>Productos</ng-template>
      <ng-template #subtitle>Placeholder inicial</ng-template>

      <p class="text-sm text-slate-600">
        Aqui se montara el catalogo de productos con inventario y precios.
      </p>
    </p-card>
  `
})
export class ProductsComponent {}
