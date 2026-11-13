import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';

export interface SerieGrafico {
  nome: string;
  valores: number[];
}

/** Geometria do componente LineChart do design system (viewBox 640x260). */
const LARGURA_PADRAO = 640;
const ALTURA = 260;
const X0 = 40;
const MARGEM_DIREITA = 16;
const Y_BASE = 228;
const Y_TOPO = 12;
const MAX_SERIES = 4;
const PASSOS_BONS = [1, 2, 5, 10];

/** Menor passo "redondo" (1, 2, 5, 10, 20, 50…) que mantém o eixo com no máximo 5 divisões. */
export function passoDoEixo(maior: number): number {
  const alvo = Math.max(maior, 5) / 5;
  const potencia = 10 ** Math.floor(Math.log10(alvo));
  return (PASSOS_BONS.map((p) => p * potencia).find((p) => p >= alvo) ?? 10 * potencia);
}

@Component({
  selector: 'app-grafico-linhas',
  template: `
    <div class="es-card__head">
      <div>
        @if (titulo()) {
          <h3 class="es-card__title">{{ titulo() }}</h3>
        }
        @if (subtitulo()) {
          <p class="es-card__sub">{{ subtitulo() }}</p>
        }
      </div>
      @if (series().length > 1) {
        <div class="es-legend">
          @for (s of linhas(); track s.nome) {
            <span><i [style.background]="'var(--chart-' + s.n + ')'"></i>{{ s.nome }}</span>
          }
        </div>
      }
    </div>

    <svg class="es-chart" [attr.viewBox]="'0 0 ' + largura() + ' ' + altura" width="100%" role="img" [attr.aria-label]="resumo()"
      (mouseleave)="ativo.set(null)">
      @for (t of eixoY(); track t.valor) {
        <line class="grid" [attr.x1]="x0" [attr.x2]="x1()" [attr.y1]="t.y" [attr.y2]="t.y" />
        <text [attr.x]="x0 - 10" [attr.y]="t.y + 4" text-anchor="end" class="rotulo-y">{{ t.valor }}</text>
      }
      @for (r of eixoX(); track r.indice) {
        <text [attr.x]="r.x" [attr.y]="altura - 8" text-anchor="middle" class="rotulo-x">{{ r.texto }}</text>
      }

      @if (guia(); as g) {
        <line class="guia" [attr.x1]="g.x" [attr.x2]="g.x" [attr.y1]="yTopo" [attr.y2]="yBase" />
      }

      @for (s of linhas(); track s.nome) {
        <polyline class="line" [class]="'line s' + s.n" [attr.points]="s.pontos" />
        @for (p of s.marcadores; track $index) {
          <!-- Formas diferentes por série: o gráfico não depende só da cor -->
          @if (s.n % 2 === 1) {
            <circle [class]="'f' + s.n" [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="ativo() === $index ? 5.5 : 4" />
          } @else {
            <rect [class]="'f' + s.n" [attr.x]="p.x - (ativo() === $index ? 4.5 : 3.5)" [attr.y]="p.y - (ativo() === $index ? 4.5 : 3.5)"
              [attr.width]="ativo() === $index ? 9 : 7" [attr.height]="ativo() === $index ? 9 : 7" />
          }
        }
      }

      <!-- Áreas de hover: uma coluna por período -->
      @for (r of eixoX(); track r.indice) {
        <rect class="hover" [attr.x]="r.x - passoX() / 2" [attr.y]="yTopo" [attr.width]="passoX()" [attr.height]="yBase - yTopo + 24"
          (mouseenter)="ativo.set(r.indice)" />
      }

      @if (guia(); as g) {
        <g class="dica" [attr.transform]="'translate(' + g.caixaX + ',' + yTopo + ')'" pointer-events="none">
          <rect width="148" [attr.height]="26 + linhas().length * 20" rx="10" />
          <text x="12" y="19" class="dica-titulo">{{ g.rotulo }}</text>
          @for (s of linhas(); track s.nome; let i = $index) {
            <text x="12" [attr.y]="40 + i * 20" class="dica-linha">{{ s.nome }}</text>
            <text x="136" [attr.y]="40 + i * 20" text-anchor="end" class="dica-valor">{{ s.valores[g.indice] }}</text>
          }
        </g>
      }
    </svg>
  `,
  styles: `
    :host { display: block; }
    .es-card__head { flex-wrap: wrap; }
    svg { display: block; height: auto; overflow: visible; }
    .hover { fill: transparent; }
    .guia { stroke: var(--border-strong); stroke-width: 1; stroke-dasharray: 3 3; }
    .dica rect { fill: var(--surface-raised); stroke: var(--border); filter: drop-shadow(0 4px 8px var(--border)); }
    .es-chart .dica text { fill: var(--ink-muted); }
    .es-chart .dica .dica-titulo { fill: var(--ink); font-weight: 700; }
    .es-chart .dica .dica-valor { fill: var(--ink); font-weight: 700; }
  `,
})
export class GraficoLinhas {
  readonly titulo = input('');
  readonly subtitulo = input('');
  readonly rotulos = input<string[]>([]);
  /** Até 4 séries; a 1ª é o evento selecionado, a 2ª a comparação. */
  readonly series = input<SerieGrafico[]>([]);

