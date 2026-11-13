import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const autenticadoGuard: CanActivateFn = (_rota, estado: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  if (auth.autenticado()) return true;
  // Guarda a página pedida para voltar a ela depois do login.
  return inject(Router).createUrlTree(['/login'], { queryParams: { retorno: estado.url } });
};

export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return !auth.autenticado() || inject(Router).createUrlTree(['/dashboard']);
};
