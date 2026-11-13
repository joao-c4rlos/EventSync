import { Icone } from '../../shared/icone';
import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICONE_NOTIFICACAO, NotificacoesService } from '../../core/notificacoes.service';

@Component({
  selector: 'app-notificacoes',
  imports: [Icone, RouterLink, DatePipe],
  template: `
    <div class="pagina">
    <div class="pagina-topo">
      <h1>Notificações</h1>
      @if (service.naoLidas() > 0) {
        <button type="button" class="es-btn es-btn--outline" (click)="service.marcarTodasComoLidas()">Marcar todas como lidas</button>
      }
    </div>

    <section class="es-card lista">
      @for (n of service.todas(); track n.id) {
        <a class="item" [class.nova]="!service.lida(n.id)" [routerLink]="n.link">
          <span class="es-stat__icon selo"><app-icone [nome]="icones[n.categoria]" /></span>
          <span class="texto">
            <strong class="body-strong">{{ n.titulo }}</strong>
            <span>{{ n.mensagem }}</span>
            <small>{{ n.detalhe }}</small>
          </span>
          <span class="data">{{ n.data | date: 'dd/MM' }}</span>
        </a>
      } @empty {
        <p class="carregando">Tudo em dia! Nenhuma notificação no momento.</p>
      }
    </section>
    </div>
  `,
  styles: `
    .lista { padding: 0; overflow: hidden; }
    .item {
      display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4) var(--space-6);
      color: inherit; text-decoration: none; border-bottom: 1px solid var(--border);
    }
    .item:hover { background: var(--surface-hover); }
    .item.nova { background: color-mix(in srgb, var(--primary-soft) 45%, transparent); }
    .selo { width: 40px; height: 40px; flex: none; }
    .texto { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; font-size: 14px; }
    small, .data { color: var(--ink-muted); font-size: 12px; }
    .texto strong { font-weight: 600; }
    .item:last-child { border-bottom: none; }
  `,
})
export class Notificacoes {
  protected readonly service = inject(NotificacoesService);
  protected readonly icones = ICONE_NOTIFICACAO;

  constructor() {
    this.service.atualizar();
  }
}
