import { Alerta } from '../../shared/alerta';
import { Icone } from '../../shared/icone';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { mensagemDeErro } from '../../core/erros';
import { UsuarioService } from '../../core/usuario.service';
import { senhasIguais } from '../auth/cadastro';

@Component({
  selector: 'app-seguranca',
  imports: [Alerta, Icone, ReactiveFormsModule, RouterLink],
  template: `
    <a routerLink="/configuracoes" class="es-btn es-btn--ghost es-btn--sm voltar"><app-icone nome="arrow-left" /> Configurações</a>
    <h1>Segurança e acesso</h1>

    <form class="es-card" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      <h2>Alterar senha</h2>
      @if (mensagem(); as m) {
        <app-alerta [tom]="m.tipo">{{ m.texto }}</app-alerta>
      }

      <div class="es-field">
        <label for="atual" class="es-field__label">Senha atual</label>
        <input id="atual" type="password" class="es-field__control" formControlName="senhaAtual" autocomplete="current-password" />
      </div>
      <div class="es-field">
        <label for="nova" class="es-field__label">Nova senha</label>
        <input id="nova" type="password" class="es-field__control" formControlName="senha" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" />
      </div>
      <div class="es-field">
        <label for="confirmacao" class="es-field__label">Confirme a nova senha</label>
        <input id="confirmacao" type="password" class="es-field__control" formControlName="confirmacao" autocomplete="new-password" />
        @if (form.controls.confirmacao.touched && form.hasError('senhasDiferentes')) {
          <span class="es-field__hint es-field__hint--erro">As senhas não conferem.</span>
        }
      </div>

      <div class="acoes">
        <button type="submit" class="es-btn es-btn--primary" [disabled]="salvando()">{{ salvando() ? 'Salvando…' : 'Alterar senha' }}</button>
      </div>
    </form>

    <section class="es-card mfa">
      <h2>Verificação em duas etapas (MFA)</h2>
      <p class="descricao">Uma camada extra de proteção para sua conta. Este recurso estará disponível em uma próxima versão.</p>
    </section>
  `,
  styleUrl: './config-pagina.scss',
  styles: `.mfa { opacity: 0.7; }`,
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
