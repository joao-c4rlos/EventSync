import { hora, statusLancamento, tipoEvento } from './rotulos';

describe('rotulos', () => {
  it('traduz o status do lançamento conforme o tipo', () => {
    expect(statusLancamento('GASTO', 'PENDENTE')).toBe('Aguardando');
    expect(statusLancamento('RECEBIMENTO', 'PENDENTE')).toBe('Aguardando');
    expect(statusLancamento('GASTO', 'CONCLUIDO')).toBe('Pago');
    expect(statusLancamento('RECEBIMENTO', 'CONCLUIDO')).toBe('Recebido');
  });

  it('formata a hora sem os segundos', () => {
    expect(hora('20:30:00')).toBe('20:30');
    expect(hora(null)).toBe('');
  });

  it('retorna rótulo e ícone do tipo de evento', () => {
    expect(tipoEvento('CASAMENTO')).toEqual({ valor: 'CASAMENTO', rotulo: 'Casamento', icone: 'favorite' });
  });
});
