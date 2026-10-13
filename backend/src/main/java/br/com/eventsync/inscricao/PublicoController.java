package br.com.eventsync.inscricao;

import br.com.eventsync.inscricao.PublicoDtos.EventoPublicoResponse;
import br.com.eventsync.inscricao.PublicoDtos.InscricaoRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/publico/eventos")
@RequiredArgsConstructor
public class PublicoController {

    private final PublicoService publicoService;

    @GetMapping("/{slug}")
    public EventoPublicoResponse evento(@PathVariable String slug) {
        return publicoService.evento(slug);
    }

    @PostMapping("/{slug}/inscricoes")
    @ResponseStatus(HttpStatus.CREATED)
    public void inscrever(@PathVariable String slug, @Valid @RequestBody InscricaoRequest req) {
        publicoService.inscrever(slug, req);
    }
}
