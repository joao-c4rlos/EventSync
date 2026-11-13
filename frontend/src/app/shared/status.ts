import { Component, computed, input } from '@angular/core';
import { Icone } from './icone';

export type TomBadge = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** Badge do design system: sempre ícone + palavra. */
@Component({
  selector: 'app-status',
  imports: [Icone],
  host: { '[class]': '"es-badge es-badge--" + tom()' },
  template: `<app-icone [nome]="iconeEfetivo()" />{{ rotulo() }}`,
})
export class Status {
  readonly tom = input<TomBadge>('neutral');
  readonly rotulo = input.required<string>();
  /** Ícone padrão por tom; passe `icone` para trocar. */
  readonly icone = input('');

  protected readonly iconeEfetivo = computed(
    () => this.icone() || { neutral: 'file-pen', info: 'info', success: 'check', warning: 'clock', danger: 'x' }[this.tom()],
  );
}
