import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { Avatar } from '../shared/avatar';

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

  protected readonly usuario = this.auth.usuario;
  protected readonly primeiroNome = computed(() => this.usuario()?.nome.split(' ').slice(0, 2).join(' ') ?? '');
  protected readonly menuUsuarioAberto = signal(false);
  protected readonly sidebarAberta = signal(false);

  protected readonly itens: ItemMenu[] = [
    { rota: '/dashboard', rotulo: 'Dashboard', icone: 'space_dashboard' },
    { rota: '/eventos', rotulo: 'Eventos', icone: 'calendar_today' },
    { rota: '/financeiro', rotulo: 'Financeiro', icone: 'currency_exchange' },
    { rota: '/configuracoes', rotulo: 'Configurações', icone: 'settings' },
  ];

  constructor() {
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.sidebarAberta.set(false);
        this.menuUsuarioAberto.set(false);
      });
  }

  @HostListener('document:keydown.escape')
  protected fecharMenus(): void {
    this.menuUsuarioAberto.set(false);
    this.sidebarAberta.set(false);
  }

  protected sair(): void {
    this.auth.sair();
  }
}
