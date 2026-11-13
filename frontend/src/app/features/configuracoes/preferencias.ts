import { Alerta } from '../../shared/alerta';
import { Icone } from '../../shared/icone';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';
import { Tema } from '../../core/models';
import { UsuarioService } from '../../core/usuario.service';

@Component({
  selector: 'app-preferencias',
  imports: [Alerta, Icone, ReactiveFormsModule, RouterLink],
  template: `
    <a routerLink="/configuracoes" class="es-btn es-btn--ghost es-btn--sm voltar"><app-icone nome="arrow-left" /> Configurações</a>
    <h1>Preferências do sistema</h1>

    <form class="es-card" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      @if (mensagem(); as m) {
        <app-alerta [tom]="m.tipo">{{ m.texto }}</app-alerta>
      }

      <div class="es-field">
        <label for="idioma" class="es-field__label">Idioma</label>
        <span class="es-select-wrap"><select id="idioma" class="es-select" formControlName="idioma">
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US" disabled>English (em breve)</option>
          <option value="es" disabled>Español (em breve)</option>
        </select></span>
      </div>

      <div class="es-field">
        <label for="fuso" class="es-field__label">Zona temporal</label>
        <span class="es-select-wrap"><select id="fuso" class="es-select" formControlName="fusoHorario">
          @for (f of fusos; track f.valor) {
            <option [value]="f.valor">{{ f.rotulo }}</option>
          }
        </select></span>
      </div>

      <fieldset class="es-field">
        <legend>Tema</legend>
        <div class="temas">
          <label class="tema" [class.ativo]="form.controls.tema.value === 'CLARO'">
            <input type="radio" formControlName="tema" value="CLARO" class="sr-only" />
            <app-icone nome="sun" /> Claro
          </label>
          <label class="tema" [class.ativo]="form.controls.tema.value === 'ESCURO'">
            <input type="radio" formControlName="tema" value="ESCURO" class="sr-only" />
            <app-icone nome="moon" /> Escuro
          </label>
        </div>
      </fieldset>

      <div class="acoes">
        <button type="submit" class="es-btn es-btn--primary" [disabled]="salvando()">{{ salvando() ? 'Salvando…' : 'Salvar preferências' }}</button>
      </div>
    </form>
  `,
  styleUrl: './config-pagina.scss',
  styles: `
    fieldset { border: none; padding: 0; }
    legend { font-weight: 600; font-size: 13px; line-height: 18px; margin-bottom: 6px; padding: 0; }
    .temas { display: flex; gap: var(--space-3); }
    .tema {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: var(--space-2); font-weight: 600;
      min-height: var(--control-height); border: 1px solid var(--border-strong); background: var(--surface-raised); border-radius: var(--radius-md); cursor: pointer;
    }
    .tema:hover { background: var(--surface-hover); }
    .tema.ativo { border-color: var(--primary); background: var(--primary-soft); color: var(--primary); }
    .tema:focus-within { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
  `,
})
export class Preferencias {
  private readonly usuarios = inject(UsuarioService);
  private readonly usuario = inject(AuthService).usuario;

  protected readonly fusos = [
    { valor: 'America/Noronha', rotulo: 'Fernando de Noronha (UTC-2)' },
    { valor: 'America/Sao_Paulo', rotulo: 'Brasília (UTC-3)' },
    { valor: 'America/Bahia', rotulo: 'Bahia (UTC-3)' },
    { valor: 'America/Fortaleza', rotulo: 'Fortaleza / Nordeste (UTC-3)' },
    { valor: 'America/Belem', rotulo: 'Belém (UTC-3)' },
    { valor: 'America/Cuiaba', rotulo: 'Cuiabá (UTC-4)' },
    { valor: 'America/Manaus', rotulo: 'Manaus (UTC-4)' },
    { valor: 'America/Porto_Velho', rotulo: 'Porto Velho (UTC-4)' },
    { valor: 'America/Rio_Branco', rotulo: 'Rio Branco (UTC-5)' },
  ];

  protected readonly form = inject(FormBuilder).nonNullable.group({
    idioma: [this.usuario()?.idioma ?? 'pt-BR'],
    fusoHorario: [this.usuario()?.fusoHorario ?? 'America/Sao_Paulo'],
    tema: [(this.usuario()?.tema ?? 'CLARO') as Tema],
  });

  protected readonly salvando = signal(false);
  protected readonly mensagem = signal<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  protected salvar(): void {
    const { idioma, fusoHorario, tema } = this.form.getRawValue();
    this.salvando.set(true);
    this.mensagem.set(null);
    this.usuarios.atualizarPreferencias(idioma, fusoHorario, tema).subscribe({
      next: () => {
        this.mensagem.set({ tipo: 'sucesso', texto: 'Preferências salvas.' });
        this.salvando.set(false);
      },
      error: (e) => {
        this.mensagem.set({ tipo: 'erro', texto: mensagemDeErro(e) });
        this.salvando.set(false);
      },
    });
  }
}
