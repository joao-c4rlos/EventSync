import { TestBed } from '@angular/core/testing';
import { GraficoLinhas, SerieGrafico } from './grafico-linhas';

describe('GraficoLinhas', () => {
  function renderizar(series: SerieGrafico[]) {
    const fixture = TestBed.createComponent(GraficoLinhas);
    fixture.componentRef.setInput('titulo', 'Inscrições por período');
    fixture.componentRef.setInput('rotulos', ['Jan', 'Fev', 'Mar']);
    fixture.componentRef.setInput('series', series);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('desenha uma linha por série com um marcador por mês', () => {
    const el = renderizar([
      { nome: 'Evento A', cor: '#f00', valores: [1, 5, 3] },
      { nome: 'Evento B', cor: '#00f', valores: [2, 0, 4] },
    ]);
    expect(el.querySelectorAll('polyline').length).toBe(2);
    expect(el.querySelectorAll('circle').length).toBe(6);
    expect(el.querySelectorAll('.rotulo-x').length).toBe(3);
    expect(el.querySelector('figcaption')?.textContent).toContain('Inscrições por período');
  });

  it('mostra a legenda apenas quando há comparação', () => {
    expect(renderizar([{ nome: 'Todos', cor: '#f00', valores: [1, 2, 3] }]).querySelector('.legenda')).toBeNull();
    const el = renderizar([
      { nome: 'Evento A', cor: '#f00', valores: [1, 2, 3] },
      { nome: 'Evento B', cor: '#00f', valores: [3, 2, 1] },
    ]);
    expect(el.querySelectorAll('.legenda li').length).toBe(2);
  });

  it('cria um eixo Y com 10 marcas que cobre o maior valor', () => {
    const el = renderizar([{ nome: 'Todos', cor: '#f00', valores: [0, 40, 13] }]);
    const marcas = Array.from(el.querySelectorAll('.rotulo-y')).map((t) => Number(t.textContent));
    expect(marcas.length).toBe(10);
    expect(marcas[0]).toBe(0);
    expect(marcas[marcas.length - 1]).toBeGreaterThanOrEqual(40);
  });
});
