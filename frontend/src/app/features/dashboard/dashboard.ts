import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/dashboard.service';
import { EventosService } from '../../core/eventos.service';
import { Evento, Indicadores, InscricoesPorPeriodo } from '../../core/models';
import { GraficoLinhas, SerieGrafico } from '../../shared/grafico-linhas';
import { hora } from '../../shared/rotulos';

const CORES = ['#6a35b8', '#4fc8e8', '#2aa99a', '#f08a3c'];
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CurrencyPipe, DatePipe, GraficoLinhas],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly service = inject(DashboardService);

  protected readonly periodos = [
    { meses: 3, rotulo: 'Últimos 3 meses' },
    { meses: 6, rotulo: 'Últimos 6 meses' },
    { meses: 12, rotulo: 'Últimos 12 meses' },
  ];

  protected readonly meses = signal(6);
  protected readonly eventoA = signal<number | null>(null);
  protected readonly eventoB = signal<number | null>(null);

  protected readonly eventos = signal<Evento[]>([]);
  protected readonly indicadores = signal<Indicadores | null>(null);
  protected readonly dados = signal<InscricoesPorPeriodo | null>(null);
  protected readonly hora = hora;

  protected readonly rotulos = computed(() =>
    (this.dados()?.meses ?? []).map((m) => MESES[Number(m.slice(5, 7)) - 1]),
  );

  protected readonly series = computed<SerieGrafico[]>(() =>
    (this.dados()?.series ?? []).map((s, i) => ({ nome: s.titulo, cor: CORES[i % CORES.length], valores: s.valores })),
  );

  protected readonly titulo = computed(() => {
    const s = this.dados()?.series ?? [];
    return 'Inscrições por período. ' + s.map((x) => x.titulo).join(' x ');
  });

  constructor() {
    inject(EventosService).listar().subscribe((lista) => this.eventos.set(lista));
    this.service.indicadores().subscribe((i) => this.indicadores.set(i));

    effect(() => {
      const ids = [this.eventoA(), this.eventoB()].filter((id): id is number => id !== null);
      this.service.inscricoes(this.meses(), ids).subscribe((d) => this.dados.set(d));
    });
  }

  protected selecionar(alvo: 'A' | 'B', valor: string): void {
    const id = valor ? Number(valor) : null;
    if (alvo === 'A') {
      this.eventoA.set(id);
      if (id === null || id === this.eventoB()) this.eventoB.set(null);
    } else {
      this.eventoB.set(id);
    }
  }
}
