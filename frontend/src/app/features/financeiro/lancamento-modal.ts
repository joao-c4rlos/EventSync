import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { mensagemDeErro } from '../../core/erros';
import { EventosService } from '../../core/eventos.service';
import { FinanceiroService } from '../../core/financeiro.service';
import { Evento, Lancamento, StatusLancamento, TipoLancamento } from '../../core/models';
import { hojeIso } from '../../shared/rotulos';

@Component({
  selector: 'app-lancamento-modal',
  imports: [ReactiveFormsModule],
  template: `
    <div class="fundo" (click)="fechar.emit()"></div>
    <div class="modal card" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
      <h2 id="titulo-modal">{{ lancamento() ? 'Editar lançamento' : 'Novo lançamento' }}</h2>

      @if (erro()) {
        <div class="alerta erro" role="alert">{{ erro() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
        <div class="campo">
          <label for="descricao">Descrição</label>
          <input id="descricao" class="input" formControlName="descricao" placeholder="Ex.: Fornecedor de som"
            [class.invalido]="form.controls.descricao.touched && form.controls.descricao.invalid" />
        </div>

        <div class="duas">
          <div class="campo">
            <label for="tipo">Tipo</label>
            <select id="tipo" class="input" formControlName="tipo">
              <option value="GASTO">Gasto</option>
              <option value="RECEBIMENTO">Recebimento</option>
            </select>
          </div>
          <div class="campo">
            <label for="status">Status</label>
            <select id="status" class="input" formControlName="status">
              <option value="PENDENTE">Aguardando</option>
              <option value="CONCLUIDO">{{ form.controls.tipo.value === 'GASTO' ? 'Pago' : 'Recebido' }}</option>
            </select>
          </div>
        </div>

        <div class="duas">
          <div class="campo">
            <label for="valor">Valor (R$)</label>
            <input id="valor" type="number" min="0.01" step="0.01" class="input" formControlName="valor"
              [class.invalido]="form.controls.valor.touched && form.controls.valor.invalid" />
          </div>
          <div class="campo">
            <label for="data">Data</label>
            <input id="data" type="date" class="input" formControlName="data"
              [class.invalido]="form.controls.data.touched && form.controls.data.invalid" />
          </div>
        </div>

        <div class="campo">
          <label for="evento">Evento (opcional)</label>
          <select id="evento" class="input" formControlName="eventoId">
            <option [ngValue]="null">Sem evento vinculado</option>
            @for (e of eventos(); track e.id) {
              <option [ngValue]="e.id">{{ e.titulo }}</option>
            }
          </select>
        </div>

        <div class="acoes">
          <button type="submit" class="btn btn-primario" [disabled]="salvando()">{{ salvando() ? 'Salvando...' : 'Salvar' }}</button>
          <button type="button" class="btn btn-secundario" (click)="fechar.emit()">Cancelar</button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .fundo { position: fixed; inset: 0; background: rgba(20, 16, 40, 0.45); z-index: 40; }
    .modal {
      position: fixed; z-index: 41; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: min(520px, calc(100vw - 2rem)); max-height: calc(100vh - 2rem); overflow-y: auto;
    }
    h2 { margin: 0 0 1.25rem; font-size: 1.3rem; }
    .duas { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .acoes { display: flex; gap: 1rem; margin-top: 0.5rem; }
  `,
  host: { '(document:keydown.escape)': 'fechar.emit()' },
})
export class LancamentoModal implements OnInit {
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
