import { Alerta } from '../../shared/alerta';
import { Icone } from '../../shared/icone';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';

@Component({
  selector: 'app-login',
  imports: [Alerta, Icone, ReactiveFormsModule, RouterLink],
  template: `
    <h1>Bem-vindo de volta!</h1>
    <p class="subtitulo">Faça login para acessar seu painel de controle</p>

    @if (erro()) {
      <app-alerta tom="danger">{{ erro() }}</app-alerta>
    }

    <form [formGroup]="form" (ngSubmit)="entrar()" novalidate>
      <div class="es-field">
        <label for="email" class="es-field__label">E-mail</label>
        <input id="email" type="email" class="es-field__control" formControlName="email" placeholder="Digite seu email" autocomplete="email"
          [class.invalido]="form.controls.email.touched && form.controls.email.invalid" />
      </div>

      <div class="es-field">
        <label for="senha" class="es-field__label">Senha</label>
        <div class="senha">
          <input id="senha" [type]="mostrarSenha() ? 'text' : 'password'" class="es-field__control" formControlName="senha"
            placeholder="Digite sua senha" autocomplete="current-password"
            [class.invalido]="form.controls.senha.touched && form.controls.senha.invalid" />
          <button type="button" (click)="mostrarSenha.set(!mostrarSenha())" [attr.aria-label]="mostrarSenha() ? 'Ocultar senha' : 'Mostrar senha'">
            <app-icone [nome]="mostrarSenha() ? 'eye-off' : 'eye'" />
          </button>
        </div>
      </div>

      <div class="opcoes">
        <label class="es-check"><input type="checkbox" formControlName="lembrar" /><span class="es-check__box"></span>Lembrar de mim</label>
        <a routerLink="/esqueci-senha">Esqueceu sua senha?</a>
      </div>

      <button type="submit" class="es-btn es-btn--primary" [disabled]="enviando()">
        {{ enviando() ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>

    <p class="rodape demo">
      Quer só explorar? Use a conta de demonstração:
      <button type="button" class="link-demo" (click)="usarDemo()">demo@eventsync.com.br / demo12345</button>
    </p>

    <p class="rodape">Novo no EventSync? <a routerLink="/cadastro">Cadastre-se</a></p>
  `,
  styleUrl: './auth-form.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
    lembrar: [false],
  });

  protected readonly mostrarSenha = signal(false);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');

  /** Preenche a conta de demonstração (criada pelo back-end com eventos e dados simulados). */
  protected usarDemo(): void {
    this.form.patchValue({ email: 'demo@eventsync.com.br', senha: 'demo12345' });
  }

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
      next: () => {
        // Só aceita caminhos internos, para evitar redirecionamento para sites externos.
        const retorno = this.route.snapshot.queryParamMap.get('retorno');
        const destino = retorno && retorno.startsWith('/') && !retorno.startsWith('//') ? retorno : '/dashboard';
        this.router.navigateByUrl(destino);
      },
      error: (e) => {
        this.erro.set(mensagemDeErro(e, 'Não foi possível entrar.'));
        this.enviando.set(false);
      },
    });
  }
}
