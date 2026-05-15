import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'app',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.routes').then((m) => m.CUSTOMERS_ROUTES)
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES)
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('./features/invoices/invoices.routes').then((m) => m.INVOICES_ROUTES)
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/payments/payments.routes').then((m) => m.PAYMENTS_ROUTES)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app/dashboard'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found.component').then((m) => m.NotFoundComponent)
  }
];
