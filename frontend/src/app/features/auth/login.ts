import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Bem-vindo de volta!</h1>
    <p class="subtitulo">Faça login para acessar seu painel de controle</p>

    @if (erro()) {
      <div class="alerta erro" role="alert">{{ erro() }}</div>
    }

    <form [formGroup]="form" (ngSubmit)="entrar()" novalidate>
      <div class="campo">
        <label for="email">Email</label>
        <input id="email" type="email" class="input" formControlName="email" placeholder="Digite seu email" autocomplete="email"
          [class.invalido]="form.controls.email.touched && form.controls.email.invalid" />
      </div>

      <div class="campo">
        <label for="senha">Senha</label>
        <div class="senha">
          <input id="senha" [type]="mostrarSenha() ? 'text' : 'password'" class="input" formControlName="senha"
            placeholder="Digite sua senha" autocomplete="current-password"
            [class.invalido]="form.controls.senha.touched && form.controls.senha.invalid" />
          <button type="button" (click)="mostrarSenha.set(!mostrarSenha())" [attr.aria-label]="mostrarSenha() ? 'Ocultar senha' : 'Mostrar senha'">
            <span class="icone">{{ mostrarSenha() ? 'visibility_off' : 'visibility' }}</span>
          </button>
        </div>
      </div>

      <div class="linha">
        <label><input type="checkbox" formControlName="lembrar" /> Lembre-se</label>
        <a routerLink="/esqueci-senha">Esqueceu sua senha?</a>
      </div>

      <button type="submit" class="btn btn-roxo" [disabled]="enviando()">
        {{ enviando() ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="rodape">Novo no EventSync? <a routerLink="/cadastro">Cadastre-se</a></p>
  `,
  styleUrl: './auth-form.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
    lembrar: [false],
  });

  protected readonly mostrarSenha = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Informe um e-mail válido e sua senha.');
      return;
    }

    const { email, senha, lembrar } = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set('');

    this.auth.login(email, senha, lembrar).subscribe({
      next: () => this.router.navigate(['/eventos']),
      error: (e) => {
        this.erro.set(mensagemDeErro(e, 'Não foi possível entrar.'));
        this.enviando.set(false);
      },
    });
  }
}
