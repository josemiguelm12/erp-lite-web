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
  selector: 'app-register',
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
      class="min-h-dvh bg-[linear-gradient(180deg,_#e0f2fe_0%,_#f8fafc_20%,_#f8fafc_100%)] px-4 py-10"
    >
      <div class="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section class="rounded-[2rem] bg-slate-950 p-8 text-slate-100">
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Provisioning</p>
          <h1 class="mt-5 text-4xl font-semibold tracking-tight">Crea tu tenant y entra operando.</h1>
          <p class="mt-5 text-base leading-7 text-slate-300">
            El registro inicial crea la empresa y devuelve una sesion autenticada sin persistencia
            en almacenamiento local.
          </p>
        </section>

        <p-card styleClass="rounded-[2rem] shadow-2xl shadow-slate-900/10">
          <ng-template #title>Registrar empresa</ng-template>
          <ng-template #subtitle>Completa los datos base del tenant y del usuario owner.</ng-template>

          <form class="mt-6 grid gap-5 md:grid-cols-2" [formGroup]="form" (ngSubmit)="submit()">
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm font-medium text-slate-700" for="name">Nombre de la empresa</label>
              <input id="name" pInputText formControlName="name" class="w-full" />
              @if (showError('name')) {
                <small class="text-sm text-red-600">{{ getFieldError('name') }}</small>
              }
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="text-sm font-medium text-slate-700" for="slug">Slug</label>
              <input id="slug" pInputText formControlName="slug" class="w-full" />
              @if (showError('slug')) {
                <small class="text-sm text-red-600">{{ getFieldError('slug') }}</small>
              }
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="text-sm font-medium text-slate-700" for="ownerFullName">
                Nombre del owner
              </label>
              <input id="ownerFullName" pInputText formControlName="ownerFullName" class="w-full" />
              @if (showError('ownerFullName')) {
                <small class="text-sm text-red-600">{{ getFieldError('ownerFullName') }}</small>
              }
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="text-sm font-medium text-slate-700" for="ownerEmail">
                Correo del owner
              </label>
              <input
                id="ownerEmail"
                type="email"
                pInputText
                formControlName="ownerEmail"
                class="w-full"
                autocomplete="email"
              />
              @if (showError('ownerEmail')) {
                <small class="text-sm text-red-600">{{ getFieldError('ownerEmail') }}</small>
              }
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="text-sm font-medium text-slate-700" for="registerPassword">
                Contrasena
              </label>
              <p-password
                inputId="registerPassword"
                formControlName="password"
                [toggleMask]="true"
                [feedback]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
              />
              @if (showError('password')) {
                <small class="text-sm text-red-600">{{ getFieldError('password') }}</small>
              }
            </div>

            @if (submitError()) {
              <div class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                {{ submitError() }}
              </div>
            }

            <div class="md:col-span-2">
              <p-button
                type="submit"
                label="Crear tenant"
                icon="pi pi-check"
                [loading]="isSubmitting()"
                [disabled]="form.invalid || isSubmitting()"
                styleClass="w-full"
              />
            </div>
          </form>

          <p class="mt-6 text-sm text-slate-600">
            ¿Ya tienes acceso?
            <a routerLink="/login" class="font-semibold text-slate-950 underline">Inicia sesion</a>
          </p>
        </p-card>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: ['', [Validators.maxLength(100)]],
    ownerFullName: ['', [Validators.required, Validators.maxLength(150)]],
    ownerEmail: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const request = {
      ...this.form.getRawValue(),
      slug: this.form.controls.slug.value || null
    };

    this.authApi.registerTenant(request).subscribe({
      next: (response) => {
        this.authSession.setSession(response);
        void this.router.navigateByUrl('/app/dashboard');
      },
      error: (error: unknown) => {
        this.submitError.set(getRegisterErrorMessage(error));
        this.isSubmitting.set(false);
      },
      complete: () => this.isSubmitting.set(false)
    });
  }

  protected showError(
    controlName: 'name' | 'slug' | 'ownerFullName' | 'ownerEmail' | 'password'
  ): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected getFieldError(
    controlName: 'name' | 'slug' | 'ownerFullName' | 'ownerEmail' | 'password'
  ): string {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('email')) {
      return 'Ingresa un correo valido.';
    }

    if (control.hasError('minlength')) {
      return 'La contrasena debe tener al menos 8 caracteres.';
    }

    const maxLengthMap = {
      name: 150,
      slug: 100,
      ownerFullName: 150,
      ownerEmail: 150,
      password: 999
    } as const;

    return `El campo no puede exceder ${maxLengthMap[controlName]} caracteres.`;
  }
}

function getRegisterErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 400) {
    return 'No fue posible completar el registro. Revisa los datos ingresados.';
  }

  return 'No fue posible registrar la empresa. Intenta nuevamente en unos minutos.';
}
