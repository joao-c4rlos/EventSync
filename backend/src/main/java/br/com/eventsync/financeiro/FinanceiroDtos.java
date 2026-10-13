package br.com.eventsync.financeiro;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class FinanceiroDtos {

    private FinanceiroDtos() {
    }

    public record LancamentoRequest(
            @NotBlank(message = "Informe a descrição.")
            @Size(max = 150, message = "A descrição deve ter no máximo 150 caracteres.")
            String descricao,

            @NotNull(message = "Selecione o tipo.")
            TipoLancamento tipo,

            @NotNull(message = "Selecione o status.")
            StatusLancamento status,

            @NotNull(message = "Informe o valor.")
            @Positive(message = "O valor deve ser maior que zero.")
            @Digits(integer = 10, fraction = 2, message = "Valor inválido.")
            BigDecimal valor,

            @NotNull(message = "Informe a data.")
            LocalDate data,

            Long eventoId) {
    }

    public record LancamentoResponse(
            Long id,
            String descricao,
            TipoLancamento tipo,
            StatusLancamento status,
            BigDecimal valor,
            LocalDate data,
            Long eventoId,
            String eventoTitulo) {

        public static LancamentoResponse de(Lancamento l) {
            return new LancamentoResponse(
                    l.getId(), l.getDescricao(), l.getTipo(), l.getStatus(), l.getValor(), l.getData(),
                    l.getEvento() != null ? l.getEvento().getId() : null,
                    l.getEvento() != null ? l.getEvento().getTitulo() : null);
        }
    }

    public record PontoSerie(LocalDate data, BigDecimal valor) {
    }

    public record ResumoMensal(
            String mes,
            BigDecimal gastoRealizado,
            BigDecimal gastoTotal,
            BigDecimal recebido,
            BigDecimal receitaTotal,
            BigDecimal lucroPrevisto,
            BigDecimal lucroReal,
            BigDecimal aReceberFimDoMes,
            BigDecimal receitaPrevistaProximoMes,
            BigDecimal gastosPendentes,
            List<PontoSerie> serieGasto,
            List<PontoSerie> serieRecebido,
            List<PontoSerie> serieLucroPrevisto,
            List<PontoSerie> serieLucroReal) {
    }
}
