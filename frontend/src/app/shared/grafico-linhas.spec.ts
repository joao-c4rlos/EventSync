import { TestBed } from '@angular/core/testing';
import { GraficoLinhas, passoDoEixo, SerieGrafico } from './grafico-linhas';

describe('GraficoLinhas', () => {
  function renderizar(series: SerieGrafico[]) {
    const fixture = TestBed.createComponent(GraficoLinhas);
    fixture.componentRef.setInput('titulo', 'Inscrições por período');
    fixture.componentRef.setInput('rotulos', ['Jan', 'Fev', 'Mar']);
    fixture.componentRef.setInput('series', series);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('desenha uma linha por série, círculo na 1ª e quadrado na 2ª', () => {
    const el = renderizar([
      { nome: 'Evento A', valores: [1, 5, 3] },
      { nome: 'Evento B', valores: [2, 0, 4] },
    ]);
    expect(el.querySelectorAll('polyline.line').length).toBe(2);
    expect(el.querySelectorAll('polyline.s1').length).toBe(1);
    expect(el.querySelectorAll('polyline.s2').length).toBe(1);
    expect(el.querySelectorAll('circle.f1').length).toBe(3);
    expect(el.querySelectorAll('rect.f2').length).toBe(3);
    expect(el.querySelectorAll('.rotulo-x').length).toBe(3);
    expect(el.querySelector('.es-card__title')?.textContent).toContain('Inscrições por período');
  });

  it('mostra a legenda apenas quando há comparação', () => {
    expect(renderizar([{ nome: 'Todos', valores: [1, 2, 3] }]).querySelector('.es-legend')).toBeNull();
    const el = renderizar([
      { nome: 'Evento A', valores: [1, 2, 3] },
      { nome: 'Evento B', valores: [3, 2, 1] },
    ]);
    expect(el.querySelectorAll('.es-legend span').length).toBe(2);
  });

  it('cria um eixo Y que começa em 0 e cobre o maior valor com poucas marcas', () => {
    const el = renderizar([{ nome: 'Todos', valores: [0, 40, 13] }]);
    const marcas = Array.from(el.querySelectorAll('.rotulo-y')).map((t) => Number(t.textContent));
    expect(marcas[0]).toBe(0);
    expect(marcas.length).toBeLessThanOrEqual(6);
    expect(marcas[marcas.length - 1]).toBeGreaterThanOrEqual(40);
  });

  it('escolhe passos redondos para o eixo', () => {
    expect(passoDoEixo(17)).toBe(5);
    expect(passoDoEixo(40)).toBe(10);
    expect(passoDoEixo(0)).toBe(1);
    expect(passoDoEixo(1284)).toBe(500);
  });

  it('descreve os dados no aria-label', () => {
    const el = renderizar([{ nome: 'Evento A', valores: [4, 9, 17] }]);
    expect(el.querySelector('svg')?.getAttribute('aria-label')).toContain('Evento A de 4 a 17');
  });
});
