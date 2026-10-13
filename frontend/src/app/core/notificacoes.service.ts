import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { CategoriaNotificacao, Notificacao } from './models';

const CHAVE_LIDAS = 'eventsync.notificacoes-lidas';

export const ICONE_NOTIFICACAO: Record<CategoriaNotificacao, string> = {
  EVENTO_PROXIMO: 'schedule',
  PAGAMENTO_PENDENTE: 'payments',
  RECEBIMENTO_PENDENTE: 'savings',
};

@Injectable({ providedIn: 'root' })
export class NotificacoesService {
  private readonly http = inject(HttpClient);

  private readonly lidas = signal<Set<string>>(new Set(JSON.parse(localStorage.getItem(CHAVE_LIDAS) ?? '[]')));

  readonly todas = signal<Notificacao[]>([]);
  readonly naoLidas = computed(() => this.todas().filter((n) => !this.lidas().has(n.id)).length);

  atualizar(): void {
    this.http.get<Notificacao[]>('/api/notificacoes').subscribe((lista) => this.todas.set(lista));
  }

  lida(id: string): boolean {
    return this.lidas().has(id);
  }

  marcarTodasComoLidas(): void {
    const ids = new Set(this.todas().map((n) => n.id));
    this.lidas.set(ids);
    localStorage.setItem(CHAVE_LIDAS, JSON.stringify([...ids]));
  }
}
