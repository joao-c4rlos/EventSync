import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemDeErro } from '../../core/erros';
import { UsuarioService } from '../../core/usuario.service';
import { senhasIguais } from '../auth/cadastro';

@Component({
  selector: 'app-seguranca',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <a routerLink="/configuracoes" class="voltar"><span class="icone">arrow_back</span> Configurações</a>
    <h1>Segurança e acesso</h1>

    <form class="card" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      <h2>Alterar senha</h2>
      @if (mensagem(); as m) {
        <div class="alerta" [class]="m.tipo" role="status">{{ m.texto }}</div>
      }

      <div class="campo">
        <label for="atual">Senha atual</label>
        <input id="atual" type="password" class="input" formControlName="senhaAtual" autocomplete="current-password" />
      </div>
      <div class="campo">
        <label for="nova">Nova senha</label>
        <input id="nova" type="password" class="input" formControlName="senha" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" />
      </div>
      <div class="campo">
        <label for="confirmacao">Confirme a nova senha</label>
        <input id="confirmacao" type="password" class="input" formControlName="confirmacao" autocomplete="new-password" />
        @if (form.controls.confirmacao.touched && form.hasError('senhasDiferentes')) {
          <span class="erro-campo">As senhas não conferem.</span>
        }
      </div>

      <div class="acoes">
        <button type="submit" class="btn btn-primario" [disabled]="salvando()">{{ salvando() ? 'Salvando...' : 'Alterar senha' }}</button>
      </div>
    </form>

    <section class="card mfa">
      <h2>Verificação em duas etapas (MFA)</h2>
      <p class="descricao">Uma camada extra de proteção para sua conta. Este recurso estará disponível em uma próxima versão.</p>
    </section>
  `,
  styleUrl: './config-pagina.scss',
  styles: `.mfa { margin-top: 1.5rem; opacity: 0.7; }`,
})
export class Seguranca {
  private readonly usuarios = inject(UsuarioService);

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      senhaAtual: ['', Validators.required],
      senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmacao: ['', Validators.required],
    },
    { validators: senhasIguais },
  );

  protected readonly salvando = signal(false);
  protected readonly mensagem = signal<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensagem.set({ tipo: 'erro', texto: 'Preencha os campos. A nova senha precisa ter pelo menos 8 caracteres.' });
      return;
    }

    const { senhaAtual, senha } = this.form.getRawValue();
    this.salvando.set(true);
    this.mensagem.set(null);
    this.usuarios.alterarSenha(senhaAtual, senha).subscribe({
      next: () => {
        this.form.reset();
        this.mensagem.set({ tipo: 'sucesso', texto: 'Senha alterada com sucesso.' });
        this.salvando.set(false);
      },
      error: (e) => {
        this.mensagem.set({ tipo: 'erro', texto: mensagemDeErro(e) });
        this.salvando.set(false);
      },
    });
  }
}
