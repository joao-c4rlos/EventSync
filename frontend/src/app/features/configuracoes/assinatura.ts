import { Alerta } from '../../shared/alerta';
import { Icone } from '../../shared/icone';
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
  imports: [Alerta, Icone, RouterLink, CurrencyPipe],
  template: `
    <a routerLink="/configuracoes" class="es-btn es-btn--ghost es-btn--sm voltar"><app-icone nome="arrow-left" /> Configurações</a>
    <h1>Assinatura e cobrança</h1>
    <app-alerta tom="info" titulo="Ambiente de demonstração">A troca de plano é simulada e nenhuma cobrança é realizada.</app-alerta>

    @if (erro()) {
      <app-alerta tom="danger">{{ erro() }}</app-alerta>
    }

    <div class="planos">
      @for (p of planos; track p.plano) {
        <div class="es-card plano" [class.atual]="usuario()?.plano === p.plano">
          <h2>{{ p.nome }}</h2>
          <p class="preco">
            @if (p.preco === 0) { Grátis } @else { {{ p.preco | currency: 'BRL' }}<small>/mês</small> }
          </p>
          <ul>
            @for (r of p.recursos; track r) {
              <li><app-icone nome="check" /> {{ r }}</li>
            }
          </ul>
          @if (usuario()?.plano === p.plano) {
            <span class="selo">Plano atual</span>
          } @else {
            <button type="button" class="es-btn es-btn--primary" [disabled]="alterando()" (click)="escolher(p.plano)">Escolher plano</button>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './config-pagina.scss',
  styles: `
    .planos { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-6); max-width: 960px; }
    .plano { max-width: none; display: flex; flex-direction: column; border: 2px solid var(--border); }
    .plano.atual { border-color: var(--primary); }
    .preco { font: 600 32px/40px var(--font-display); margin: 0 0 var(--space-4); }
    .preco small { font: 400 14px/22px var(--font-text); color: var(--ink-muted); }
    ul { list-style: none; padding: 0; margin: 0 0 1.5rem; flex: 1; display: flex; flex-direction: column; gap: var(--space-2); font-size: 14px; }
    li { display: flex; align-items: center; gap: var(--space-2); }
    li .icone { color: var(--success); font-size: 16px; }
    .selo { text-align: center; padding: var(--space-2); border-radius: var(--radius-md); background: var(--primary-soft); color: var(--primary); font-weight: 600; }
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
