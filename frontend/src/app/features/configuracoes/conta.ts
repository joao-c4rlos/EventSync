import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';
import { UsuarioService } from '../../core/usuario.service';

@Component({
  selector: 'app-conta',
  imports: [FormsModule, RouterLink],
  template: `
    <a routerLink="/configuracoes" class="voltar"><span class="icone">arrow_back</span> Configurações</a>
    <h1>Gerenciamento da conta</h1>

    <section class="card perigo">
      <h2>Excluir conta</h2>
      <p class="descricao">
        Esta ação é permanente. Todos os seus eventos, inscrições e lançamentos financeiros serão apagados
        e não poderão ser recuperados.
      </p>

      @if (erro()) {
        <div class="alerta erro" role="alert">{{ erro() }}</div>
      }

      <form (ngSubmit)="excluir()">
        <div class="campo">
          <label for="senha">Digite sua senha para confirmar</label>
          <input id="senha" type="password" class="input" name="senha" [(ngModel)]="senha" autocomplete="current-password" />
        </div>
        <label class="confirmacao">
          <input type="checkbox" name="ciente" [(ngModel)]="ciente" /> Entendo que esta ação não pode ser desfeita
        </label>
        <button type="submit" class="btn excluir" [disabled]="!senha || !ciente || excluindo()">
          {{ excluindo() ? 'Excluindo...' : 'Excluir minha conta' }}
        </button>
      </form>
    </section>
  `,
  styleUrl: './config-pagina.scss',
  styles: `
    .perigo { border: 1px solid #f1c4c9; }
    .perigo h2 { color: var(--cor-erro); }
    .confirmacao { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; margin-bottom: 1.25rem; cursor: pointer; }
    .excluir { background: var(--cor-erro); }
    .excluir:hover:not(:disabled) { background: #b92a39; }
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
