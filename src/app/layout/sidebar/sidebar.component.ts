import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-sidebar',
  imports: [PanelMenuModule],
  template: `
    <aside class="flex h-full flex-col gap-5 bg-slate-950 px-4 py-6 text-slate-100">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">ERP-Lite</p>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight text-white">Control operativo</h1>
        <p class="mt-2 text-sm text-slate-400">Navegacion base para la suite multi-tenant.</p>
      </div>

      <p-panelMenu [model]="items" styleClass="erp-panel-menu" />
    </aside>
  `
})
export class SidebarComponent {
  protected readonly items: MenuItem[] = [
    {
      label: 'Operaciones',
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/app/dashboard'
        },
        {
          label: 'Clientes',
          icon: 'pi pi-users',
          routerLink: '/app/customers'
        },
        {
          label: 'Productos',
          icon: 'pi pi-box',
          routerLink: '/app/products'
        },
        {
          label: 'Facturas',
          icon: 'pi pi-file',
          routerLink: '/app/invoices'
        },
        {
          label: 'Pagos',
          icon: 'pi pi-wallet',
          routerLink: '/app/payments'
        }
      ]
    }
  ];
}
