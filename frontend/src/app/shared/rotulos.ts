import { StatusEvento, StatusLancamento, TipoEvento, TipoLancamento } from '../core/models';

export const TIPOS_EVENTO: { valor: TipoEvento; rotulo: string; icone: string }[] = [
  { valor: 'SHOW', rotulo: 'Show', icone: 'mic' },
  { valor: 'CONFERENCIA', rotulo: 'Conferência', icone: 'person' },
  { valor: 'CASAMENTO', rotulo: 'Casamento', icone: 'favorite' },
  { valor: 'TREINAMENTO', rotulo: 'Treinamento', icone: 'desktop_windows' },
  { valor: 'OUTRO', rotulo: 'Outro', icone: 'event' },
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

export const TIPO_LANCAMENTO: Record<TipoLancamento, string> = {
  GASTO: 'Gasto',
  RECEBIMENTO: 'Recebimento',
};

export function statusLancamento(tipo: TipoLancamento, status: StatusLancamento): string {
  if (status === 'PENDENTE') return 'Aguardando';
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
