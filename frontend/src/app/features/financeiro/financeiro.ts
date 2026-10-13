import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FinanceiroService } from '../../core/financeiro.service';
import { Lancamento, ResumoMensal } from '../../core/models';
import { Donut, FatiaDonut } from '../../shared/donut';
import { mesAtual, statusLancamento, TIPO_LANCAMENTO } from '../../shared/rotulos';
import { Sparkline } from '../../shared/sparkline';
import { LancamentoModal } from './lancamento-modal';

const VERMELHO = '#e02424';
const VERDE = '#5cd65c';

@Component({
  selector: 'app-financeiro',
  imports: [CurrencyPipe, DatePipe, Sparkline, Donut, LancamentoModal],
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

  protected readonly tipoLancamento = TIPO_LANCAMENTO;
  protected readonly vermelho = VERMELHO;
  protected readonly verde = VERDE;

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
      { rotulo: 'Gastos pagos', valor: r.gastoRealizado, cor: '#1f4e79' },
      { rotulo: 'Gastos a pagar', valor: r.gastosPendentes, cor: '#f08a3c' },
      { rotulo: 'Recebido', valor: r.recebido, cor: '#2e7d32' },
      { rotulo: 'A receber', valor: r.aReceberFimDoMes, cor: '#29a3d6' },
    ];
  });

  constructor() {
    effect(() => this.carregar(this.mes()));
  }

  protected rotuloStatus(l: Lancamento): string {
    return statusLancamento(l.tipo, l.status);
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
    if (!confirm(`Excluir o lançamento "${l.descricao}"?`)) return;
    this.service.excluir(l.id).subscribe(() => this.carregar(this.mes()));
  }

  private carregar(mes: string): void {
    this.service.resumo(mes).subscribe((r) => this.resumo.set(r));
    this.service.lancamentos(mes).subscribe((l) => this.lancamentos.set(l));
  }
}
