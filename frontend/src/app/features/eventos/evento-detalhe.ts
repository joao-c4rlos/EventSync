import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { mensagemDeErro } from '../../core/erros';
import { EventosService } from '../../core/eventos.service';
import { Evento, Inscricao, StatusEvento } from '../../core/models';
import { hora, STATUS_EVENTO, tipoEvento } from '../../shared/rotulos';

interface AcaoStatus {
  status: StatusEvento;
  rotulo: string;
  icone: string;
}

@Component({
  selector: 'app-evento-detalhe',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './evento-detalhe.html',
  styleUrl: './evento-detalhe.scss',
})
export class EventoDetalhe implements OnInit {
  private readonly service = inject(EventosService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly evento = signal<Evento | null>(null);
  protected readonly inscricoes = signal<Inscricao[]>([]);
  protected readonly erro = signal('');
  protected readonly copiado = signal(false);

  protected readonly rotuloStatus = STATUS_EVENTO;
  protected readonly tipo = tipoEvento;
  protected readonly hora = hora;

  protected readonly linkPublico = computed(() => {
    const e = this.evento();
    return e ? `${location.origin}/e/${e.slug}` : '';
  });

  protected readonly acoes = computed<AcaoStatus[]>(() => {
    switch (this.evento()?.status) {
      case 'RASCUNHO':
        return [{ status: 'PUBLICADO', rotulo: 'Publicar', icone: 'public' }];
      case 'PUBLICADO':
        return [
          { status: 'ENCERRADO', rotulo: 'Encerrar', icone: 'event_available' },
          { status: 'CANCELADO', rotulo: 'Cancelar evento', icone: 'event_busy' },
        ];
      case 'ENCERRADO':
      case 'CANCELADO':
        return [{ status: 'PUBLICADO', rotulo: 'Reabrir', icone: 'restart_alt' }];
      default:
        return [];
    }
  });

  ngOnInit(): void {
    const id = Number(this.id());
    this.service.detalhar(id).subscribe({
      next: (e) => this.evento.set(e),
      error: () => this.router.navigate(['/eventos']),
    });
    this.service.inscricoes(id).subscribe((lista) => this.inscricoes.set(lista));
  }

  protected alterarStatus(status: StatusEvento): void {
    const e = this.evento();
    if (!e) return;
    this.erro.set('');
    this.service.alterarStatus(e.id, status).subscribe({
      next: (atualizado) => this.evento.set(atualizado),
      error: (err) => this.erro.set(mensagemDeErro(err)),
    });
  }

  protected excluir(): void {
    const e = this.evento();
    if (!e || !confirm(`Excluir o evento "${e.titulo}"? As inscrições também serão removidas.`)) return;
    this.service.excluir(e.id).subscribe({
      next: () => this.router.navigate(['/eventos']),
      error: (err) => this.erro.set(mensagemDeErro(err)),
    });
  }

  protected removerInscricao(inscricao: Inscricao): void {
    const e = this.evento();
    if (!e || !confirm(`Remover a inscrição de ${inscricao.nome}?`)) return;
    this.service.removerInscricao(e.id, inscricao.id).subscribe(() => {
      this.inscricoes.update((lista) => lista.filter((i) => i.id !== inscricao.id));
      this.evento.update((ev) => (ev ? { ...ev, inscritos: ev.inscritos - 1 } : ev));
    });
  }

  protected async copiarLink(): Promise<void> {
    await navigator.clipboard.writeText(this.linkPublico());
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 2000);
  }
}
