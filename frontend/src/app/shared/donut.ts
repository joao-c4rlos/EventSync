import { Component, computed, input } from '@angular/core';

export interface FatiaDonut {
  rotulo: string;
  valor: number;
  cor: string;
}

const RAIO = 15.9155; // circunferência = 100, então o dasharray trabalha direto em porcentagem

@Component({
  selector: 'app-donut',
  template: `
    <svg viewBox="0 0 42 42" role="img" [attr.aria-label]="descricao()">
      <circle cx="21" cy="21" [attr.r]="raio" fill="none" stroke="#eef0f4" stroke-width="8" />
      @for (f of arcos(); track f.rotulo) {
        <circle cx="21" cy="21" [attr.r]="raio" fill="none" [attr.stroke]="f.cor" stroke-width="8"
          [attr.stroke-dasharray]="f.porcentagem + ' ' + (100 - f.porcentagem)" [attr.stroke-dashoffset]="f.deslocamento" />
      }
    </svg>
  `,
  styles: `
    :host { display: block; }
    svg { width: 72px; height: 72px; display: block; }
  `,
})
export class Donut {
  readonly fatias = input<FatiaDonut[]>([]);

  protected readonly raio = RAIO;

  protected readonly arcos = computed(() => {
    const total = this.fatias().reduce((soma, f) => soma + Math.max(f.valor, 0), 0);
    if (total === 0) return [];
    let acumulado = 0;
    return this.fatias()
      .filter((f) => f.valor > 0)
      .map((f) => {
        const porcentagem = (f.valor / total) * 100;
        const arco = { ...f, porcentagem, deslocamento: 25 - acumulado };
        acumulado += porcentagem;
        return arco;
      });
  });

  protected readonly descricao = computed(() =>
    this.fatias()
      .map((f) => `${f.rotulo}: ${f.valor}`)
      .join(', '),
  );
}
