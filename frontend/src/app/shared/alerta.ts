import { Component, computed, input } from '@angular/core';
import { Icone } from './icone';

export type TomAlerta = 'info' | 'success' | 'warning' | 'danger' | 'erro' | 'sucesso' | 'aviso';

const TONS = {
  info: { tom: 'info', icone: 'info' },
  success: { tom: 'success', icone: 'circle-check' },
  warning: { tom: 'warning', icone: 'triangle-alert' },
  danger: { tom: 'danger', icone: 'circle-x' },
} as const;
const ALIAS: Record<string, keyof typeof TONS> = { erro: 'danger', sucesso: 'success', aviso: 'warning' };

/** Alert do design system: erro com role="alert", demais com role="status". */
@Component({
  selector: 'app-alerta',
  imports: [Icone],
  host: { '[class]': '"es-alert es-alert--" + def().tom', '[attr.role]': 'def().tom === "danger" ? "alert" : "status"' },
  template: `
    <app-icone [nome]="def().icone" />
    <div>
      @if (titulo()) {
        <span class="es-alert__title">{{ titulo() }}</span>
      }
      <ng-content />
    </div>
  `,
  styles: `
    :host { margin: 0; }
    div { min-width: 0; }
  `,
})
export class Alerta {
  readonly tom = input<TomAlerta>('info');
  readonly titulo = input('');

  protected readonly def = computed(() => TONS[(ALIAS[this.tom()] ?? this.tom()) as keyof typeof TONS]);
}
