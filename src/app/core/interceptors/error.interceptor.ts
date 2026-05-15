import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const isAuthPageRequest = PUBLIC_AUTH_PATHS.some((path) => req.url.includes(path));

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || isAuthPageRequest) {
        return throwError(() => error);
      }

      showErrorMessage(messageService, error);
      return throwError(() => error);
    })
  );
};

function showErrorMessage(messageService: MessageService, error: HttpErrorResponse): void {
  switch (error.status) {
    case 400:
      showValidationErrors(messageService, error);
      return;
    case 401:
      messageService.add({
        severity: 'warn',
        summary: 'Sesion expirada',
        detail: 'Tu sesion expiro. Inicia sesion nuevamente.'
      });
      return;
    case 403:
      messageService.add({
        severity: 'error',
        summary: 'Acceso denegado',
        detail: 'No tienes permisos para realizar esta accion.'
      });
      return;
    case 404:
      messageService.add({
        severity: 'info',
        summary: 'Recurso no encontrado',
        detail: 'El recurso solicitado no existe o no esta disponible.'
      });
      return;
    default:
      messageService.add({
        severity: 'error',
        summary: 'Error inesperado',
        detail:
          error.status >= 500
            ? 'Ocurrio un error interno. Intenta nuevamente.'
            : 'No fue posible completar la solicitud.'
      });
  }
}

function showValidationErrors(messageService: MessageService, error: HttpErrorResponse): void {
  const messages = extractValidationMessages(error.error);

  if (!messages.length) {
    messageService.add({
      severity: 'warn',
      summary: 'Solicitud invalida',
      detail: 'Verifica la informacion ingresada.'
    });
    return;
  }

  for (const detail of messages) {
    messageService.add({
      severity: 'warn',
      summary: 'Validacion',
      detail
    });
  }
}

function extractValidationMessages(errorBody: unknown): string[] {
  if (!errorBody || typeof errorBody !== 'object') {
    return [];
  }

  const body = errorBody as {
    errors?: Record<string, string[]>;
    title?: string;
    detail?: string;
    message?: string;
  };

  if (body.errors) {
    return Object.values(body.errors).flat().filter(Boolean);
  }

  return [body.detail ?? body.message ?? body.title].filter(
    (message): message is string => !!message
  );
}
