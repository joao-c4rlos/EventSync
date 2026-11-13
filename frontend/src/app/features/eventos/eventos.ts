import { Icone } from '../../shared/icone';
import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventosService } from '../../core/eventos.service';
import { Evento, StatusEvento } from '../../core/models';
import { BADGE_EVENTO, hora, STATUS_EVENTO, tipoEvento } from '../../shared/rotulos';
import { Status } from '../../shared/status';

@Component({
  selector: 'app-eventos',
  imports: [Icone, RouterLink, DatePipe, Status],
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss',
})
export class Eventos {
  private readonly service = inject(EventosService);
  private readonly router = inject(Router);

  readonly busca = input('');
  readonly status = input<StatusEvento | ''>('');

  protected readonly eventos = signal<Evento[]>([]);
  protected readonly carregando = signal(true);
  protected readonly semNenhumEvento = signal(false);

  protected readonly statusOpcoes = Object.entries(STATUS_EVENTO) as [StatusEvento, string][];
  protected readonly badge = BADGE_EVENTO;
  protected readonly tipo = tipoEvento;
  protected readonly hora = hora;

  constructor() {
    effect(() => {
      const busca = this.busca();
      const status = this.status() || undefined;
      this.carregando.set(true);
      this.service.listar(busca, status).subscribe((lista) => {
        this.eventos.set(lista);
        this.semNenhumEvento.set(lista.length === 0 && !busca && !status);
        this.carregando.set(false);
      });
    });
  }

  protected percentual(e: Evento): number {
    return e.capacidade > 0 ? Math.min(100, Math.round((e.inscritos / e.capacidade) * 100)) : 0;
  }

  protected filtrarStatus(status: string): void {
    this.router.navigate([], {
      queryParams: { status: status || null },
      queryParamsHandling: 'merge',
    });
  }

  protected limparBusca(): void {
    this.router.navigate([], { queryParams: { busca: null }, queryParamsHandling: 'merge' });
  }
}
