import { Component, computed, input } from '@angular/core';

export interface SerieGrafico {
  nome: string;
  cor: string;
  valores: number[];
}

const LARGURA = 640;
const ALTURA = 320;
const MARGEM = { topo: 16, direita: 24, base: 36, esquerda: 40 };
const DIVISOES = 9;

@Component({
  selector: 'app-grafico-linhas',
  template: `
    <figure>
      @if (titulo()) {
        <figcaption>{{ titulo() }}</figcaption>
      }
      <svg [attr.viewBox]="'0 0 ' + largura + ' ' + altura" role="img" [attr.aria-label]="titulo()">
        @for (t of eixoY(); track t.valor) {
          <line [attr.x1]="margem.esquerda" [attr.x2]="largura - margem.direita" [attr.y1]="t.y" [attr.y2]="t.y" class="grade" />
          <text [attr.x]="margem.esquerda - 10" [attr.y]="t.y + 4" class="rotulo-y">{{ t.valor }}</text>
        }
        @for (r of eixoX(); track r.indice) {
          <text [attr.x]="r.x" [attr.y]="altura - 10" class="rotulo-x">{{ r.texto }}</text>
        }
        @for (s of linhas(); track s.nome) {
          <polyline [attr.points]="s.pontos" fill="none" [attr.stroke]="s.cor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
          @for (p of s.marcadores; track $index) {
            <circle [attr.cx]="p.x" [attr.cy]="p.y" r="4" [attr.fill]="s.cor">
              <title>{{ s.nome }}: {{ p.valor }}</title>
            </circle>
          }
        }
      </svg>
      @if (series().length > 1) {
        <ul class="legenda">
          @for (s of series(); track s.nome) {
            <li><i [style.background]="s.cor"></i>{{ s.nome }}</li>
          }
        </ul>
      }
    </figure>
  `,
  styles: `
    figure { margin: 0; }
    figcaption { text-align: center; font-size: 1.25rem; color: var(--cor-texto-suave); margin-bottom: 0.5rem; }
    svg { width: 100%; height: auto; display: block; }
    .grade { stroke: var(--cor-borda); stroke-width: 1; }
    .rotulo-y { font-size: 12px; text-anchor: end; fill: var(--cor-texto-suave); }
    .rotulo-x { font-size: 12px; text-anchor: middle; fill: var(--cor-texto-suave); font-weight: 500; }
    .legenda { display: flex; justify-content: center; flex-wrap: wrap; gap: 1.25rem; list-style: none; padding: 0; margin: 0.75rem 0 0; font-size: 0.85rem; }
    .legenda li { display: flex; align-items: center; gap: 0.4rem; }
    .legenda i { width: 14px; height: 4px; border-radius: 2px; }
  `,
})
export class GraficoLinhas {
  readonly titulo = input('');
  readonly rotulos = input<string[]>([]);
  readonly series = input<SerieGrafico[]>([]);

  protected readonly largura = LARGURA;
  protected readonly altura = ALTURA;
  protected readonly margem = MARGEM;

  private readonly escala = computed(() => {
    const maior = Math.max(0, ...this.series().flatMap((s) => s.valores));
    const passo = Math.max(1, Math.ceil(maior / DIVISOES / 2) * 2);
    return { passo, maximo: passo * DIVISOES };
  });

  private x(indice: number): number {
    const n = this.rotulos().length;
    const util = LARGURA - MARGEM.esquerda - MARGEM.direita - 40;
    return MARGEM.esquerda + 20 + (n > 1 ? (indice * util) / (n - 1) : util / 2);
  }

  private y(valor: number): number {
    const util = ALTURA - MARGEM.topo - MARGEM.base;
    return MARGEM.topo + util - (valor / this.escala().maximo) * util;
  }

  protected readonly eixoY = computed(() => {
    const { passo } = this.escala();
    return Array.from({ length: DIVISOES + 1 }, (_, i) => ({ valor: i * passo, y: this.y(i * passo) }));
  });

  protected readonly eixoX = computed(() =>
    this.rotulos().map((texto, indice) => ({ texto, indice, x: this.x(indice) })),
  );

  protected readonly linhas = computed(() =>
    this.series().map((s) => {
      const marcadores = s.valores.map((valor, i) => ({ x: this.x(i), y: this.y(valor), valor }));
      return { ...s, marcadores, pontos: marcadores.map((p) => `${p.x},${p.y}`).join(' ') };
    }),
  );
}
