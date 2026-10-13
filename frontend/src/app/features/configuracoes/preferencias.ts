import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensagemDeErro } from '../../core/erros';
import { Tema } from '../../core/models';
import { UsuarioService } from '../../core/usuario.service';

@Component({
  selector: 'app-preferencias',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <a routerLink="/configuracoes" class="voltar"><span class="icone">arrow_back</span> Configurações</a>
    <h1>Preferências do sistema</h1>

    <form class="card" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      @if (mensagem(); as m) {
        <div class="alerta" [class]="m.tipo" role="status">{{ m.texto }}</div>
      }

      <div class="campo">
        <label for="idioma">Idioma</label>
        <select id="idioma" class="input" formControlName="idioma">
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US" disabled>English (em breve)</option>
          <option value="es" disabled>Español (em breve)</option>
        </select>
      </div>

      <div class="campo">
        <label for="fuso">Zona temporal</label>
        <select id="fuso" class="input" formControlName="fusoHorario">
          @for (f of fusos; track f.valor) {
            <option [value]="f.valor">{{ f.rotulo }}</option>
          }
        </select>
      </div>

      <fieldset class="campo">
        <legend>Tema</legend>
        <div class="temas">
          <label class="tema" [class.ativo]="form.controls.tema.value === 'CLARO'">
            <input type="radio" formControlName="tema" value="CLARO" class="sr-only" />
            <span class="icone">light_mode</span> Claro
          </label>
          <label class="tema" [class.ativo]="form.controls.tema.value === 'ESCURO'">
            <input type="radio" formControlName="tema" value="ESCURO" class="sr-only" />
            <span class="icone">dark_mode</span> Escuro
          </label>
        </div>
      </fieldset>

      <div class="acoes">
        <button type="submit" class="btn btn-primario" [disabled]="salvando()">{{ salvando() ? 'Salvando...' : 'Salvar preferências' }}</button>
      </div>
    </form>
  `,
  styleUrl: './config-pagina.scss',
  styles: `
    fieldset { border: none; padding: 0; }
    legend { font-weight: 500; font-size: 0.9rem; margin-bottom: 0.35rem; }
    .temas { display: flex; gap: 1rem; }
    .tema {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.9rem; border: 2px solid var(--cor-borda); border-radius: var(--raio); cursor: pointer;
    }
    .tema.ativo { border-color: var(--cor-roxo); color: var(--cor-roxo); font-weight: 500; }
    .tema:focus-within { outline: 2px solid var(--cor-roxo); outline-offset: 2px; }
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
