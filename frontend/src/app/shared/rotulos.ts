import { StatusEvento, StatusLancamento, TipoEvento, TipoLancamento } from '../core/models';
import type { TomBadge } from './status';

export const TIPOS_EVENTO: { valor: TipoEvento; rotulo: string; icone: string }[] = [
  { valor: 'SHOW', rotulo: 'Show', icone: 'mic' },
  { valor: 'CONFERENCIA', rotulo: 'Conferência', icone: 'user' },
  { valor: 'CASAMENTO', rotulo: 'Casamento', icone: 'heart' },
  { valor: 'TREINAMENTO', rotulo: 'Treinamento', icone: 'monitor' },
  { valor: 'OUTRO', rotulo: 'Outro', icone: 'calendar' },
];

export function tipoEvento(valor: TipoEvento) {
  return TIPOS_EVENTO.find((t) => t.valor === valor) ?? TIPOS_EVENTO[TIPOS_EVENTO.length - 1];
}

export const STATUS_EVENTO: Record<StatusEvento, string> = {
  RASCUNHO: 'Rascunho',
  PUBLICADO: 'Publicado',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

/** Mapeamento enum -> Badge (CLAUDE.md do design system). */
export const BADGE_EVENTO: Record<StatusEvento, { tom: TomBadge; rotulo: string; icone: string }> = {
  RASCUNHO: { tom: 'neutral', rotulo: 'Rascunho', icone: 'file-pen' },
  PUBLICADO: { tom: 'info', rotulo: 'Publicado', icone: 'info' },
  ENCERRADO: { tom: 'neutral', rotulo: 'Encerrado', icone: 'calendar-check' },
  CANCELADO: { tom: 'danger', rotulo: 'Cancelado', icone: 'x' },
};

export function badgeLancamento(tipo: TipoLancamento, status: StatusLancamento): { tom: TomBadge; rotulo: string } {
  return status === 'PENDENTE'
    ? { tom: 'warning', rotulo: 'Pendente' }
    : { tom: 'success', rotulo: tipo === 'GASTO' ? 'Pago' : 'Recebido' };
}

export const TIPO_LANCAMENTO: Record<TipoLancamento, string> = {
  GASTO: 'Gasto',
  RECEBIMENTO: 'Recebimento',
};

export function statusLancamento(tipo: TipoLancamento, status: StatusLancamento): string {
  if (status === 'PENDENTE') return 'Pendente';
  return tipo === 'GASTO' ? 'Pago' : 'Recebido';
}

/** "20:00:00" -> "20:00" */
export function hora(valor: string | null): string {
  return valor ? valor.slice(0, 5) : '';
}

export function mesAtual(): string {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
}

export function hojeIso(): string {
  const hoje = new Date();
  return `${mesAtual()}-${String(hoje.getDate()).padStart(2, '0')}`;
}
