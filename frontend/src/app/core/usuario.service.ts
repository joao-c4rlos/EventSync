import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Plano, Sexo, Tema, Usuario } from './models';

export interface PerfilPayload {
  nome: string;
  email: string;
  telefone: string;
  celular: string;
  dataNascimento: string | null;
  sexo: Sexo | null;
  cidade: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  meusDados(): Observable<Usuario> {
    return this.http.get<Usuario>('/api/usuarios/me').pipe(tap((u) => this.auth.atualizarUsuario(u)));
  }

  atualizarPerfil(dados: PerfilPayload): Observable<Usuario> {
    return this.http.put<Usuario>('/api/usuarios/me', dados).pipe(tap((u) => this.auth.atualizarUsuario(u)));
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>('/api/usuarios/me/senha', { senhaAtual, novaSenha });
  }

  atualizarPreferencias(idioma: string, fusoHorario: string, tema: Tema): Observable<Usuario> {
    return this.http
      .put<Usuario>('/api/usuarios/me/preferencias', { idioma, fusoHorario, tema })
      .pipe(tap((u) => this.auth.atualizarUsuario(u)));
  }

  alterarPlano(plano: Plano): Observable<Usuario> {
    return this.http.put<Usuario>('/api/usuarios/me/plano', { plano }).pipe(tap((u) => this.auth.atualizarUsuario(u)));
  }

  excluirConta(senha: string): Observable<void> {
    return this.http.post<void>('/api/usuarios/me/excluir', { senha });
  }
}
