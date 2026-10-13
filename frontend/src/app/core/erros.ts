import { HttpErrorResponse } from '@angular/common/http';
import { ProblemaApi } from './models';

export function mensagemDeErro(erro: unknown, padrao = 'Não foi possível concluir a operação.'): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }
    const problema = erro.error as ProblemaApi | null;
    const primeiroCampo = problema?.campos ? Object.values(problema.campos)[0] : undefined;
    return primeiroCampo ?? problema?.detail ?? padrao;
  }
  return padrao;
}
