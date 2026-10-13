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
  imports: [RouterLink],
  template: `
    <h1>Configurações</h1>
    <div class="card grade">
      @for (opcao of opcoes; track opcao.titulo) {
        @if (opcao.rota) {
          <a class="opcao" [routerLink]="opcao.rota">
            <span class="icone" aria-hidden="true">{{ opcao.icone }}</span>
            <span><strong>{{ opcao.titulo }}</strong><small>{{ opcao.descricao }}</small></span>
          </a>
        } @else {
          <div class="opcao desabilitada" title="Disponível nas próximas sprints">
            <span class="icone" aria-hidden="true">{{ opcao.icone }}</span>
            <span><strong>{{ opcao.titulo }}</strong><small>{{ opcao.descricao }}</small></span>
          </div>
        }
      }
    </div>
  `,
  styles: `
    .grade {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 0.75rem 2rem;
      max-width: 860px;
    }
    .opcao {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 0.9rem 1.1rem;
      border-radius: var(--raio);
      color: inherit;
      text-decoration: none;
      transition: background 0.15s;
    }
    a.opcao:hover { background: var(--cor-fundo); }
    .desabilitada { opacity: 0.55; cursor: default; }
    .icone { font-size: 44px; color: var(--cor-roxo); font-variation-settings: 'FILL' 1; }
    strong { display: block; font-size: 1.1rem; margin-bottom: 0.2rem; }
    small { color: var(--cor-texto-suave); font-size: 0.85rem; }
  `,
})
export class Configuracoes {
  protected readonly opcoes: OpcaoConfiguracao[] = [
    { titulo: 'Configurações de usuário', descricao: 'Dados pessoais, foto de perfil', icone: 'manage_accounts', rota: '/perfil' },
    { titulo: 'Assinatura e cobrança', descricao: 'Planos, métodos de pagamento', icone: 'credit_card', rota: '/configuracoes/assinatura' },
    { titulo: 'Segurança e acesso', descricao: 'Alterar senha, MFA', icone: 'shield_lock', rota: '/configuracoes/seguranca' },
    { titulo: 'Preferências do sistema', descricao: 'Idioma, zona temporal, tema', icone: 'tune', rota: '/configuracoes/preferencias' },
    { titulo: 'Dispositivos e sessões', descricao: 'Gerenciar dispositivos, sair', icone: 'computer', rota: '/configuracoes/sessoes' },
    { titulo: 'Gerenciamento da conta', descricao: 'Excluir conta, histórico', icone: 'settings', rota: '/configuracoes/conta' },
  ];
}
