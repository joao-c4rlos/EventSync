import { AfterViewInit, Component, ElementRef, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { mensagemDeErro } from '../../core/erros';
import { EventosService } from '../../core/eventos.service';
import { FinanceiroService } from '../../core/financeiro.service';
import { Evento, Lancamento, StatusLancamento, TipoLancamento } from '../../core/models';
import { Alerta } from '../../shared/alerta';
import { hojeIso } from '../../shared/rotulos';

@Component({
  selector: 'app-lancamento-modal',
  imports: [ReactiveFormsModule, Alerta],
  template: `
    <div class="es-scrim fundo" (click)="fechar.emit()">
      <form class="es-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal" [formGroup]="form"
        (ngSubmit)="salvar()" (click)="$event.stopPropagation()" novalidate>
        <div class="es-modal__head">
          <h2 class="es-modal__title" id="titulo-modal">{{ lancamento() ? 'Editar lançamento' : 'Novo lançamento' }}</h2>
        </div>

        <div class="es-modal__body corpo">
          @if (erro()) {
            <app-alerta tom="danger" titulo="Não foi possível salvar">{{ erro() }}</app-alerta>
          }

          <label class="es-field" [class.es-field--error]="invalido('descricao')">
            <span class="es-field__label">Descrição</span>
            <input #primeiro id="descricao" class="es-field__control" formControlName="descricao" placeholder="Ex.: Fornecedor de som" />
            @if (invalido('descricao')) { <span class="es-field__hint">Informe uma descrição.</span> }
          </label>

          <div class="duas">
            <label class="es-field">
              <span class="es-field__label">Tipo</span>
              <span class="es-select-wrap">
                <select id="tipo" class="es-select" formControlName="tipo">
                  <option value="GASTO">Gasto</option>
                  <option value="RECEBIMENTO">Recebimento</option>
                </select>
              </span>
            </label>
            <label class="es-field">
              <span class="es-field__label">Status</span>
              <span class="es-select-wrap">
                <select id="status" class="es-select" formControlName="status">
                  <option value="PENDENTE">Pendente</option>
                  <option value="CONCLUIDO">{{ form.controls.tipo.value === 'GASTO' ? 'Pago' : 'Recebido' }}</option>
                </select>
              </span>
            </label>
          </div>

          <div class="duas">
            <label class="es-field" [class.es-field--error]="invalido('valor')">
              <span class="es-field__label">Valor (R$)</span>
              <input id="valor" type="number" min="0.01" step="0.01" class="es-field__control es-num" formControlName="valor" placeholder="0,00" />
              @if (invalido('valor')) { <span class="es-field__hint">Informe um valor maior que zero.</span> }
            </label>
            <label class="es-field" [class.es-field--error]="invalido('data')">
              <span class="es-field__label">Data</span>
              <input id="data" type="date" class="es-field__control" formControlName="data" />
              @if (invalido('data')) { <span class="es-field__hint">Informe a data.</span> }
            </label>
          </div>

          <label class="es-field">
            <span class="es-field__label">Evento (opcional)</span>
            <span class="es-select-wrap">
              <select id="evento" class="es-select" formControlName="eventoId">
                <option [ngValue]="null">Sem evento vinculado</option>
                @for (e of eventos(); track e.id) {
                  <option [ngValue]="e.id">{{ e.titulo }}</option>
                }
              </select>
            </span>
          </label>
        </div>

        <div class="es-modal__foot">
          <button type="button" class="es-btn es-btn--outline" (click)="fechar.emit()">Cancelar</button>
          <button type="submit" class="es-btn es-btn--primary" [disabled]="salvando()">{{ salvando() ? 'Salvando…' : 'Salvar' }}</button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .fundo { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: var(--space-4); overflow-y: auto; }
    .es-modal { max-width: 520px; max-height: calc(100vh - var(--space-8)); overflow-y: auto; }
    .corpo { display: flex; flex-direction: column; gap: var(--space-4); }
    .duas { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
  `,
  host: { '(document:keydown.escape)': 'fechar.emit()' },
})
export class LancamentoModal implements OnInit, AfterViewInit {
  private readonly primeiro = viewChild.required<ElementRef<HTMLInputElement>>('primeiro');
  private readonly financeiro = inject(FinanceiroService);
  private readonly eventosService = inject(EventosService);

  readonly lancamento = input<Lancamento | null>(null);
  readonly eventoIdPadrao = input<number | null>(null);
  readonly salvo = output<Lancamento>();
  readonly fechar = output<void>();

  protected readonly eventos = signal<Evento[]>([]);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');

  protected readonly form = inject(FormBuilder).group({
    descricao: ['', [Validators.required, Validators.maxLength(150)]],
    tipo: ['GASTO' as TipoLancamento, Validators.required],
    status: ['PENDENTE' as StatusLancamento, Validators.required],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
    data: [hojeIso(), Validators.required],
    eventoId: [null as number | null],
  });

  ngAfterViewInit(): void {
    this.primeiro().nativeElement.focus();
  }

  ngOnInit(): void {
    this.eventosService.listar().subscribe((lista) => this.eventos.set(lista));
    const l = this.lancamento();
    if (l) {
      this.form.setValue({
        descricao: l.descricao,
        tipo: l.tipo,
        status: l.status,
        valor: l.valor,
        data: l.data,
        eventoId: l.eventoId,
      });
    } else if (this.eventoIdPadrao()) {
      this.form.controls.eventoId.setValue(this.eventoIdPadrao());
    }
  }

  protected invalido(campo: 'descricao' | 'valor' | 'data'): boolean {
    const c = this.form.controls[campo];
    return c.touched && c.invalid;
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Preencha descrição, valor e data.');
      return;
    }

    const v = this.form.getRawValue();
    const dados = {
      descricao: v.descricao!,
      tipo: v.tipo!,
      status: v.status!,
      valor: Number(v.valor),
      data: v.data!,
      eventoId: v.eventoId,
    };

    this.salvando.set(true);
    this.erro.set('');
    const atual = this.lancamento();
    const requisicao = atual ? this.financeiro.atualizar(atual.id, dados) : this.financeiro.criar(dados);
    requisicao.subscribe({
      next: (l) => this.salvo.emit(l),
      error: (e) => {
        this.erro.set(mensagemDeErro(e, 'Não foi possível salvar o lançamento.'));
        this.salvando.set(false);
      },
    });
  }
}
