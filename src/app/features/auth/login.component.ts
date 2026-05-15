import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { AuthApiService } from '../../core/auth/auth-api.service';
import { AuthSessionService } from '../../core/auth/auth-session.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule
  ],
  template: `
    <div
      class="min-h-dvh bg-[radial-gradient(circle_at_top,_#082f49_0%,_#020617_45%,_#f8fafc_45%,_#f8fafc_100%)] px-4 py-10"
    >
      <div class="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section class="hidden rounded-[2rem] bg-slate-950 p-10 text-slate-100 lg:block">
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">ERP-Lite</p>
          <h1 class="mt-6 max-w-lg text-5xl font-semibold tracking-tight">
            Operacion segura para un SaaS multi-tenant.
          </h1>
          <p class="mt-6 max-w-xl text-base leading-7 text-slate-300">
            Accede al panel operacional con autenticacion JWT, refresh token en memoria y rutas
            protegidas desde el primer dia.
          </p>
        </section>

        <p-card styleClass="rounded-[2rem] shadow-2xl shadow-slate-900/10">
          <ng-template #title>Iniciar sesion</ng-template>
          <ng-template #subtitle>Usa tu correo corporativo para entrar al workspace.</ng-template>

          <form class="mt-6 space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700" for="email">Correo electronico</label>
              <input
                id="email"
                type="email"
                pInputText
                formControlName="email"
                class="w-full"
                autocomplete="email"
              />
              @if (showError('email')) {
                <small class="text-sm text-red-600">{{ getEmailError() }}</small>
              }
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700" for="password">Contrasena</label>
              <p-password
                inputId="password"
                formControlName="password"
                [feedback]="false"
                [toggleMask]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
                autocomplete="current-password"
              />
              @if (showError('password')) {
                <small class="text-sm text-red-600">La contrasena es obligatoria.</small>
              }
            </div>

            @if (submitError()) {
              <div class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ submitError() }}
              </div>
            }

            <p-button
              type="submit"
              label="Entrar"
              icon="pi pi-arrow-right"
              iconPos="right"
              [loading]="isSubmitting()"
              [disabled]="form.invalid || isSubmitting()"
              styleClass="w-full"
            />
          </form>

          <p class="mt-6 text-sm text-slate-600">
            ¿Aun no tienes empresa?
            <a routerLink="/register" class="font-semibold text-slate-950 underline">Registrala aqui</a>
          </p>
        </p-card>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required]]
  });

  protected submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.authApi.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.authSession.setSession(response);
        void this.router.navigateByUrl('/app/dashboard');
      },
      error: (error: unknown) => {
        this.submitError.set(getAuthErrorMessage(error));
        this.isSubmitting.set(false);
      },
      complete: () => this.isSubmitting.set(false)
    });
  }

  protected showError(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected getEmailError(): string {
    const control = this.form.controls.email;

    if (control.hasError('required')) {
      return 'El correo es obligatorio.';
    }

    if (control.hasError('email')) {
      return 'Ingresa un correo valido.';
    }

    return 'El correo no puede exceder 150 caracteres.';
  }
}

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 401) {
    return 'Las credenciales no son validas. Verifica el correo y la contrasena.';
  }

  return 'No fue posible iniciar sesion. Intenta nuevamente en unos minutos.';
}
