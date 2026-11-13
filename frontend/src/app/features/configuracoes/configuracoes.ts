import { Icone } from '../../shared/icone';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface OpcaoConfiguracao {
  titulo: string;
  descricao: string;
  icone: string;
  rota?: string;
}

@Component({
  selector: 'app-configuracoes',
  imports: [Icone, RouterLink],
  template: `
    <div class="pagina">
    <h1>Configurações</h1>
    <div class="es-card grade">
      @for (opcao of opcoes; track opcao.titulo) {
        @if (opcao.rota) {
          <a class="opcao" [routerLink]="opcao.rota">
            <span class="es-stat__icon selo"><app-icone [nome]="opcao.icone" /></span>
            <span><strong>{{ opcao.titulo }}</strong><small>{{ opcao.descricao }}</small></span>
          </a>
        } @else {
          <div class="opcao desabilitada" title="Disponível em breve">
            <span class="es-stat__icon selo"><app-icone [nome]="opcao.icone" /></span>
            <span><strong>{{ opcao.titulo }}</strong><small>{{ opcao.descricao }}</small></span>
          </div>
        }
      }
    </div>
    </div>
  `,
  styles: `
    .grade {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-2) var(--space-8);
      max-width: 960px;
    }
    .opcao {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      color: inherit;
      text-decoration: none;
      transition: background-color 150ms ease;
    }
    a.opcao:hover { background: var(--surface-hover); color: inherit; }
    .desabilitada { opacity: 0.55; cursor: default; }
    .selo { width: 44px; height: 44px; flex: none; } .selo app-icone { font-size: 22px; }
    strong { display: block; font-size: 16px; line-height: 24px; font-weight: 600; color: var(--ink); }
    small { color: var(--ink-muted); font-size: 13px; }
  `,
})
export class Configuracoes {
  protected readonly opcoes: OpcaoConfiguracao[] = [
    { titulo: 'Configurações de usuário', descricao: 'Dados pessoais, foto de perfil', icone: 'user-cog', rota: '/perfil' },
    { titulo: 'Assinatura e cobrança', descricao: 'Planos, métodos de pagamento', icone: 'credit-card', rota: '/configuracoes/assinatura' },
    { titulo: 'Segurança e acesso', descricao: 'Alterar senha, MFA', icone: 'shield-check', rota: '/configuracoes/seguranca' },
    { titulo: 'Preferências do sistema', descricao: 'Idioma, zona temporal, tema', icone: 'sliders-horizontal', rota: '/configuracoes/preferencias' },
    { titulo: 'Dispositivos e sessões', descricao: 'Gerenciar dispositivos, sair', icone: 'monitor', rota: '/configuracoes/sessoes' },
    { titulo: 'Gerenciamento da conta', descricao: 'Excluir conta, histórico', icone: 'settings', rota: '/configuracoes/conta' },
  ];
}
