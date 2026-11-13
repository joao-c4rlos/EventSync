import { Component, computed, input } from '@angular/core';

/** Avatar do design system (es-avatar): iniciais sobre primary-soft, ou a foto do usuário. */
@Component({
  selector: 'app-avatar',
  template: `
    @if (fotoUrl()) {
      <img [src]="fotoUrl()" [alt]="nome()" [style.width.px]="tamanho()" [style.height.px]="tamanho()" />
    } @else {
      <span
        class="es-avatar"
        [style.width.px]="tamanho()"
        [style.height.px]="tamanho()"
        [style.font-size.px]="tamanho() * 0.38"
        aria-hidden="true"
      >{{ iniciais() }}</span>
    }
  `,
  styles: `
    :host { display: inline-flex; }
    img { border-radius: var(--radius-pill); object-fit: cover; }
  `,
})
export class Avatar {
  readonly nome = input('');
  readonly fotoUrl = input<string | null>(null);
  readonly tamanho = input(36);

  protected readonly iniciais = computed(
    () =>
      this.nome()
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join('') || '?',
  );
}
