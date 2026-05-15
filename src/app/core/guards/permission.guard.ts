import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { AuthSessionService } from '../auth/auth-session.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const messageService = inject(MessageService);
  const requiredPermissions = route.data['permissions'] as string[] | undefined;

  if (!requiredPermissions?.length) {
    return true;
  }

  const grantedPermissions = new Set(authSession.permissions());
  const hasPermission =
    grantedPermissions.has('*') ||
    requiredPermissions.every((permission) => grantedPermissions.has(permission));

  if (hasPermission) {
    return true;
  }

  messageService.add({
    severity: 'warn',
    summary: 'Permisos insuficientes',
    detail: 'No tienes permisos para acceder a esta seccion.'
  });

  return router.createUrlTree(['/app/dashboard']);
};
