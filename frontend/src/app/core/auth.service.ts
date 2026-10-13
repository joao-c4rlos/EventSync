import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, Usuario } from './models';

interface Sessao {
  token: string;
  expiraEm: string;
  usuario: Usuario;
}

const CHAVE = 'eventsync.sessao';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sessao = signal<Sessao | null>(this.carregar());

  readonly usuario = computed(() => this.sessao()?.usuario ?? null);
  readonly autenticado = computed(() => this.sessao() !== null);

  get token(): string | null {
    return this.sessao()?.token ?? null;
  }

  login(email: string, senha: string, lembrar: boolean): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', { email, senha, lembrar })
      .pipe(tap((res) => this.salvar(res, lembrar)));
  }

  cadastrar(nome: string, email: string, senha: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/cadastro', { nome, email, senha })
      .pipe(tap((res) => this.salvar(res, false)));
  }

  esqueciSenha(email: string): Observable<void> {
    return this.http.post<void>('/api/auth/esqueci-senha', { email });
  }

  redefinirSenha(token: string, novaSenha: string): Observable<void> {
    return this.http.post<void>('/api/auth/redefinir-senha', { token, novaSenha });
  }

  atualizarUsuario(usuario: Usuario): void {
    const atual = this.sessao();
    if (!atual) return;
    const nova = { ...atual, usuario };
    this.sessao.set(nova);
    this.armazenamentoAtual()?.setItem(CHAVE, JSON.stringify(nova));
  }

  sair(): void {
    localStorage.removeItem(CHAVE);
    sessionStorage.removeItem(CHAVE);
    this.sessao.set(null);
    this.router.navigate(['/login']);
  }

  private salvar(res: AuthResponse, lembrar: boolean): void {
    const sessao: Sessao = { token: res.token, expiraEm: res.expiraEm, usuario: res.usuario };
    localStorage.removeItem(CHAVE);
    sessionStorage.removeItem(CHAVE);
    (lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(sessao));
    this.sessao.set(sessao);
  }

  private armazenamentoAtual(): Storage | null {
    if (localStorage.getItem(CHAVE)) return localStorage;
    if (sessionStorage.getItem(CHAVE)) return sessionStorage;
    return null;
  }

  private carregar(): Sessao | null {
    const bruto = localStorage.getItem(CHAVE) ?? sessionStorage.getItem(CHAVE);
    if (!bruto) return null;
    try {
      const sessao = JSON.parse(bruto) as Sessao;
      if (new Date(sessao.expiraEm).getTime() > Date.now()) return sessao;
    } catch {
      // sessão corrompida: descartada abaixo
    }
    localStorage.removeItem(CHAVE);
    sessionStorage.removeItem(CHAVE);
    return null;
  }
}
