import { Icone } from '../../shared/icone';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { mensagemDeErro } from '../../core/erros';
import { EventosService } from '../../core/eventos.service';
import { Evento, Inscricao, StatusEvento } from '../../core/models';
import { Alerta } from '../../shared/alerta';
import { Avatar } from '../../shared/avatar';
import { Confirmacao } from '../../shared/confirmacao';
import { BADGE_EVENTO, hora, tipoEvento } from '../../shared/rotulos';
import { Status } from '../../shared/status';
import { InscricaoManual } from './inscricao-manual';

interface AcaoStatus {
  status: StatusEvento;
  rotulo: string;
  icone: string;
}

@Component({
  selector: 'app-evento-detalhe',
  imports: [Icone, RouterLink, DatePipe, DecimalPipe, CurrencyPipe, Alerta, Avatar, Confirmacao, Status, InscricaoManual],
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

  protected readonly badge = BADGE_EVENTO;
  protected readonly aba = signal<'geral' | 'inscritos'>('geral');
  protected readonly confirmando = signal<'excluir' | 'cancelar' | null>(null);
  protected readonly inscricaoRemover = signal<Inscricao | null>(null);
  protected readonly adicionando = signal(false);
  protected readonly processando = signal(false);
  protected readonly tipo = tipoEvento;
  protected readonly hora = hora;

  protected readonly linkPublico = computed(() => {
    const e = this.evento();
    return e ? `${location.origin}/e/${e.slug}` : '';
  });

  protected readonly acoes = computed<AcaoStatus[]>(() => {
    switch (this.evento()?.status) {
      case 'RASCUNHO':
        return [{ status: 'PUBLICADO', rotulo: 'Publicar', icone: 'globe' }];
      case 'PUBLICADO':
        return [
          { status: 'ENCERRADO', rotulo: 'Encerrar', icone: 'calendar-check' },
          { status: 'CANCELADO', rotulo: 'Cancelar evento', icone: 'calendar-x' },
        ];
      case 'ENCERRADO':
      case 'CANCELADO':
        return [{ status: 'PUBLICADO', rotulo: 'Reabrir', icone: 'rotate-ccw' }];
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

  /** Cancelar é destrutivo: passa por um Modal. As demais mudanças de status são imediatas. */
  protected pedirStatus(status: StatusEvento): void {
    if (status === 'CANCELADO') this.confirmando.set('cancelar');
    else this.alterarStatus(status);
  }

  protected alterarStatus(status: StatusEvento): void {
    const e = this.evento();
    if (!e) return;
    this.erro.set('');
    this.processando.set(true);
    this.service.alterarStatus(e.id, status).subscribe({
      next: (atualizado) => {
        this.evento.set(atualizado);
        this.encerrarConfirmacao();
      },
      error: (err) => {
        this.erro.set(mensagemDeErro(err));
        this.encerrarConfirmacao();
      },
    });
  }

  protected excluir(): void {
    const e = this.evento();
    if (!e) return;
    this.processando.set(true);
    this.service.excluir(e.id).subscribe({
      next: () => this.router.navigate(['/eventos']),
      error: (err) => {
        this.erro.set(mensagemDeErro(err));
        this.encerrarConfirmacao();
      },
    });
  }

  protected removerInscricao(inscricao: Inscricao): void {
    const e = this.evento();
    if (!e) return;
    this.processando.set(true);
    this.service.removerInscricao(e.id, inscricao.id).subscribe({
      next: () => {
        this.inscricoes.update((lista) => lista.filter((i) => i.id !== inscricao.id));
        this.evento.update((ev) => (ev ? { ...ev, inscritos: ev.inscritos - 1 } : ev));
        this.encerrarConfirmacao();
      },
      error: (err) => {
        this.erro.set(mensagemDeErro(err));
        this.encerrarConfirmacao();
      },
    });
  }

  protected inscricaoAdicionada(inscricao: Inscricao): void {
    this.inscricoes.update((lista) => [inscricao, ...lista]);
    this.evento.update((ev) => (ev ? { ...ev, inscritos: ev.inscritos + 1 } : ev));
    this.adicionando.set(false);
  }

  /** Código da inscrição no formato do design system (EVT-2026-0412). */
  protected codigo(i: Inscricao): string {
    return `EVT-${i.criadoEm.slice(0, 4)}-${String(i.id).padStart(4, '0')}`;
  }

  private encerrarConfirmacao(): void {
    this.processando.set(false);
    this.confirmando.set(null);
    this.inscricaoRemover.set(null);
  }

  protected async copiarLink(): Promise<void> {
    await navigator.clipboard.writeText(this.linkPublico());
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 2000);
  }
}
