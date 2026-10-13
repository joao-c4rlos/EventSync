package br.com.eventsync.notificacao;

import br.com.eventsync.evento.Evento;
import br.com.eventsync.evento.EventoRepository;
import br.com.eventsync.evento.StatusEvento;
import br.com.eventsync.financeiro.Lancamento;
import br.com.eventsync.financeiro.LancamentoRepository;
import br.com.eventsync.financeiro.StatusLancamento;
import br.com.eventsync.financeiro.TipoLancamento;
import br.com.eventsync.notificacao.Notificacao.Categoria;
import br.com.eventsync.usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private static final int DIAS_EVENTO = 7;
    private static final int DIAS_LANCAMENTO = 3;
    private static final int DIAS_ATRASO = 30;
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");
    private static final Locale PT_BR = Locale.of("pt", "BR");

    private final EventoRepository eventos;
    private final LancamentoRepository lancamentos;
    private final UsuarioService usuarios;

    @Transactional(readOnly = true)
    public List<Notificacao> listar(Long organizadorId) {
        LocalDate hoje = LocalDate.now(fusoDo(organizadorId));
        List<Notificacao> lista = new ArrayList<>();

        for (Evento e : eventos.proximos(organizadorId, List.of(StatusEvento.RASCUNHO, StatusEvento.PUBLICADO),
                hoje, hoje.plusDays(DIAS_EVENTO))) {
            long dias = ChronoUnit.DAYS.between(hoje, e.getDataInicio());
            String mensagem = switch ((int) dias) {
                case 0 -> "É hoje!";
                case 1 -> "Está próximo! É amanhã";
                default -> "Está próximo! Chegando em " + dias + " dias";
            };
            lista.add(new Notificacao(
                    "evento-" + e.getId() + "-" + e.getDataInicio(),
                    Categoria.EVENTO_PROXIMO,
                    e.getTitulo(),
                    mensagem,
                    e.getLocal() + " " + faixaHorario(e.getHoraInicio(), e.getHoraFim()),
                    e.getDataInicio(),
                    "/eventos/" + e.getId()));
        }

        NumberFormat moeda = NumberFormat.getCurrencyInstance(PT_BR);
        for (Lancamento l : lancamentos.findByOrganizadorIdAndStatusAndDataBetweenOrderByData(
                organizadorId, StatusLancamento.PENDENTE, hoje.minusDays(DIAS_ATRASO), hoje.plusDays(DIAS_LANCAMENTO))) {
            boolean gasto = l.getTipo() == TipoLancamento.GASTO;
            long dias = ChronoUnit.DAYS.between(hoje, l.getData());
            String prazo = dias < 0 ? "Venceu há " + (-dias) + (dias == -1 ? " dia" : " dias")
                    : dias == 0 ? "Vence hoje"
                    : "Vence em " + dias + (dias == 1 ? " dia" : " dias");
            lista.add(new Notificacao(
                    "lancamento-" + l.getId() + "-" + l.getData(),
                    gasto ? Categoria.PAGAMENTO_PENDENTE : Categoria.RECEBIMENTO_PENDENTE,
                    l.getDescricao(),
                    (gasto ? "Pagamento pendente · " : "Recebimento pendente · ") + prazo,
                    moeda.format(l.getValor()),
                    l.getData(),
                    "/financeiro"));
        }

        lista.sort(Comparator.comparing(Notificacao::data));
        return lista;
    }

    private static String faixaHorario(LocalTime inicio, LocalTime fim) {
        return fim == null ? inicio.format(HORA) : inicio.format(HORA) + " - " + fim.format(HORA);
    }

    private ZoneId fusoDo(Long organizadorId) {
        try {
            return ZoneId.of(usuarios.buscar(organizadorId).getFusoHorario());
        } catch (RuntimeException e) {
            return ZoneId.of("America/Sao_Paulo");
        }
    }
}
