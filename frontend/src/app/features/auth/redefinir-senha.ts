import { Alerta } from '../../shared/alerta';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';
import { senhasIguais } from './cadastro';

@Component({
  selector: 'app-redefinir-senha',
  imports: [Alerta, ReactiveFormsModule, RouterLink],
  template: `
    <h1>Nova senha</h1>
    <p class="subtitulo">Escolha uma nova senha para sua conta</p>

    @if (!token()) {
      <app-alerta tom="danger">Link inválido. Solicite um novo link de redefinição.</app-alerta>
      <p class="rodape"><a routerLink="/esqueci-senha">Solicitar novo link</a></p>
    } @else if (concluido()) {
      <app-alerta tom="success">Senha alterada com sucesso! Você já pode entrar com a nova senha.</app-alerta>
      <p class="rodape"><a routerLink="/login">Ir para o login</a></p>
    } @else {
      @if (erro()) {
        <app-alerta tom="danger">{{ erro() }}</app-alerta>
      }

      <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
        <div class="es-field">
          <label for="senha" class="es-field__label">Nova senha</label>
          <input id="senha" type="password" class="es-field__control" formControlName="senha" placeholder="Mínimo de 8 caracteres"
            autocomplete="new-password" [class.invalido]="form.controls.senha.touched && form.controls.senha.invalid" />
        </div>

        <div class="es-field">
          <label for="confirmacao" class="es-field__label">Confirme a nova senha</label>
          <input id="confirmacao" type="password" class="es-field__control" formControlName="confirmacao" placeholder="Repita a senha"
            autocomplete="new-password" [class.invalido]="form.controls.confirmacao.touched && form.hasError('senhasDiferentes')" />
          @if (form.controls.confirmacao.touched && form.hasError('senhasDiferentes')) {
            <span class="es-field__hint es-field__hint--erro">As senhas não conferem.</span>
          }
        </div>

        <button type="submit" class="es-btn es-btn--primary" [disabled]="enviando()">
          {{ enviando() ? 'Salvando…' : 'Salvar nova senha' }}
        </button>
      </form>
    }
  `,
  styleUrl: './auth-form.scss',
})
export class RedefinirSenha {
  private readonly auth = inject(AuthService);

  readonly token = input('');

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmacao: ['', Validators.required],
    },
    { validators: senhasIguais },
  );

  protected readonly enviando = signal(false);
  protected readonly concluido = signal(false);
  protected readonly erro = signal('');

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('A senha deve ter pelo menos 8 caracteres e as duas devem ser iguais.');
      return;
    }

    this.enviando.set(true);
    this.erro.set('');

    this.auth.redefinirSenha(this.token(), this.form.getRawValue().senha).subscribe({
      next: () => this.concluido.set(true),
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.enviando.set(false);
      },
    });
  }
}
