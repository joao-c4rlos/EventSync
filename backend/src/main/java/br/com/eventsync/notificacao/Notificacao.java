package br.com.eventsync.notificacao;

import java.time.LocalDate;

public record Notificacao(
        String id,
        Categoria categoria,
        String titulo,
        String mensagem,
        String detalhe,
        LocalDate data,
        String link) {

    public enum Categoria {
        EVENTO_PROXIMO,
        PAGAMENTO_PENDENTE,
        RECEBIMENTO_PENDENTE
    }
}
