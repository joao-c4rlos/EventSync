import { Alerta } from '../../shared/alerta';
import { Icone } from '../../shared/icone';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';
import { UsuarioService } from '../../core/usuario.service';

@Component({
  selector: 'app-conta',
  imports: [Alerta, Icone, FormsModule, RouterLink],
  template: `
    <a routerLink="/configuracoes" class="es-btn es-btn--ghost es-btn--sm voltar"><app-icone nome="arrow-left" /> Configurações</a>
    <h1>Gerenciamento da conta</h1>

    <section class="es-card perigo">
      <h2>Excluir conta</h2>
      <p class="descricao">
        Esta ação é permanente. Todos os seus eventos, inscrições e lançamentos financeiros serão apagados
        e não poderão ser recuperados.
      </p>

      @if (erro()) {
        <app-alerta tom="danger">{{ erro() }}</app-alerta>
      }

      <form (ngSubmit)="excluir()">
        <div class="es-field">
          <label for="senha" class="es-field__label">Digite sua senha para confirmar</label>
          <input id="senha" type="password" class="es-field__control" name="senha" [(ngModel)]="senha" autocomplete="current-password" />
        </div>
        <label class="es-check confirmacao">
          <input type="checkbox" name="ciente" [(ngModel)]="ciente" /><span class="es-check__box"></span>Entendo que esta ação não pode ser desfeita
        </label>
        <button type="submit" class="es-btn es-btn--danger" [disabled]="!senha || !ciente || excluindo()">
          {{ excluindo() ? 'Excluindo…' : 'Excluir minha conta' }}
        </button>
      </form>
    </section>
  `,
  styleUrl: './config-pagina.scss',
  styles: `
    .perigo { border-color: var(--danger); }
    .perigo h2 { color: var(--danger); }
    .confirmacao { display: flex; align-items: center; gap: var(--space-2); font-size: 14px; font-weight: 500; margin-bottom: var(--space-5); cursor: pointer; }
  `,
})
export class Conta {
  private readonly usuarios = inject(UsuarioService);
  private readonly auth = inject(AuthService);

  protected senha = '';
  protected ciente = false;
  protected readonly excluindo = signal(false);
  protected readonly erro = signal('');

  protected excluir(): void {
    this.excluindo.set(true);
    this.erro.set('');
    this.usuarios.excluirConta(this.senha).subscribe({
      next: () => this.auth.sair(),
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.excluindo.set(false);
      },
    });
  }
}
