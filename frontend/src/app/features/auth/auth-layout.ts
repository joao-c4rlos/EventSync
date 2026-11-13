import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="pagina">
      <section class="vitrine" aria-hidden="true">
        <span class="overline">Gestão de eventos</span>
        <div class="mensagem">
          <p>Tudo em sincronia, resultado crescendo.</p>
          <small>Organize inscrições, financeiro e indicadores dos seus eventos em um só lugar.</small>
        </div>
        <div class="barras"><i></i><i></i><i></i></div>
      </section>
      <section class="formulario">
        <div class="coluna">
          <img class="logo" src="/eventsync-logo.jpg" width="1024" height="559" alt="EventSync — sistema para gestão de eventos" />
          <router-outlet />
        </div>
      </section>
    </div>
  `,
  styleUrl: './auth.scss',
})
export class AuthLayout {}
