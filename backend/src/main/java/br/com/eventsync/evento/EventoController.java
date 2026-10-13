package br.com.eventsync.evento;

import br.com.eventsync.evento.EventoDtos.EventoRequest;
import br.com.eventsync.evento.EventoDtos.EventoResponse;
import br.com.eventsync.evento.EventoDtos.InscricaoResponse;
import br.com.eventsync.evento.EventoDtos.StatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService eventoService;

    @GetMapping
    public List<EventoResponse> listar(@AuthenticationPrincipal Jwt jwt,
                                       @RequestParam(required = false) String busca,
                                       @RequestParam(required = false) StatusEvento status) {
        return eventoService.listar(idDo(jwt), busca, status);
    }

    @GetMapping("/{id}")
    public EventoResponse detalhar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return eventoService.detalhar(idDo(jwt), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventoResponse criar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody EventoRequest req) {
        return eventoService.criar(idDo(jwt), req);
    }

    @PutMapping("/{id}")
    public EventoResponse atualizar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                    @Valid @RequestBody EventoRequest req) {
        return eventoService.atualizar(idDo(jwt), id, req);
    }

    @PatchMapping("/{id}/status")
    public EventoResponse alterarStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                        @Valid @RequestBody StatusRequest req) {
        return eventoService.alterarStatus(idDo(jwt), id, req.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        eventoService.excluir(idDo(jwt), id);
    }

    @GetMapping("/{id}/inscricoes")
    public List<InscricaoResponse> inscricoes(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return eventoService.listarInscricoes(idDo(jwt), id);
    }

    @DeleteMapping("/{id}/inscricoes/{inscricaoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerInscricao(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                 @PathVariable Long inscricaoId) {
        eventoService.removerInscricao(idDo(jwt), id, inscricaoId);
    }

    private static Long idDo(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
