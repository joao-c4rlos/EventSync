package br.com.eventsync.dashboard;

import br.com.eventsync.dashboard.DashboardDtos.Indicadores;
import br.com.eventsync.dashboard.DashboardDtos.InscricoesPorPeriodo;
import br.com.eventsync.dashboard.DashboardDtos.SerieInscricoes;
import br.com.eventsync.evento.Evento;
import br.com.eventsync.evento.EventoDtos.EventoResponse;
import br.com.eventsync.evento.EventoRepository;
import br.com.eventsync.evento.StatusEvento;
import br.com.eventsync.financeiro.FinanceiroService;
import br.com.eventsync.inscricao.InscricaoRepository;
import br.com.eventsync.usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int DIAS_PROXIMOS = 30;
    private static final List<StatusEvento> ATIVOS = List.of(StatusEvento.RASCUNHO, StatusEvento.PUBLICADO);

    private final EventoRepository eventos;
    private final InscricaoRepository inscricoes;
    private final FinanceiroService financeiro;
    private final UsuarioService usuarios;

    @Transactional(readOnly = true)
    public Indicadores indicadores(Long organizadorId) {
        ZoneId fuso = fusoDo(organizadorId);
        LocalDate hoje = LocalDate.now(fuso);
        YearMonth mes = YearMonth.from(hoje);

        List<Evento> proximos = eventos.proximos(organizadorId, ATIVOS, hoje, hoje.plusDays(DIAS_PROXIMOS));
        Map<Long, Long> contagem = proximos.isEmpty() ? Map.of()
                : inscricoes.contarPorEvento(proximos.stream().map(Evento::getId).toList()).stream()
                        .collect(Collectors.toMap(l -> (Long) l[0], l -> (Long) l[1]));

        Instant inicioDoMes = mes.atDay(1).atStartOfDay(fuso).toInstant();

        return new Indicadores(
                eventos.countByOrganizadorId(organizadorId),
                proximos.size(),
                inscricoes.contarDoOrganizadorDesde(organizadorId, inicioDoMes),
                financeiro.resumo(organizadorId, mes).lucroReal(),
                proximos.stream().limit(5)
                        .map(e -> EventoResponse.de(e, contagem.getOrDefault(e.getId(), 0L)))
                        .toList());
    }

    @Transactional(readOnly = true)
    public InscricoesPorPeriodo inscricoesPorMes(Long organizadorId, int meses, List<Long> eventoIds) {
        ZoneId fuso = fusoDo(organizadorId);
        int quantidade = Math.clamp(meses, 1, 24);
        YearMonth atual = YearMonth.now(fuso);
        YearMonth inicio = atual.minusMonths(quantidade - 1L);

        List<YearMonth> periodo = new ArrayList<>(quantidade);
        for (YearMonth m = inicio; !m.isAfter(atual); m = m.plusMonths(1)) {
            periodo.add(m);
        }

        Map<Long, String> titulos = eventos.findByOrganizadorId(organizadorId).stream()
                .collect(Collectors.toMap(Evento::getId, Evento::getTitulo));

        Map<Long, long[]> porEvento = new HashMap<>();
        long[] total = new long[quantidade];
        Instant desde = inicio.atDay(1).atStartOfDay(fuso).toInstant();
        for (Object[] linha : inscricoes.datasDoOrganizadorDesde(organizadorId, desde)) {
            Long eventoId = (Long) linha[0];
            YearMonth m = YearMonth.from(((Instant) linha[1]).atZone(fuso));
            int indice = periodo.indexOf(m);
            if (indice < 0) {
                continue;
            }
            porEvento.computeIfAbsent(eventoId, id -> new long[quantidade])[indice]++;
            total[indice]++;
        }

        List<SerieInscricoes> series = new ArrayList<>();
        List<Long> selecionados = eventoIds == null ? List.of()
                : eventoIds.stream().filter(titulos::containsKey).distinct().toList();
        if (selecionados.isEmpty()) {
            series.add(new SerieInscricoes(null, "Todos os eventos", lista(total)));
        } else {
            for (Long id : selecionados) {
                series.add(new SerieInscricoes(id, titulos.get(id),
                        lista(porEvento.getOrDefault(id, new long[quantidade]))));
            }
        }

        return new InscricoesPorPeriodo(periodo.stream().map(YearMonth::toString).toList(), series);
    }

    private ZoneId fusoDo(Long organizadorId) {
        try {
            return ZoneId.of(usuarios.buscar(organizadorId).getFusoHorario());
        } catch (RuntimeException e) {
            return ZoneId.of("America/Sao_Paulo");
        }
    }

    private static List<Long> lista(long[] valores) {
        return Arrays.stream(valores).boxed().toList();
    }
}
