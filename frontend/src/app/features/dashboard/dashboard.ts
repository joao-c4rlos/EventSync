import { Icone } from '../../shared/icone';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../core/dashboard.service';
import { EventosService } from '../../core/eventos.service';
import { Evento, Indicadores, InscricoesPorPeriodo } from '../../core/models';
import { GraficoLinhas, SerieGrafico } from '../../shared/grafico-linhas';
import { BADGE_EVENTO, hora, tipoEvento } from '../../shared/rotulos';
import { Status } from '../../shared/status';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Component({
  selector: 'app-dashboard',
  imports: [Icone, RouterLink, CurrencyPipe, DatePipe, DecimalPipe, GraficoLinhas, Status],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly service = inject(DashboardService);
  private readonly router = inject(Router);

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
  protected readonly tipo = tipoEvento;
  protected readonly statusEvento = BADGE_EVENTO;

  protected readonly rotulos = computed(() =>
    (this.dados()?.meses ?? []).map((m) => MESES[Number(m.slice(5, 7)) - 1]),
  );

  protected readonly series = computed<SerieGrafico[]>(() =>
    (this.dados()?.series ?? []).map((s) => ({ nome: s.titulo, valores: s.valores })),
  );

  protected readonly titulo = computed(() => 'Inscrições por período');
  protected readonly subtitulo = computed(() => {
    const nomes = (this.dados()?.series ?? []).map((x) => x.titulo).join(' × ');
    return `${nomes} · últimos ${this.meses()} meses`;
  });

  protected readonly erro = signal('');
  private readonly tick = signal(0);
  private readonly eventosService = inject(EventosService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.carregarBase();

    // Cancela a requisição anterior ao mudar filtros, evitando que uma resposta lenta sobrescreva a nova.
    effect((onCleanup) => {
      this.tick();
      const ids = [this.eventoA(), this.eventoB()].filter((id): id is number => id !== null);
      const sub = this.service.inscricoes(this.meses(), ids).subscribe({
        next: (d) => this.dados.set(d),
        error: () => this.erro.set('Não foi possível carregar os dados do dashboard.'),
      });
      onCleanup(() => sub.unsubscribe());
    });

    // Ao voltar para a aba, recarrega para refletir o que foi salvo em outro lugar.
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') this.recarregar();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    this.destroyRef.onDestroy(() => document.removeEventListener('visibilitychange', aoVoltar));
  }

  protected recarregar(): void {
    this.erro.set('');
    this.carregarBase();
    this.tick.update((n) => n + 1);
  }

  private carregarBase(): void {
    const falha = () => this.erro.set('Não foi possível carregar os dados do dashboard.');
    this.eventosService.listar().subscribe({ next: (l) => this.eventos.set(l), error: falha });
    this.service.indicadores().subscribe({ next: (i) => this.indicadores.set(i), error: falha });
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

  protected abrir(id: number): void {
    this.router.navigate(['/eventos', id]);
  }

  /** Baixa o relatório exibido no gráfico como CSV (separador ";" e vírgula decimal, que o Excel em pt-BR abre direto). */
  protected exportar(): void {
    const d = this.dados();
    if (!d) return;
    const cabecalho = ['Mês', ...d.series.map((s) => s.titulo)];
    const linhas = d.meses.map((m, i) => [`${MESES[Number(m.slice(5, 7)) - 1]}/${m.slice(0, 4)}`, ...d.series.map((s) => String(s.valores[i]))]);
    const csv = [cabecalho, ...linhas].map((l) => l.map((c) => `"${c.replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscricoes-por-periodo-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
