import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventosService } from '../../core/eventos.service';
import { Evento, StatusEvento } from '../../core/models';
import { hora, STATUS_EVENTO, tipoEvento } from '../../shared/rotulos';

@Component({
  selector: 'app-eventos',
  imports: [RouterLink, DatePipe],
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
  protected readonly rotuloStatus = STATUS_EVENTO;
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
