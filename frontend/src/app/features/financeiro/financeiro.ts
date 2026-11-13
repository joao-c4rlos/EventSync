import { Icone } from '../../shared/icone';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FinanceiroService } from '../../core/financeiro.service';
import { Lancamento, ResumoMensal } from '../../core/models';
import { Donut, FatiaDonut } from '../../shared/donut';
import { Confirmacao } from '../../shared/confirmacao';
import { badgeLancamento, mesAtual, TIPO_LANCAMENTO } from '../../shared/rotulos';
import { Status } from '../../shared/status';
import { Sparkline } from '../../shared/sparkline';
import { LancamentoModal } from './lancamento-modal';

const VERMELHO = 'var(--danger)';
const VERDE = 'var(--success)';

@Component({
  selector: 'app-financeiro',
  imports: [Icone, CurrencyPipe, DatePipe, Sparkline, Donut, LancamentoModal, Confirmacao, Status],
  templateUrl: './financeiro.html',
  styleUrl: './financeiro.scss',
})
export class Financeiro {
  private readonly service = inject(FinanceiroService);

  protected readonly mes = signal(mesAtual());
  protected readonly resumo = signal<ResumoMensal | null>(null);
  protected readonly lancamentos = signal<Lancamento[]>([]);
  protected readonly modalAberto = signal(false);
  protected readonly emEdicao = signal<Lancamento | null>(null);
  protected readonly excluindo = signal<Lancamento | null>(null);
  protected readonly processando = signal(false);

  protected readonly tipoLancamento = TIPO_LANCAMENTO;

  protected readonly nomeMes = computed(() => {
    const [ano, mes] = this.mes().split('-').map(Number);
    const nome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  });

  protected readonly series = computed(() => {
    const r = this.resumo();
    const valores = (s: { valor: number }[] | undefined) => (s ?? []).map((p) => p.valor);
    return {
      gasto: valores(r?.serieGasto),
      recebido: valores(r?.serieRecebido),
      lucroPrevisto: valores(r?.serieLucroPrevisto),
      lucroReal: valores(r?.serieLucroReal),
    };
  });

  protected readonly barrasPrevistas = computed(() => {
    const r = this.resumo();
    const fim = r?.aReceberFimDoMes ?? 0;
    const proximo = r?.receitaPrevistaProximoMes ?? 0;
    const maior = Math.max(fim, proximo, 1);
    return { fim, proximo, fimPct: (fim / maior) * 100, proximoPct: (proximo / maior) * 100 };
  });

  protected readonly fatias = computed<FatiaDonut[]>(() => {
    const r = this.resumo();
    if (!r) return [];
    return [
      { rotulo: 'Gastos pagos', valor: r.gastoRealizado, cor: 'var(--chart-1)' },
      { rotulo: 'Gastos a pagar', valor: r.gastosPendentes, cor: 'var(--chart-4)' },
      { rotulo: 'Recebido', valor: r.recebido, cor: 'var(--chart-2)' },
      { rotulo: 'A receber', valor: r.aReceberFimDoMes, cor: 'var(--chart-3)' },
    ];
  });

  constructor() {
    effect(() => this.carregar(this.mes()));
  }

  protected badgeDe(l: Lancamento) {
    return badgeLancamento(l.tipo, l.status);
  }

  protected corDoLucro(valores: number[]): string {
    const ultimo = valores[valores.length - 1] ?? 0;
    return ultimo < 0 ? VERMELHO : VERDE;
  }

  protected trocarMes(valor: string): void {
    if (valor) this.mes.set(valor);
  }

  protected novo(): void {
    this.emEdicao.set(null);
    this.modalAberto.set(true);
  }

  protected editar(l: Lancamento): void {
    this.emEdicao.set(l);
    this.modalAberto.set(true);
  }

  protected aoSalvar(): void {
    this.modalAberto.set(false);
    this.carregar(this.mes());
  }

  protected alternarStatus(l: Lancamento): void {
    const novo = l.status === 'PENDENTE' ? 'CONCLUIDO' : 'PENDENTE';
    this.service.alterarStatus(l.id, novo).subscribe(() => this.carregar(this.mes()));
  }

  protected excluir(l: Lancamento): void {
    this.processando.set(true);
    this.service.excluir(l.id).subscribe({
      next: () => this.concluirExclusao(),
      error: () => this.concluirExclusao(),
    });
  }

  /** Baixa os lançamentos do mês como CSV (separador ";" e vírgula decimal, para abrir direto no Excel em pt-BR). */
  protected exportar(): void {
    const linhas = this.lancamentos().map((l) => [
      l.data.split('-').reverse().join('/'),
      l.descricao,
      l.eventoTitulo ?? '',
      TIPO_LANCAMENTO[l.tipo],
      badgeLancamento(l.tipo, l.status).rotulo,
      l.valor.toFixed(2).replace('.', ','),
    ]);
    const csv = [['Data', 'Descrição', 'Evento', 'Tipo', 'Status', 'Valor (R$)'], ...linhas]
      .map((l) => l.map((c) => `"${c.replaceAll('"', '""')}"`).join(';'))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `lancamentos-${this.mes()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private concluirExclusao(): void {
    this.processando.set(false);
    this.excluindo.set(null);
    this.carregar(this.mes());
  }

  private carregar(mes: string): void {
    this.service.resumo(mes).subscribe((r) => this.resumo.set(r));
    this.service.lancamentos(mes).subscribe((l) => this.lancamentos.set(l));
  }
}
