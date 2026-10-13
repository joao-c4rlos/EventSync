import { HttpErrorResponse } from '@angular/common/http';
import { mensagemDeErro } from './erros';

describe('mensagemDeErro', () => {
  it('prioriza a mensagem do primeiro campo inválido', () => {
    const erro = new HttpErrorResponse({
      status: 400,
      error: { detail: 'Dados inválidos.', campos: { email: 'E-mail inválido.' } },
    });
    expect(mensagemDeErro(erro)).toBe('E-mail inválido.');
  });

  it('usa o detail do ProblemDetail quando não há campos', () => {
    const erro = new HttpErrorResponse({ status: 409, error: { detail: 'Já existe uma conta com este e-mail.' } });
    expect(mensagemDeErro(erro)).toBe('Já existe uma conta com este e-mail.');
  });

  it('avisa quando o servidor está inacessível', () => {
    expect(mensagemDeErro(new HttpErrorResponse({ status: 0 }))).toContain('conectar ao servidor');
  });

  it('usa a mensagem padrão para erros desconhecidos', () => {
    expect(mensagemDeErro(new Error('x'), 'Falhou.')).toBe('Falhou.');
  });
});
