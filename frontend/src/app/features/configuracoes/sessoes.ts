import { Icone } from '../../shared/icone';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sessoes',
  imports: [Icone, RouterLink],
  template: `
    <a routerLink="/configuracoes" class="es-btn es-btn--ghost es-btn--sm voltar"><app-icone nome="arrow-left" /> Configurações</a>
    <h1>Dispositivos e sessões</h1>

    <section class="es-card">
      <h2>Sessão atual</h2>
      <div class="sessao">
        <span class="es-stat__icon selo"><app-icone [nome]="movel ? 'smartphone' : 'monitor'" /></span>
        <div>
          <strong>{{ navegador }}</strong>
          <small>{{ sistema }} · Este dispositivo</small>
        </div>
      </div>
      <p class="descricao">
        Ao sair, o acesso deste navegador é encerrado e será preciso fazer login novamente.
      </p>
      <button type="button" class="es-btn es-btn--outline" (click)="auth.sair()"><app-icone nome="log-out" /> Sair desta sessão</button>
    </section>
  `,
  styleUrl: './config-pagina.scss',
  styles: `
    .sessao { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4); }
    .selo { width: 44px; height: 44px; flex: none; } .selo app-icone { font-size: 22px; }
    .sessao div { display: flex; flex-direction: column; }
    .sessao small { color: var(--ink-muted); }
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
