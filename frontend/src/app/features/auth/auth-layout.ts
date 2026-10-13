import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="pagina">
      <section class="vitrine" aria-hidden="true">
        <div class="logo">
          <span class="selo"><span class="icone">sync</span></span>
          EVENTSYNC
        </div>
        <p>Organize, planeje e transforme experiências em momentos inesquecíveis.</p>
      </section>
      <section class="formulario">
        <router-outlet />
      </section>
    </div>
  `,
  styleUrl: './auth.scss',
})
export class AuthLayout {}
