package br.com.eventsync.usuario;

import br.com.eventsync.usuario.UsuarioDtos.AlterarSenhaRequest;
import br.com.eventsync.usuario.UsuarioDtos.PerfilRequest;
import br.com.eventsync.usuario.UsuarioDtos.PreferenciasRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios/me")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public UsuarioResponse meusDados(@AuthenticationPrincipal Jwt jwt) {
        return UsuarioResponse.de(usuarioService.buscar(idDo(jwt)));
    }

    @PutMapping
    public UsuarioResponse atualizarPerfil(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PerfilRequest req) {
        return UsuarioResponse.de(usuarioService.atualizarPerfil(idDo(jwt), req));
    }

    @PutMapping("/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarSenha(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AlterarSenhaRequest req) {
        usuarioService.alterarSenha(idDo(jwt), req);
    }

    @PutMapping("/preferencias")
    public UsuarioResponse atualizarPreferencias(@AuthenticationPrincipal Jwt jwt,
                                                 @Valid @RequestBody PreferenciasRequest req) {
        return UsuarioResponse.de(usuarioService.atualizarPreferencias(idDo(jwt), req));
    }

    private static Long idDo(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
