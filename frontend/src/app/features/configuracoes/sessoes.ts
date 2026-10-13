import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sessoes',
  imports: [RouterLink],
  template: `
    <a routerLink="/configuracoes" class="voltar"><span class="icone">arrow_back</span> Configurações</a>
    <h1>Dispositivos e sessões</h1>

    <section class="card">
      <h2>Sessão atual</h2>
      <div class="sessao">
        <span class="icone">{{ movel ? 'smartphone' : 'computer' }}</span>
        <div>
          <strong>{{ navegador }}</strong>
          <small>{{ sistema }} · Este dispositivo</small>
        </div>
      </div>
      <p class="descricao">
        Ao sair, o acesso deste navegador é encerrado e será preciso fazer login novamente.
      </p>
      <button type="button" class="btn btn-secundario" (click)="auth.sair()"><span class="icone">logout</span> Sair desta sessão</button>
    </section>
  `,
  styleUrl: './config-pagina.scss',
  styles: `
    .sessao { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .sessao > .icone { font-size: 36px; color: var(--cor-roxo); }
    .sessao div { display: flex; flex-direction: column; }
    .sessao small { color: var(--cor-texto-suave); }
  `,
})
export class Sessoes {
  protected readonly auth = inject(AuthService);

  private readonly agente = navigator.userAgent;
  protected readonly movel = /Mobi|Android|iPhone/i.test(this.agente);
  protected readonly navegador = /Edg\//.test(this.agente)
    ? 'Microsoft Edge'
    : /Chrome\//.test(this.agente)
      ? 'Google Chrome'
      : /Firefox\//.test(this.agente)
        ? 'Mozilla Firefox'
        : /Safari\//.test(this.agente)
          ? 'Safari'
          : 'Navegador';
  protected readonly sistema = /Windows/.test(this.agente)
    ? 'Windows'
    : /Android/.test(this.agente)
      ? 'Android'
      : /iPhone|iPad/.test(this.agente)
        ? 'iOS'
        : /Mac OS/.test(this.agente)
          ? 'macOS'
          : /Linux/.test(this.agente)
            ? 'Linux'
            : 'Sistema desconhecido';
}
