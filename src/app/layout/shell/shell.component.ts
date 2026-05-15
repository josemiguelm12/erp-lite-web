import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-dvh bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[19rem_1fr]">
      <div class="lg:min-h-dvh">
        <app-sidebar />
      </div>

      <div class="flex min-h-dvh flex-col">
        <app-topbar />

        <main class="flex-1 p-4 sm:p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {}
