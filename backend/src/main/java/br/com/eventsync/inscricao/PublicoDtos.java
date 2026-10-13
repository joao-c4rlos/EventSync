package br.com.eventsync.inscricao;

import br.com.eventsync.evento.Evento;
import br.com.eventsync.evento.StatusEvento;
import br.com.eventsync.evento.TipoEvento;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public final class PublicoDtos {

    private PublicoDtos() {
    }

    public record EventoPublicoResponse(
            String titulo,
            TipoEvento tipo,
            StatusEvento status,
            LocalDate dataInicio,
            LocalDate dataFim,
            LocalTime horaInicio,
            LocalTime horaFim,
            String local,
            String descricao,
            String organizador,
            int vagasRestantes,
            boolean inscricoesAbertas) {

        public static EventoPublicoResponse de(Evento e, long inscritos) {
            int vagas = (int) Math.max(0, e.getCapacidade() - inscritos);
            return new EventoPublicoResponse(
                    e.getTitulo(), e.getTipo(), e.getStatus(), e.getDataInicio(), e.getDataFim(),
                    e.getHoraInicio(), e.getHoraFim(), e.getLocal(), e.getDescricao(),
                    e.getOrganizador().getNome(), vagas, e.aceitaInscricoes() && vagas > 0);
        }
    }

    public record InscricaoRequest(
            @NotBlank(message = "Informe seu nome.")
            @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
            String nome,

            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "E-mail inválido.")
            @Size(max = 160, message = "O e-mail deve ter no máximo 160 caracteres.")
            String email,

            @Pattern(regexp = "^$|^[0-9()+\\- ]{8,20}$", message = "Telefone inválido.")
            String telefone) {
    }
}
