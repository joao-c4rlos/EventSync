package br.com.eventsync.evento;

import br.com.eventsync.inscricao.Inscricao;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public final class EventoDtos {

    private EventoDtos() {
    }

    public record EventoRequest(
            @NotBlank(message = "Informe o título do evento.")
            @Size(max = 150, message = "O título deve ter no máximo 150 caracteres.")
            String titulo,

            @NotNull(message = "Selecione o tipo do evento.")
            TipoEvento tipo,

            @NotNull(message = "Informe a data do evento.")
            LocalDate dataInicio,

            LocalDate dataFim,

            @NotNull(message = "Informe o horário de início.")
            LocalTime horaInicio,

            LocalTime horaFim,

            @NotBlank(message = "Informe o local do evento.")
            @Size(max = 200, message = "O local deve ter no máximo 200 caracteres.")
            String local,

            @NotNull(message = "Informe a quantidade estimada de pessoas.")
            @Min(value = 1, message = "A quantidade de pessoas deve ser no mínimo 1.")
            @Max(value = 1_000_000, message = "A quantidade de pessoas é grande demais.")
            Integer capacidade,

            @Size(max = 5000, message = "A descrição deve ter no máximo 5000 caracteres.")
            String descricao,

            @PositiveOrZero(message = "O gasto previsto não pode ser negativo.")
            @Digits(integer = 10, fraction = 2, message = "Valor inválido.")
            BigDecimal gastoPrevisto,

            @PositiveOrZero(message = "A receita prevista não pode ser negativa.")
            @Digits(integer = 10, fraction = 2, message = "Valor inválido.")
            BigDecimal receitaPrevista) {
    }

    public record StatusRequest(@NotNull(message = "Informe o status.") StatusEvento status) {
    }

    public record EventoResponse(
            Long id,
            String titulo,
            TipoEvento tipo,
            StatusEvento status,
            String slug,
            LocalDate dataInicio,
            LocalDate dataFim,
            LocalTime horaInicio,
            LocalTime horaFim,
            String local,
            Integer capacidade,
            String descricao,
            BigDecimal gastoPrevisto,
            BigDecimal receitaPrevista,
            BigDecimal lucroPrevisto,
            long inscritos) {

        public static EventoResponse de(Evento e, long inscritos) {
            return new EventoResponse(
                    e.getId(), e.getTitulo(), e.getTipo(), e.getStatus(), e.getSlug(),
                    e.getDataInicio(), e.getDataFim(), e.getHoraInicio(), e.getHoraFim(),
                    e.getLocal(), e.getCapacidade(), e.getDescricao(),
                    e.getGastoPrevisto(), e.getReceitaPrevista(),
                    e.getReceitaPrevista().subtract(e.getGastoPrevisto()),
                    inscritos);
        }
    }

    public record InscricaoResponse(Long id, String nome, String email, String telefone, Instant criadoEm) {

        public static InscricaoResponse de(Inscricao i) {
            return new InscricaoResponse(i.getId(), i.getNome(), i.getEmail(), i.getTelefone(), i.getCriadoEm());
        }
    }
}
