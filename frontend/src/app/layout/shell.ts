import { DOCUMENT } from '@angular/common';
import { Component, computed, DestroyRef, effect, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { ICONE_NOTIFICACAO, NotificacoesService } from '../core/notificacoes.service';
import { Avatar } from '../shared/avatar';

const INTERVALO_NOTIFICACOES_MS = 60_000;

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Avatar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly notificacoes = inject(NotificacoesService);

  protected readonly usuario = this.auth.usuario;
  protected readonly primeiroNome = computed(() => this.usuario()?.nome.split(' ').slice(0, 2).join(' ') ?? '');
  protected readonly menuUsuarioAberto = signal(false);
  protected readonly menuNotificacoesAberto = signal(false);
  protected readonly sidebarAberta = signal(false);
  protected readonly iconeNotificacao = ICONE_NOTIFICACAO;

  protected readonly itens: ItemMenu[] = [
    { rota: '/dashboard', rotulo: 'Dashboard', icone: 'space_dashboard' },
    { rota: '/eventos', rotulo: 'Eventos', icone: 'calendar_today' },
    { rota: '/financeiro', rotulo: 'Financeiro', icone: 'currency_exchange' },
    { rota: '/configuracoes', rotulo: 'Configurações', icone: 'settings' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.fecharMenus());

    this.notificacoes.atualizar();
    const intervalo = setInterval(() => this.notificacoes.atualizar(), INTERVALO_NOTIFICACOES_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(intervalo));

    const body = inject(DOCUMENT).body;
    effect(() => body.classList.toggle('tema-escuro', this.usuario()?.tema === 'ESCURO'));
    inject(DestroyRef).onDestroy(() => body.classList.remove('tema-escuro'));
  }

  @HostListener('document:keydown.escape')
  protected fecharMenus(): void {
    this.menuUsuarioAberto.set(false);
    this.menuNotificacoesAberto.set(false);
    this.sidebarAberta.set(false);
  }

  protected alternarNotificacoes(): void {
    const abrir = !this.menuNotificacoesAberto();
    this.menuUsuarioAberto.set(false);
    this.menuNotificacoesAberto.set(abrir);
    if (abrir) {
      this.notificacoes.atualizar();
      this.notificacoes.marcarTodasComoLidas();
    }
  }

  protected buscar(evento: Event, termo: string): void {
    evento.preventDefault();
    this.router.navigate(['/eventos'], { queryParams: { busca: termo.trim() || null } });
  }

  protected sair(): void {
    this.auth.sair();
  }
}
