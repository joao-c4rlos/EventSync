import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { mensagemDeErro } from '../../core/erros';
import { EventosService } from '../../core/eventos.service';
import { EventoPublico } from '../../core/models';
import { hora, tipoEvento } from '../../shared/rotulos';

@Component({
  selector: 'app-evento-publico',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './evento-publico.html',
  styleUrl: './evento-publico.scss',
})
export class EventoPublicoPage implements OnInit {
  private readonly service = inject(EventosService);

  readonly slug = input.required<string>();

  protected readonly evento = signal<EventoPublico | null>(null);
  protected readonly naoEncontrado = signal(false);
  protected readonly enviando = signal(false);
  protected readonly inscrito = signal(false);
  protected readonly erro = signal('');

  protected readonly tipo = tipoEvento;
  protected readonly hora = hora;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', Validators.pattern(/^$|^[0-9()+\- ]{8,20}$/)],
  });

  ngOnInit(): void {
    this.service.publico(this.slug()).subscribe({
      next: (e) => this.evento.set(e),
      error: () => this.naoEncontrado.set(true),
    });
  }

  protected inscrever(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Informe seu nome e um e-mail válido.');
      return;
    }

    this.enviando.set(true);
    this.erro.set('');
    this.service.inscrever(this.slug(), this.form.getRawValue()).subscribe({
      next: () => {
        this.inscrito.set(true);
        this.evento.update((e) => (e ? { ...e, vagasRestantes: e.vagasRestantes - 1 } : e));
      },
      error: (e: HttpErrorResponse) => {
        this.erro.set(mensagemDeErro(e, 'Não foi possível concluir a inscrição.'));
        this.enviando.set(false);
      },
    });
  }
}
