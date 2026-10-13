import { Component } from '@angular/core';

@Component({
  selector: 'app-eventos',
  template: `
    <section class="vazio">
      <h1>Gerencie eventos de forma inteligente.</h1>
      <p>
        Transforme sua visão em experiências memoráveis com a plataforma de gestão de eventos mais completa.
      </p>
      <button type="button" class="btn btn-primario" disabled title="Disponível na próxima sprint">
        Criar meu primeiro evento
      </button>
    </section>
  `,
  styles: `
    .vazio {
      text-align: center;
      max-width: 560px;
      margin: 1rem auto 0;
    }
    h1 { margin-bottom: 1rem; }
    p { line-height: 1.5; margin: 0 0 1.5rem; }
  `,
})
export class Eventos {}
