import { Alerta } from '../../shared/alerta';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';

export function senhasIguais(grupo: AbstractControl): ValidationErrors | null {
  const senha = grupo.get('senha')?.value;
  const confirmacao = grupo.get('confirmacao')?.value;
  return senha && confirmacao && senha !== confirmacao ? { senhasDiferentes: true } : null;
}

@Component({
  selector: 'app-cadastro',
  imports: [Alerta, ReactiveFormsModule, RouterLink],
  template: `
    <h1>Crie sua conta</h1>
    <p class="subtitulo">Comece a organizar seus eventos em poucos minutos</p>

    @if (erro()) {
      <app-alerta tom="danger">{{ erro() }}</app-alerta>
    }

    <form [formGroup]="form" (ngSubmit)="cadastrar()" novalidate>
      <div class="es-field">
        <label for="nome" class="es-field__label">Nome completo</label>
        <input id="nome" class="es-field__control" formControlName="nome" placeholder="Digite seu nome" autocomplete="name"
          [class.invalido]="form.controls.nome.touched && form.controls.nome.invalid" />
      </div>

      <div class="es-field">
        <label for="email" class="es-field__label">E-mail</label>
        <input id="email" type="email" class="es-field__control" formControlName="email" placeholder="Digite seu email" autocomplete="email"
          [class.invalido]="form.controls.email.touched && form.controls.email.invalid" />
      </div>

      <div class="es-field">
        <label for="senha" class="es-field__label">Senha</label>
        <input id="senha" type="password" class="es-field__control" formControlName="senha" placeholder="Mínimo de 8 caracteres"
          autocomplete="new-password" [class.invalido]="form.controls.senha.touched && form.controls.senha.invalid" />
        @if (form.controls.senha.touched && form.controls.senha.hasError('minlength')) {
          <span class="es-field__hint es-field__hint--erro">A senha deve ter pelo menos 8 caracteres.</span>
        }
      </div>

      <div class="es-field">
        <label for="confirmacao" class="es-field__label">Confirme a senha</label>
        <input id="confirmacao" type="password" class="es-field__control" formControlName="confirmacao" placeholder="Repita a senha"
          autocomplete="new-password" [class.invalido]="form.controls.confirmacao.touched && form.hasError('senhasDiferentes')" />
        @if (form.controls.confirmacao.touched && form.hasError('senhasDiferentes')) {
          <span class="es-field__hint es-field__hint--erro">As senhas não conferem.</span>
        }
      </div>

      <button type="submit" class="es-btn es-btn--primary" [disabled]="enviando()">
        {{ enviando() ? 'Criando conta…' : 'Criar conta' }}
      </button>
    </form>

    <p class="rodape">Já tem conta? <a routerLink="/login">Entrar</a></p>
  `,
  styleUrl: './auth-form.scss',
})
export class Cadastro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      nome: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmacao: ['', Validators.required],
    },
    { validators: senhasIguais },
  );

  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  protected cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Preencha todos os campos corretamente.');
      return;
    }

    const { nome, email, senha } = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set('');

    this.auth.cadastrar(nome, email, senha).subscribe({
      next: () => this.router.navigate(['/eventos']),
      error: (e) => {
        this.erro.set(mensagemDeErro(e, 'Não foi possível criar a conta.'));
        this.enviando.set(false);
      },
    });
  }
}
