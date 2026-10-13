import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Sexo, Usuario } from './models';

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
}
