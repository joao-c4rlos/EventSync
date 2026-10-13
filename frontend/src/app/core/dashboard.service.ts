import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Indicadores, InscricoesPorPeriodo } from './models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  indicadores(): Observable<Indicadores> {
    return this.http.get<Indicadores>('/api/dashboard/indicadores');
  }

  inscricoes(meses: number, eventoIds: number[]): Observable<InscricoesPorPeriodo> {
    let params = new HttpParams().set('meses', meses);
    for (const id of eventoIds) params = params.append('eventoIds', id);
    return this.http.get<InscricoesPorPeriodo>('/api/dashboard/inscricoes', { params });
  }
}
