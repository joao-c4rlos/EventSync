package br.com.eventsync.usuario;

import br.com.eventsync.usuario.UsuarioDtos.AlterarSenhaRequest;
import br.com.eventsync.usuario.UsuarioDtos.ExcluirContaRequest;
import br.com.eventsync.usuario.UsuarioDtos.PlanoRequest;
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

    @PutMapping("/plano")
    public UsuarioResponse alterarPlano(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PlanoRequest req) {
        return UsuarioResponse.de(usuarioService.alterarPlano(idDo(jwt), req.plano()));
    }

    @PostMapping("/excluir")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirConta(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ExcluirContaRequest req) {
        usuarioService.excluirConta(idDo(jwt), req.senha());
    }

    private static Long idDo(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
