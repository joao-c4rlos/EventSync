import { Component, ElementRef, input, output, viewChild, AfterViewInit } from '@angular/core';

/**
 * Modal de confirmação do design system. Título em pergunta, consequência concreta no corpo,
 * ação de saída à esquerda e ação principal à direita (repete o verbo do título).
 * `Esc` fecha e o foco vai para o primeiro botão ao abrir.
 */
@Component({
  selector: 'app-confirmacao',
  template: `
    <div class="es-scrim fundo" (click)="fechar.emit()">
      <div class="es-modal" role="alertdialog" aria-modal="true" aria-labelledby="titulo-confirmacao"
        aria-describedby="corpo-confirmacao" (click)="$event.stopPropagation()">
        <div class="es-modal__head"><h2 class="es-modal__title" id="titulo-confirmacao">{{ titulo() }}</h2></div>
        <div class="es-modal__body" id="corpo-confirmacao">{{ mensagem() }}</div>
        <div class="es-modal__foot">
          <button #voltar type="button" class="es-btn es-btn--outline" (click)="fechar.emit()">{{ voltarRotulo() }}</button>
          <button type="button" class="es-btn" [class.es-btn--danger]="perigo()" [class.es-btn--primary]="!perigo()"
            [disabled]="processando()" (click)="confirmar.emit()">{{ confirmarRotulo() }}</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .fundo { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: var(--space-4); }
  `,
  host: { '(document:keydown.escape)': 'fechar.emit()' },
})
export class Confirmacao implements AfterViewInit {
  readonly titulo = input.required<string>();
  readonly mensagem = input.required<string>();
  readonly confirmarRotulo = input.required<string>();
  readonly voltarRotulo = input('Voltar');
  readonly perigo = input(true);
  readonly processando = input(false);
  readonly confirmar = output<void>();
  readonly fechar = output<void>();

  private readonly primeiro = viewChild.required<ElementRef<HTMLButtonElement>>('voltar');

  ngAfterViewInit(): void {
    this.primeiro().nativeElement.focus();
  }
}
