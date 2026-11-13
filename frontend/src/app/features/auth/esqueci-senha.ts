import { Alerta } from '../../shared/alerta';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';

@Component({
  selector: 'app-esqueci-senha',
  imports: [Alerta, ReactiveFormsModule, RouterLink],
  template: `
    <h1>Esqueceu a senha?</h1>
    <p class="subtitulo">Informe seu e-mail e enviaremos um link para criar uma nova senha</p>

    @if (enviado()) {
      <app-alerta tom="success">
        Se houver uma conta com este e-mail, você receberá um link para redefinir a senha.
      </app-alerta>
    } @else {
      @if (erro()) {
        <app-alerta tom="danger">{{ erro() }}</app-alerta>
      }

      <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
        <div class="es-field">
          <label for="email" class="es-field__label">E-mail</label>
          <input id="email" type="email" class="es-field__control" formControlName="email" placeholder="Digite seu email" autocomplete="email"
            [class.invalido]="form.controls.email.touched && form.controls.email.invalid" />
        </div>

        <button type="submit" class="es-btn es-btn--primary" [disabled]="enviando()">
          {{ enviando() ? 'Enviando…' : 'Enviar link' }}
        </button>
      </form>
    }

    <p class="rodape"><a routerLink="/login">Voltar para o login</a></p>
  `,
  styleUrl: './auth-form.scss',
})
export class EsqueciSenha {
  private readonly auth = inject(AuthService);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly erro = signal('');

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Informe um e-mail válido.');
      return;
    }

    this.enviando.set(true);
    this.erro.set('');

    this.auth.esqueciSenha(this.form.getRawValue().email).subscribe({
      next: () => this.enviado.set(true),
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.enviando.set(false);
      },
    });
  }
}
