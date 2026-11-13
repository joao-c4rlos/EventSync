package br.com.eventsync.financeiro;

import br.com.eventsync.evento.Evento;
import br.com.eventsync.inscricao.Inscricao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Lança o valor do ingresso no financeiro quando a inscrição é de um evento pago.
 */
@Component
@RequiredArgsConstructor
public class IngressoFinanceiro {

    private final LancamentoRepository lancamentos;

    public void registrar(Inscricao inscricao) {
        Evento evento = inscricao.getEvento();
        if (evento.isGratuito() || evento.getValorIngresso() == null || evento.getValorIngresso().signum() <= 0) {
            return;
        }

        String nome = inscricao.getNome() == null || inscricao.getNome().isBlank()
                ? "inscrição sem nome"
                : inscricao.getNome().trim();
        String descricao = "Ingresso — " + nome;
        if (descricao.length() > 150) {
            descricao = descricao.substring(0, 150);
        }

        Lancamento lancamento = new Lancamento();
        lancamento.setOrganizador(evento.getOrganizador());
        lancamento.setEvento(evento);
        lancamento.setInscricao(inscricao);
        lancamento.setDescricao(descricao);
        lancamento.setTipo(TipoLancamento.RECEBIMENTO);
        lancamento.setStatus(StatusLancamento.CONCLUIDO);
        lancamento.setValor(evento.getValorIngresso());
        lancamento.setData(LocalDate.now());
        lancamentos.save(lancamento);
    }
}
