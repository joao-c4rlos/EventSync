import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  template: `
    @if (fotoUrl()) {
      <img [src]="fotoUrl()" [alt]="nome()" [style.width.px]="tamanho()" [style.height.px]="tamanho()" />
    } @else {
      <span
        class="iniciais"
        [style.width.px]="tamanho()"
        [style.height.px]="tamanho()"
        [style.font-size.px]="tamanho() * 0.38"
        aria-hidden="true"
      >{{ iniciais() }}</span>
    }
  `,
  styles: `
    :host { display: inline-flex; }
    img, .iniciais { border-radius: 50%; object-fit: cover; }
    .iniciais {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #d9d9de;
      color: #55586a;
      font-weight: 500;
    }
  `,
})
export class Avatar {
  readonly nome = input('');
  readonly fotoUrl = input<string | null>(null);
  readonly tamanho = input(36);

  protected readonly iniciais = computed(() =>
    this.nome()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join(''),
  );
}
