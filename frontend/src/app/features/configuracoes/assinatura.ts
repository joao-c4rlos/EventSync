import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';
import { Plano } from '../../core/models';
import { UsuarioService } from '../../core/usuario.service';

interface OpcaoPlano {
  plano: Plano;
  nome: string;
  preco: number;
  recursos: string[];
}

@Component({
  selector: 'app-assinatura',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <a routerLink="/configuracoes" class="voltar"><span class="icone">arrow_back</span> Configurações</a>
    <h1>Assinatura e cobrança</h1>
    <p class="aviso">Ambiente de demonstração: a troca de plano é simulada e nenhuma cobrança é realizada.</p>

    @if (erro()) {
      <div class="alerta erro" role="alert">{{ erro() }}</div>
    }

    <div class="planos">
      @for (p of planos; track p.plano) {
        <div class="card plano" [class.atual]="usuario()?.plano === p.plano">
          <h2>{{ p.nome }}</h2>
          <p class="preco">
            @if (p.preco === 0) { Grátis } @else { {{ p.preco | currency: 'BRL' }}<small>/mês</small> }
          </p>
          <ul>
            @for (r of p.recursos; track r) {
              <li><span class="icone">check</span> {{ r }}</li>
            }
          </ul>
          @if (usuario()?.plano === p.plano) {
            <span class="selo">Plano atual</span>
          } @else {
            <button type="button" class="btn btn-roxo" [disabled]="alterando()" (click)="escolher(p.plano)">Escolher plano</button>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './config-pagina.scss',
  styles: `
    .aviso { color: var(--cor-texto-suave); font-size: 0.9rem; margin: -0.75rem 0 1.5rem; }
    .planos { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; max-width: 960px; }
    .plano { max-width: none; display: flex; flex-direction: column; border: 2px solid transparent; }
    .plano.atual { border-color: var(--cor-roxo); }
    .preco { font-size: 1.8rem; font-weight: 700; margin: 0 0 1rem; }
    .preco small { font-size: 0.9rem; font-weight: 400; color: var(--cor-texto-suave); }
    ul { list-style: none; padding: 0; margin: 0 0 1.5rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; }
    li { display: flex; align-items: center; gap: 0.4rem; }
    li .icone { color: var(--cor-verde); font-size: 18px; }
    .selo { text-align: center; padding: 0.7rem; border-radius: var(--raio); background: var(--cor-roxo-claro); color: var(--cor-roxo); font-weight: 500; }
  `,
})
export class Assinatura {
  private readonly usuarios = inject(UsuarioService);
  protected readonly usuario = inject(AuthService).usuario;

  protected readonly alterando = signal(false);
  protected readonly erro = signal('');

  protected readonly planos: OpcaoPlano[] = [
    { plano: 'GRATUITO', nome: 'Gratuito', preco: 0, recursos: ['Até 3 eventos ativos', 'Página pública de inscrição', 'Controle financeiro básico'] },
    { plano: 'PROFISSIONAL', nome: 'Profissional', preco: 49.9, recursos: ['Eventos ilimitados', 'Relatórios completos', 'Notificações avançadas'] },
    { plano: 'EMPRESARIAL', nome: 'Empresarial', preco: 149.9, recursos: ['Tudo do Profissional', 'Múltiplos organizadores', 'Suporte prioritário'] },
  ];

  protected escolher(plano: Plano): void {
    this.alterando.set(true);
    this.erro.set('');
    this.usuarios.alterarPlano(plano).subscribe({
      next: () => this.alterando.set(false),
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.alterando.set(false);
      },
    });
  }
}
