import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { mensagemDeErro } from '../../core/erros';
import { EventosService } from '../../core/eventos.service';
import { Evento, TipoEvento } from '../../core/models';
import { hora, TIPOS_EVENTO } from '../../shared/rotulos';

@Component({
  selector: 'app-evento-form',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './evento-form.html',
  styleUrl: './evento-form.scss',
})
export class EventoForm implements OnInit {
  private readonly service = inject(EventosService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly tipos = TIPOS_EVENTO;
  protected readonly editando = computed(() => !!this.id());
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');

  protected readonly form = inject(FormBuilder).group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    tipo: [null as TipoEvento | null, Validators.required],
    dataInicio: ['', Validators.required],
    dataFim: [''],
    horaInicio: ['', Validators.required],
    horaFim: [''],
    local: ['', [Validators.required, Validators.maxLength(200)]],
    capacidade: [null as number | null, [Validators.required, Validators.min(1)]],
    descricao: ['', Validators.maxLength(5000)],
    gastoPrevisto: [null as number | null, Validators.min(0)],
    receitaPrevista: [null as number | null, Validators.min(0)],
  });

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  protected readonly lucroPrevisto = computed(
    () => (Number(this.valores().receitaPrevista) || 0) - (Number(this.valores().gastoPrevisto) || 0),
  );

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    this.carregando.set(true);
    this.service.detalhar(Number(id)).subscribe({
      next: (e) => {
        this.preencher(e);
        this.carregando.set(false);
      },
      error: () => this.router.navigate(['/eventos']),
    });
  }

  protected invalido(campo: 'titulo' | 'tipo' | 'dataInicio' | 'horaInicio' | 'local' | 'capacidade'): boolean {
    const c = this.form.controls[campo];
    return c.touched && c.invalid;
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Preencha os campos obrigatórios destacados.');
      return;
    }

    const v = this.form.getRawValue();
    const dados = {
      titulo: v.titulo!,
      tipo: v.tipo!,
      dataInicio: v.dataInicio!,
      dataFim: v.dataFim || null,
      horaInicio: v.horaInicio!,
      horaFim: v.horaFim || null,
      local: v.local!,
      capacidade: Number(v.capacidade),
      descricao: v.descricao || null,
      gastoPrevisto: Number(v.gastoPrevisto) || 0,
      receitaPrevista: Number(v.receitaPrevista) || 0,
    };

    this.salvando.set(true);
    this.erro.set('');
    const id = this.id();
    const requisicao = id ? this.service.atualizar(Number(id), dados) : this.service.criar(dados);

    requisicao.subscribe({
      next: (e) => this.router.navigate(['/eventos', e.id]),
      error: (e) => {
        this.erro.set(mensagemDeErro(e, 'Não foi possível salvar o evento.'));
        this.salvando.set(false);
      },
    });
  }

  protected cancelar(): void {
    const id = this.id();
    this.router.navigate(id ? ['/eventos', id] : ['/eventos']);
  }

  private preencher(e: Evento): void {
    this.form.setValue({
      titulo: e.titulo,
      tipo: e.tipo,
      dataInicio: e.dataInicio,
      dataFim: e.dataFim ?? '',
      horaInicio: hora(e.horaInicio),
      horaFim: hora(e.horaFim),
      local: e.local,
      capacidade: e.capacidade,
      descricao: e.descricao ?? '',
      gastoPrevisto: e.gastoPrevisto,
      receitaPrevista: e.receitaPrevista,
    });
  }
}
