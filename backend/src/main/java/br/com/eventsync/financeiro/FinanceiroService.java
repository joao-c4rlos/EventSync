package br.com.eventsync.financeiro;

import br.com.eventsync.common.RegraNegocioException;
import br.com.eventsync.evento.EventoRepository;
import br.com.eventsync.financeiro.FinanceiroDtos.LancamentoRequest;
import br.com.eventsync.financeiro.FinanceiroDtos.LancamentoResponse;
import br.com.eventsync.financeiro.FinanceiroDtos.PontoSerie;
import br.com.eventsync.financeiro.FinanceiroDtos.ResumoMensal;
import br.com.eventsync.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final LancamentoRepository lancamentos;
    private final EventoRepository eventos;
    private final UsuarioRepository usuarios;

    @Transactional(readOnly = true)
    public List<LancamentoResponse> listar(Long organizadorId, YearMonth mes, Long eventoId) {
        return lancamentos.buscar(organizadorId, mes.atDay(1), mes.atEndOfMonth(), eventoId).stream()
                .map(LancamentoResponse::de)
                .toList();
    }

    @Transactional
    public LancamentoResponse criar(Long organizadorId, LancamentoRequest req) {
        Lancamento lancamento = new Lancamento();
        lancamento.setOrganizador(usuarios.getReferenceById(organizadorId));
        aplicar(organizadorId, lancamento, req);
        lancamentos.save(lancamento);
        return LancamentoResponse.de(lancamento);
    }

    @Transactional
    public LancamentoResponse atualizar(Long organizadorId, Long id, LancamentoRequest req) {
        Lancamento lancamento = buscar(organizadorId, id);
        aplicar(organizadorId, lancamento, req);
        return LancamentoResponse.de(lancamento);
    }

    @Transactional
    public LancamentoResponse alterarStatus(Long organizadorId, Long id, StatusLancamento status) {
        Lancamento lancamento = buscar(organizadorId, id);
        lancamento.setStatus(status);
        return LancamentoResponse.de(lancamento);
    }

    @Transactional
    public void excluir(Long organizadorId, Long id) {
        lancamentos.delete(buscar(organizadorId, id));
    }

    @Transactional(readOnly = true)
    public ResumoMensal resumo(Long organizadorId, YearMonth mes) {
        List<Lancamento> doMes = lancamentos.buscar(organizadorId, mes.atDay(1), mes.atEndOfMonth(), null);
        YearMonth proximo = mes.plusMonths(1);
        List<Lancamento> doProximo = lancamentos.buscar(organizadorId, proximo.atDay(1), proximo.atEndOfMonth(), null);

        Predicate<Lancamento> gasto = l -> l.getTipo() == TipoLancamento.GASTO;
        Predicate<Lancamento> recebimento = l -> l.getTipo() == TipoLancamento.RECEBIMENTO;
        Predicate<Lancamento> concluido = l -> l.getStatus() == StatusLancamento.CONCLUIDO;

        BigDecimal gastoTotal = somar(doMes, gasto);
        BigDecimal gastoRealizado = somar(doMes, gasto.and(concluido));
        BigDecimal receitaTotal = somar(doMes, recebimento);
        BigDecimal recebido = somar(doMes, recebimento.and(concluido));

        return new ResumoMensal(
                mes.toString(),
                gastoRealizado,
                gastoTotal,
                recebido,
                receitaTotal,
                receitaTotal.subtract(gastoTotal),
                recebido.subtract(gastoRealizado),
                receitaTotal.subtract(recebido),
                somar(doProximo, recebimento),
                gastoTotal.subtract(gastoRealizado),
                serieAcumulada(mes, doMes, gasto.and(concluido), null),
                serieAcumulada(mes, doMes, recebimento.and(concluido), null),
                serieAcumulada(mes, doMes, recebimento, gasto),
                serieAcumulada(mes, doMes, recebimento.and(concluido), gasto.and(concluido)));
    }

    private Lancamento buscar(Long organizadorId, Long id) {
        return lancamentos.findByIdAndOrganizadorId(id, organizadorId)
                .orElseThrow(() -> RegraNegocioException.naoEncontrado("Lançamento não encontrado."));
    }

    private void aplicar(Long organizadorId, Lancamento lancamento, LancamentoRequest req) {
        lancamento.setDescricao(req.descricao().trim());
        lancamento.setTipo(req.tipo());
        lancamento.setStatus(req.status());
        lancamento.setValor(req.valor());
        lancamento.setData(req.data());
        lancamento.setEvento(req.eventoId() == null ? null
                : eventos.findByIdAndOrganizadorId(req.eventoId(), organizadorId)
                        .orElseThrow(() -> RegraNegocioException.naoEncontrado("Evento não encontrado.")));
    }

    private static BigDecimal somar(List<Lancamento> lista, Predicate<Lancamento> filtro) {
        return lista.stream().filter(filtro).map(Lancamento::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Série diária acumulada: soma dos lançamentos que passam em {@code soma} menos os que passam em {@code subtrai}. */
    private static List<PontoSerie> serieAcumulada(YearMonth mes, List<Lancamento> lista,
                                                   Predicate<Lancamento> soma, Predicate<Lancamento> subtrai) {
        BigDecimal[] porDia = new BigDecimal[mes.lengthOfMonth()];
        Arrays.fill(porDia, BigDecimal.ZERO);
        for (Lancamento l : lista) {
            int indice = l.getData().getDayOfMonth() - 1;
            if (soma.test(l)) {
                porDia[indice] = porDia[indice].add(l.getValor());
            } else if (subtrai != null && subtrai.test(l)) {
                porDia[indice] = porDia[indice].subtract(l.getValor());
            }
        }

        List<PontoSerie> serie = new ArrayList<>(porDia.length);
        BigDecimal acumulado = BigDecimal.ZERO;
        for (int dia = 1; dia <= porDia.length; dia++) {
            acumulado = acumulado.add(porDia[dia - 1]);
            serie.add(new PontoSerie(LocalDate.of(mes.getYear(), mes.getMonth(), dia), acumulado));
        }
        return serie;
    }
}
