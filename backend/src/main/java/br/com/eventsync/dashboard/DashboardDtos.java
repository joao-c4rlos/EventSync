package br.com.eventsync.dashboard;

import br.com.eventsync.evento.EventoDtos.EventoResponse;

import java.math.BigDecimal;
import java.util.List;

public final class DashboardDtos {

    private DashboardDtos() {
    }

    public record Indicadores(
            long totalEventos,
            long eventosProximos,
            long inscricoesNoMes,
            BigDecimal lucroRealNoMes,
            List<EventoResponse> proximosEventos) {
    }

    public record SerieInscricoes(Long eventoId, String titulo, List<Long> valores) {
    }

    public record InscricoesPorPeriodo(List<String> meses, List<SerieInscricoes> series) {
    }
}
