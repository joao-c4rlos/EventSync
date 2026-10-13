import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { autenticadoGuard, visitanteGuard } from './auth.guards';
import { AuthService } from './auth.service';
import { AuthResponse } from './models';

const resposta: AuthResponse = {
  token: 'abc',
  expiraEm: new Date(Date.now() + 3_600_000).toISOString(),
  usuario: { id: 1, nome: 'Ana', email: 'ana@teste.com' } as AuthResponse['usuario'],
};

describe('AuthService e guards', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const executar = (guarda: typeof autenticadoGuard) =>
    TestBed.runInInjectionContext(() => guarda({} as never, {} as never));

  function entrar(lembrar: boolean) {
    auth.login('ana@teste.com', 'segredo123', lembrar).subscribe();
    http.expectOne('/api/auth/login').flush(resposta);
  }

  it('guarda a sessão no sessionStorage quando "lembrar" está desmarcado', () => {
    entrar(false);
    expect(auth.autenticado()).toBe(true);
    expect(auth.token).toBe('abc');
    expect(sessionStorage.getItem('eventsync.sessao')).not.toBeNull();
    expect(localStorage.getItem('eventsync.sessao')).toBeNull();
  });

  it('guarda a sessão no localStorage quando "lembrar" está marcado', () => {
    entrar(true);
    expect(localStorage.getItem('eventsync.sessao')).not.toBeNull();
  });

  it('limpa a sessão ao sair', () => {
    entrar(true);
    auth.sair();
    expect(auth.autenticado()).toBe(false);
    expect(localStorage.getItem('eventsync.sessao')).toBeNull();
  });

  it('redireciona visitantes para o login nas rotas privadas', () => {
    const resultado = executar(autenticadoGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/login');
    expect(executar(visitanteGuard)).toBe(true);
  });

  it('redireciona usuários logados para os eventos nas telas de login', () => {
    entrar(false);
    expect(executar(autenticadoGuard)).toBe(true);
    const resultado = executar(visitanteGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/eventos');
  });
});
