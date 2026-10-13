import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lancamento, LancamentoPayload, ResumoMensal, StatusLancamento } from './models';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly http = inject(HttpClient);

  resumo(mes: string): Observable<ResumoMensal> {
    return this.http.get<ResumoMensal>('/api/financeiro/resumo', { params: { mes } });
  }

  lancamentos(mes: string, eventoId?: number): Observable<Lancamento[]> {
    let params = new HttpParams().set('mes', mes);
    if (eventoId) params = params.set('eventoId', eventoId);
    return this.http.get<Lancamento[]>('/api/financeiro/lancamentos', { params });
  }

  criar(dados: LancamentoPayload): Observable<Lancamento> {
    return this.http.post<Lancamento>('/api/financeiro/lancamentos', dados);
  }

  atualizar(id: number, dados: LancamentoPayload): Observable<Lancamento> {
    return this.http.put<Lancamento>(`/api/financeiro/lancamentos/${id}`, dados);
  }

  alterarStatus(id: number, status: StatusLancamento): Observable<Lancamento> {
    return this.http.patch<Lancamento>(`/api/financeiro/lancamentos/${id}/status`, { status });
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`/api/financeiro/lancamentos/${id}`);
  }
}
