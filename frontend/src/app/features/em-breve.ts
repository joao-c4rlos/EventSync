import { Component, input } from '@angular/core';

@Component({
  selector: 'app-em-breve',
  template: `
    <h1>{{ titulo() }}</h1>
    <div class="card aviso">
      <span class="icone" aria-hidden="true">construction</span>
      <p>Esta seção está em desenvolvimento e será liberada nas próximas sprints.</p>
    </div>
  `,
  styles: `
    .aviso { display: flex; align-items: center; gap: 1rem; color: var(--cor-texto-suave); }
    .icone { font-size: 32px; color: var(--cor-roxo); }
    p { margin: 0; }
  `,
})
export class EmBreve {
  readonly titulo = input('');
}
