import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  template: `
    <svg [attr.viewBox]="'0 0 ' + largura + ' ' + altura" preserveAspectRatio="none" role="img" [attr.aria-label]="rotulo()">
      <polyline [attr.points]="pontos()" fill="none" [attr.stroke]="cor()" stroke-width="3"
        stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    </svg>
  `,
  styles: `
    :host { display: block; }
    svg { width: 100%; height: 56px; display: block; overflow: visible; }
  `,
})
export class Sparkline {
  readonly valores = input<number[]>([]);
  readonly cor = input('#2aa99a');
  readonly rotulo = input('');

  protected readonly largura = 200;
  protected readonly altura = 60;

  protected readonly pontos = computed(() => {
    const v = this.valores();
    if (v.length === 0) return '';
    const min = Math.min(...v, 0);
    const max = Math.max(...v, 0);
    const faixa = max - min || 1;
    const passo = v.length > 1 ? this.largura / (v.length - 1) : 0;
    return v
      .map((valor, i) => `${(i * passo).toFixed(1)},${(this.altura - ((valor - min) / faixa) * this.altura).toFixed(1)}`)
      .join(' ');
  });
}
