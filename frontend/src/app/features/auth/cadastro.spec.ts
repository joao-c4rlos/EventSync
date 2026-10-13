import { FormControl, FormGroup } from '@angular/forms';
import { senhasIguais } from './cadastro';

describe('senhasIguais', () => {
  const grupo = (senha: string, confirmacao: string) =>
    new FormGroup({ senha: new FormControl(senha), confirmacao: new FormControl(confirmacao) });

  it('aceita senhas iguais', () => {
    expect(senhasIguais(grupo('segredo123', 'segredo123'))).toBeNull();
  });

  it('acusa senhas diferentes', () => {
    expect(senhasIguais(grupo('segredo123', 'outra456'))).toEqual({ senhasDiferentes: true });
  });

  it('não acusa enquanto a confirmação está vazia', () => {
    expect(senhasIguais(grupo('segredo123', ''))).toBeNull();
  });
});
