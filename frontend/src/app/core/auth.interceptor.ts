import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const rotaPublica = req.url.startsWith('/api/auth/') || req.url.startsWith('/api/publico/');

  const requisicao =
    token && !rotaPublica ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      if (erro instanceof HttpErrorResponse && erro.status === 401 && !rotaPublica) {
        auth.sair();
      }
      return throwError(() => erro);
    }),
  );
};
