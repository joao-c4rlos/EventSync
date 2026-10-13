package br.com.eventsync.inscricao;

import br.com.eventsync.common.RegraNegocioException;
import br.com.eventsync.evento.Evento;
import br.com.eventsync.evento.EventoRepository;
import br.com.eventsync.evento.StatusEvento;
import br.com.eventsync.inscricao.PublicoDtos.EventoPublicoResponse;
import br.com.eventsync.inscricao.PublicoDtos.InscricaoRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PublicoService {

    private final EventoRepository eventos;
    private final InscricaoRepository inscricoes;

    @Transactional(readOnly = true)
    public EventoPublicoResponse evento(String slug) {
        Evento evento = buscarVisivel(slug);
        return EventoPublicoResponse.de(evento, inscricoes.countByEventoId(evento.getId()));
    }

    @Transactional
    public void inscrever(String slug, InscricaoRequest req) {
        Evento evento = buscarVisivel(slug);
        if (!evento.aceitaInscricoes()) {
            throw RegraNegocioException.invalido("As inscrições para este evento estão encerradas.");
        }
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (inscricoes.existsByEventoIdAndEmailIgnoreCase(evento.getId(), email)) {
            throw RegraNegocioException.conflito("Este e-mail já está inscrito neste evento.");
        }
        if (inscricoes.countByEventoId(evento.getId()) >= evento.getCapacidade()) {
            throw RegraNegocioException.invalido("As vagas para este evento estão esgotadas.");
        }

        Inscricao inscricao = new Inscricao();
        inscricao.setEvento(evento);
        inscricao.setNome(req.nome().trim());
        inscricao.setEmail(email);
        inscricao.setTelefone(req.telefone() == null || req.telefone().isBlank() ? null : req.telefone().trim());
        inscricoes.save(inscricao);
    }

    private Evento buscarVisivel(String slug) {
        return eventos.findBySlug(slug)
                .filter(e -> e.getStatus() != StatusEvento.RASCUNHO)
                .orElseThrow(() -> RegraNegocioException.naoEncontrado("Evento não encontrado."));
    }
}
