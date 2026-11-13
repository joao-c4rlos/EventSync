import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { mensagemDeErro } from '../../core/erros';
import { EventosService } from '../../core/eventos.service';
import { Inscricao } from '../../core/models';
import { hojeIso } from '../../shared/rotulos';
import { Alerta } from '../../shared/alerta';

/**
 * Modal para adicionar uma inscrição manualmente. Nome, e-mail e data de nascimento são opcionais:
 * a pessoa pode ser registrada apenas como dado de controle do evento.
 */
@Component({
  selector: 'app-inscricao-manual',
  imports: [ReactiveFormsModule, Alerta],
  template: `
    <div class="es-scrim fundo" (click)="fechar.emit()">
      <form class="es-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-inscricao-manual"
        [formGroup]="form" (ngSubmit)="salvar()" (click)="$event.stopPropagation()" novalidate>
        <div class="es-modal__head"><h2 class="es-modal__title" id="titulo-inscricao-manual">Adicionar inscrição</h2></div>
        <div class="es-modal__body corpo">
          <p class="dica">Todos os campos são opcionais. Se deixar tudo em branco, a inscrição conta apenas como um lugar ocupado no evento.</p>

          @if (erro()) {
            <app-alerta tom="danger">{{ erro() }}</app-alerta>
          }

          <div class="es-field">
            <label for="im-nome" class="es-field__label">Nome</label>
            <input id="im-nome" type="text" class="es-field__control" formControlName="nome" maxlength="120" autocomplete="off" />
          </div>
          <div class="es-field">
            <label for="im-email" class="es-field__label">E-mail</label>
            <input id="im-email" type="email" class="es-field__control" formControlName="email" maxlength="160" autocomplete="off"
              [class.invalido]="form.controls.email.touched && form.controls.email.invalid" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <span class="caption erro-campo">E-mail inválido.</span>
            }
          </div>
          <div class="es-field">
            <label for="im-nasc" class="es-field__label">Data de nascimento</label>
            <input id="im-nasc" type="date" class="es-field__control" formControlName="dataNascimento" [max]="hoje" />
          </div>
        </div>
        <div class="es-modal__foot">
          <button type="button" class="es-btn es-btn--outline" (click)="fechar.emit()">Cancelar</button>
          <button type="submit" class="es-btn es-btn--primary" [disabled]="enviando()">
            {{ enviando() ? 'Adicionando…' : 'Adicionar inscrição' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .fundo { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: var(--space-4); }
    .corpo { display: flex; flex-direction: column; gap: var(--space-4); }
    .dica { margin: 0; color: var(--ink-muted); }
    .erro-campo { color: var(--danger); }
  `,
  host: { '(document:keydown.escape)': 'fechar.emit()' },
})
export class InscricaoManual {
  private readonly service = inject(EventosService);

  readonly eventoId = input.required<number>();
  readonly criada = output<Inscricao>();
  readonly fechar = output<void>();

  protected readonly hoje = hojeIso();
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: [''],
    email: ['', Validators.email],
    dataNascimento: [''],
  });

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set('');
    this.service
      .adicionarInscricao(this.eventoId(), {
        nome: v.nome.trim() || null,
        email: v.email.trim() || null,
        dataNascimento: v.dataNascimento || null,
      })
      .subscribe({
        next: (inscricao) => this.criada.emit(inscricao),
        error: (e) => {
          this.erro.set(mensagemDeErro(e, 'Não foi possível adicionar a inscrição.'));
          this.enviando.set(false);
        },
      });
  }
}
