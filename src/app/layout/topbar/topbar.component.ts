import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthSessionService } from '../../core/auth/auth-session.service';

@Component({
  selector: 'app-topbar',
  imports: [ButtonModule],
  template: `
    <header
      class="flex flex-col gap-4 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          ERP-Lite Web
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Base tecnica del frontend
        </h2>
      </div>

      <div
        class="flex flex-col gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-slate-100 sm:flex-row sm:items-center"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">{{ userName() }}</p>
          <p class="truncate text-xs text-slate-400">Tenant: {{ tenantDisplay() }}</p>
        </div>

        <p-button
          label="Salir"
          icon="pi pi-sign-out"
          severity="contrast"
          [outlined]="true"
          (onClick)="logout()"
        />
      </div>
    </header>
  `
})
export class TopbarComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  protected readonly userName = computed(
    () => this.authSession.currentUser()?.fullName ?? 'Usuario autenticado'
  );
  protected readonly tenantDisplay = computed(
    () => this.authSession.tenantName() ?? 'Tenant actual'
  );

  protected logout(): void {
    this.authSession.clearSession();
    void this.router.navigateByUrl('/login');
  }
}
