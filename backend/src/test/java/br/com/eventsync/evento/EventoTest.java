package br.com.eventsync.evento;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class EventoTest {

    private Evento evento(StatusEvento status, LocalDate inicio, LocalDate fim) {
        Evento e = new Evento();
        e.setStatus(status);
        e.setDataInicio(inicio);
        e.setDataFim(fim);
        return e;
    }

    @Test
    void aceitaInscricoesQuandoPublicadoEFuturo() {
        assertThat(evento(StatusEvento.PUBLICADO, LocalDate.now().plusDays(1), null).aceitaInscricoes()).isTrue();
        assertThat(evento(StatusEvento.PUBLICADO, LocalDate.now(), null).aceitaInscricoes()).isTrue();
    }

    @Test
    void naoAceitaInscricoesEmRascunhoOuCancelado() {
        LocalDate amanha = LocalDate.now().plusDays(1);
        assertThat(evento(StatusEvento.RASCUNHO, amanha, null).aceitaInscricoes()).isFalse();
        assertThat(evento(StatusEvento.CANCELADO, amanha, null).aceitaInscricoes()).isFalse();
    }

    @Test
    void consideraADataDeTerminoDeEventosDeVariosDias() {
        LocalDate ontem = LocalDate.now().minusDays(1);
        assertThat(evento(StatusEvento.PUBLICADO, ontem, null).aceitaInscricoes()).isFalse();
        assertThat(evento(StatusEvento.PUBLICADO, ontem, LocalDate.now().plusDays(1)).aceitaInscricoes()).isTrue();
        assertThat(evento(StatusEvento.PUBLICADO, ontem, null).dataTermino()).isEqualTo(ontem);
    }
}