  protected readonly ativo = signal<number | null>(null);

  /** Largura do viewBox acompanha a do card, então o gráfico preenche o espaço sem distorcer marcadores e textos. */
  protected readonly largura = signal(LARGURA_PADRAO);
  protected readonly altura = ALTURA;
  protected readonly x0 = X0;
  protected readonly x1 = computed(() => this.largura() - MARGEM_DIREITA);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      const medir = () => this.largura.set(Math.max(320, Math.round(host.clientWidth)));
      medir();
      const observador = new ResizeObserver(medir);
      observador.observe(host);
      this.limpar = () => observador.disconnect();
    });
    inject(DestroyRef).onDestroy(() => this.limpar?.());
  }

  private limpar?: () => void;
  protected readonly yBase = Y_BASE;
  protected readonly yTopo = Y_TOPO;

  private readonly escala = computed(() => {
    const maior = Math.max(0, ...this.series().flatMap((s) => s.valores));
    const passo = passoDoEixo(maior);
    const divisoes = Math.max(1, Math.ceil(maior / passo));
    return { passo, divisoes, maximo: passo * divisoes };
  });

  protected readonly passoX = computed(() => {
    const n = this.rotulos().length;
    return n > 1 ? (this.x1() - X0) / (n - 1) : this.x1() - X0;
  });

  private x(indice: number): number {
    const n = this.rotulos().length;
    const x1 = this.x1();
    return n > 1 ? X0 + (indice * (x1 - X0)) / (n - 1) : (X0 + x1) / 2;
  }

  private y(valor: number): number {
    return Y_BASE - (valor / this.escala().maximo) * (Y_BASE - Y_TOPO);
  }

  protected readonly eixoY = computed(() => {
    const { passo, divisoes } = this.escala();
    return Array.from({ length: divisoes + 1 }, (_, i) => ({ valor: i * passo, y: this.y(i * passo) }));
  });

  protected readonly eixoX = computed(() =>
    this.rotulos().map((texto, indice) => ({ texto, indice, x: this.x(indice) })),
  );

  protected readonly linhas = computed(() =>
    this.series()
      .slice(0, MAX_SERIES)
      .map((s, i) => {
        const marcadores = s.valores.map((valor, k) => ({ x: this.x(k), y: this.y(valor), valor }));
        return { ...s, n: i + 1, marcadores, pontos: marcadores.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') };
      }),
  );

  protected readonly guia = computed(() => {
    const i = this.ativo();
    if (i === null || i >= this.rotulos().length) return null;
    const x = this.x(i);
    const largura = 148;
    return { indice: i, x, rotulo: this.rotulos()[i], caixaX: x + largura + 16 > this.largura() ? x - largura - 12 : x + 12 };
  });

  protected readonly resumo = computed(() => {
    const partes = this.series().map((s) => `${s.nome} de ${s.valores[0] ?? 0} a ${s.valores[s.valores.length - 1] ?? 0}`);
    return `${this.titulo() || 'Gráfico de linhas'}: ${partes.join(', ')}`;
  });
}
