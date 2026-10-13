import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento, EventoPayload, EventoPublico, Inscricao, StatusEvento } from './models';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private readonly http = inject(HttpClient);

  listar(busca?: string, status?: StatusEvento): Observable<Evento[]> {
    let params = new HttpParams();
    if (busca) params = params.set('busca', busca);
    if (status) params = params.set('status', status);
    return this.http.get<Evento[]>('/api/eventos', { params });
  }

  detalhar(id: number): Observable<Evento> {
    return this.http.get<Evento>(`/api/eventos/${id}`);
  }

  criar(dados: EventoPayload): Observable<Evento> {
    return this.http.post<Evento>('/api/eventos', dados);
  }

  atualizar(id: number, dados: EventoPayload): Observable<Evento> {
    return this.http.put<Evento>(`/api/eventos/${id}`, dados);
  }

  alterarStatus(id: number, status: StatusEvento): Observable<Evento> {
    return this.http.patch<Evento>(`/api/eventos/${id}/status`, { status });
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`/api/eventos/${id}`);
  }

  inscricoes(id: number): Observable<Inscricao[]> {
    return this.http.get<Inscricao[]>(`/api/eventos/${id}/inscricoes`);
  }

  removerInscricao(eventoId: number, inscricaoId: number): Observable<void> {
    return this.http.delete<void>(`/api/eventos/${eventoId}/inscricoes/${inscricaoId}`);
  }

  publico(slug: string): Observable<EventoPublico> {
    return this.http.get<EventoPublico>(`/api/publico/eventos/${slug}`);
  }

  inscrever(slug: string, dados: { nome: string; email: string; telefone: string }): Observable<void> {
    return this.http.post<void>(`/api/publico/eventos/${slug}/inscricoes`, dados);
  }
}
