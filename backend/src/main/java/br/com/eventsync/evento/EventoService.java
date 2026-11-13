package br.com.eventsync.evento;

import br.com.eventsync.common.RegraNegocioException;
import br.com.eventsync.evento.EventoDtos.EventoRequest;
import br.com.eventsync.evento.EventoDtos.EventoResponse;
import br.com.eventsync.evento.EventoDtos.InscricaoManualRequest;
import br.com.eventsync.evento.EventoDtos.InscricaoResponse;
import br.com.eventsync.financeiro.IngressoFinanceiro;
import br.com.eventsync.inscricao.OrigemInscricao;
import br.com.eventsync.inscricao.Inscricao;
import br.com.eventsync.inscricao.InscricaoRepository;
import br.com.eventsync.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventoService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALFABETO_SLUG = "abcdefghijkmnpqrstuvwxyz23456789";

    private final EventoRepository eventos;
    private final InscricaoRepository inscricoes;
    private final UsuarioRepository usuarios;
    private final IngressoFinanceiro ingressoFinanceiro;

    @Transactional(readOnly = true)
    public List<EventoResponse> listar(Long organizadorId, String busca, StatusEvento status) {
        String termo = busca == null || busca.isBlank() ? null : busca.trim();
        List<Evento> lista = eventos.buscar(organizadorId, termo, status);
        if (lista.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> contagem = inscricoes.contarPorEvento(lista.stream().map(Evento::getId).toList()).stream()
                .collect(Collectors.toMap(linha -> (Long) linha[0], linha -> (Long) linha[1]));

        return lista.stream()
                .map(e -> EventoResponse.de(e, contagem.getOrDefault(e.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public EventoResponse detalhar(Long organizadorId, Long id) {
        Evento evento = buscarDoOrganizador(organizadorId, id);
        return EventoResponse.de(evento, inscricoes.countByEventoId(id));
    }

    @Transactional
    public EventoResponse criar(Long organizadorId, EventoRequest req) {
        Evento evento = new Evento();
        evento.setOrganizador(usuarios.getReferenceById(organizadorId));
        aplicar(evento, req);
        evento.setSlug(gerarSlug(req.titulo()));
        eventos.save(evento);
        return EventoResponse.de(evento, 0);
    }

    @Transactional
    public EventoResponse atualizar(Long organizadorId, Long id, EventoRequest req) {
        Evento evento = buscarDoOrganizador(organizadorId, id);
        aplicar(evento, req);
        return EventoResponse.de(evento, inscricoes.countByEventoId(id));
    }

    @Transactional
    public EventoResponse alterarStatus(Long organizadorId, Long id, StatusEvento status) {
        Evento evento = buscarDoOrganizador(organizadorId, id);
        evento.setStatus(status);
        return EventoResponse.de(evento, inscricoes.countByEventoId(id));
    }

    @Transactional
    public void excluir(Long organizadorId, Long id) {
        eventos.delete(buscarDoOrganizador(organizadorId, id));
    }

    @Transactional(readOnly = true)
    public List<InscricaoResponse> listarInscricoes(Long organizadorId, Long eventoId) {
        buscarDoOrganizador(organizadorId, eventoId);
        return inscricoes.findByEventoIdOrderByCriadoEmDesc(eventoId).stream()
                .map(InscricaoResponse::de)
                .toList();
    }

    @Transactional
    public InscricaoResponse adicionarInscricaoManual(Long organizadorId, Long eventoId, InscricaoManualRequest req) {
        Evento evento = buscarDoOrganizador(organizadorId, eventoId);
        String nome = vazioParaNulo(req.nome());
        String email = vazioParaNulo(req.email());
        if (email != null) {
            email = email.toLowerCase(Locale.ROOT);
            if (inscricoes.existsByEventoIdAndEmailIgnoreCase(eventoId, email)) {
                throw RegraNegocioException.conflito("Este e-mail já está inscrito neste evento.");
            }
        }
        if (inscricoes.countByEventoId(eventoId) >= evento.getCapacidade()) {
            throw RegraNegocioException.invalido("As vagas para este evento estão esgotadas.");
        }

        Inscricao inscricao = new Inscricao();
        inscricao.setEvento(evento);
        inscricao.setNome(nome);
        inscricao.setEmail(email);
        inscricao.setDataNascimento(req.dataNascimento());
        inscricao.setOrigem(OrigemInscricao.MANUAL);
        inscricoes.save(inscricao);
        ingressoFinanceiro.registrar(inscricao);
        return InscricaoResponse.de(inscricao);
    }

    private static String vazioParaNulo(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    @Transactional
    public void removerInscricao(Long organizadorId, Long eventoId, Long inscricaoId) {
        buscarDoOrganizador(organizadorId, eventoId);
        Inscricao inscricao = inscricoes.findByIdAndEventoId(inscricaoId, eventoId)
                .orElseThrow(() -> RegraNegocioException.naoEncontrado("Inscrição não encontrada."));
        inscricoes.delete(inscricao);
    }

    Evento buscarDoOrganizador(Long organizadorId, Long id) {
        return eventos.findByIdAndOrganizadorId(id, organizadorId)
                .orElseThrow(() -> RegraNegocioException.naoEncontrado("Evento não encontrado."));
    }

    private void aplicar(Evento evento, EventoRequest req) {
        if (req.dataFim() != null && req.dataFim().isBefore(req.dataInicio())) {
            throw RegraNegocioException.invalido("A data de término não pode ser anterior à data do evento.");
        }
        boolean mesmoDia = req.dataFim() == null || req.dataFim().isEqual(req.dataInicio());
        if (mesmoDia && req.horaFim() != null && !req.horaFim().isAfter(req.horaInicio())) {
            throw RegraNegocioException.invalido("O horário de término deve ser depois do horário de início.");
        }

        evento.setTitulo(req.titulo().trim());
        evento.setTipo(req.tipo());
        evento.setDataInicio(req.dataInicio());
        evento.setDataFim(req.dataFim());
        evento.setHoraInicio(req.horaInicio());
        evento.setHoraFim(req.horaFim());
        evento.setLocal(req.local().trim());
        evento.setCapacidade(req.capacidade());
        evento.setDescricao(req.descricao() == null || req.descricao().isBlank() ? null : req.descricao().trim());
        evento.setGastoPrevisto(req.gastoPrevisto() == null ? BigDecimal.ZERO : req.gastoPrevisto());
        evento.setReceitaPrevista(req.receitaPrevista() == null ? BigDecimal.ZERO : req.receitaPrevista());

        boolean gratuito = req.gratuito() == null || req.gratuito();
        BigDecimal valor = req.valorIngresso() == null ? BigDecimal.ZERO : req.valorIngresso();
        if (gratuito) {
            evento.setGratuito(true);
            evento.setValorIngresso(BigDecimal.ZERO);
        } else if (valor.signum() <= 0) {
            throw RegraNegocioException.invalido("Informe o valor do ingresso.");
        } else {
            evento.setGratuito(false);
            evento.setValorIngresso(valor);
        }
    }

    private String gerarSlug(String titulo) {
        String base = Normalizer.normalize(titulo, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (base.length() > 60) {
            base = base.substring(0, 60).replaceAll("-$", "");
        }
        if (base.isEmpty()) {
            base = "evento";
        }

        String slug;
        do {
            StringBuilder sufixo = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sufixo.append(ALFABETO_SLUG.charAt(RANDOM.nextInt(ALFABETO_SLUG.length())));
            }
            slug = base + "-" + sufixo;
        } while (eventos.existsBySlug(slug));
        return slug;
    }
}
