import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICONE_NOTIFICACAO, NotificacoesService } from '../../core/notificacoes.service';

@Component({
  selector: 'app-notificacoes',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="cabecalho-pagina">
      <h1>Notificações</h1>
      @if (service.naoLidas() > 0) {
        <button type="button" class="btn btn-secundario" (click)="service.marcarTodasComoLidas()">Marcar todas como lidas</button>
      }
    </div>

    <section class="card lista">
      @for (n of service.todas(); track n.id) {
        <a class="item" [class.nova]="!service.lida(n.id)" [routerLink]="n.link">
          <span class="icone circulo">{{ icones[n.categoria] }}</span>
          <span class="texto">
            <strong>{{ n.titulo }}</strong>
            <span>{{ n.mensagem }}</span>
            <small>{{ n.detalhe }}</small>
          </span>
          <span class="data">{{ n.data | date: 'dd/MM' }}</span>
        </a>
      } @empty {
        <p class="carregando">Tudo em dia! Nenhuma notificação no momento.</p>
      }
    </section>
  `,
  styles: `
    .lista { padding: 0; overflow: hidden; max-width: 760px; }
    .item {
      display: flex; align-items: center; gap: 1.25rem; padding: 1rem 1.5rem;
      color: inherit; text-decoration: none; border-bottom: 1px solid var(--cor-fundo);
    }
    .item:hover { background: var(--cor-fundo); }
    .item.nova { background: color-mix(in srgb, var(--cor-roxo-claro) 45%, transparent); }
    .circulo {
      width: 40px; height: 40px; border-radius: 50%; background: var(--cor-roxo); color: #fff;
      display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .texto { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; font-size: 0.9rem; }
    small, .data { color: var(--cor-texto-suave); font-size: 0.8rem; }
  `,
})
export class Notificacoes {
  protected readonly service = inject(NotificacoesService);
  protected readonly icones = ICONE_NOTIFICACAO;

  constructor() {
    this.service.atualizar();
  }
}
