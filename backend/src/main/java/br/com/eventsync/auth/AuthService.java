package br.com.eventsync.auth;

import br.com.eventsync.auth.AuthDtos.*;
import br.com.eventsync.common.RegraNegocioException;
import br.com.eventsync.usuario.Usuario;
import br.com.eventsync.usuario.UsuarioRepository;
import br.com.eventsync.usuario.UsuarioResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Duration VALIDADE_TOKEN_REDEFINICAO = Duration.ofHours(1);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UsuarioRepository usuarios;
    private final TokenRedefinicaoSenhaRepository tokensRedefinicao;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final TentativasLogin tentativas;

    /** Hash descartável (gerado sob demanda) usado para igualar o tempo de resposta quando o e-mail não existe. */
    private volatile String hashFalso;

    private String hashFalso() {
        String h = hashFalso;
        if (h == null) {
            h = passwordEncoder.encode("eventsync-hash-falso");
            hashFalso = h;
        }
        return h;
    }

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Transactional
    public AuthResponse cadastrar(CadastroRequest req) {
        String email = normalizarEmail(req.email());
        if (usuarios.existsByEmailIgnoreCase(email)) {
            throw RegraNegocioException.conflito("Já existe uma conta com este e-mail.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(req.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(req.senha()));
        usuarios.save(usuario);

        return autenticado(usuario, false);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = normalizarEmail(req.email());
        tentativas.verificar(email);

        Usuario usuario = usuarios.findByEmailIgnoreCase(email).orElse(null);
        // Compara sempre com um hash, mesmo sem usuário, para não revelar por tempo de resposta quais e-mails existem.
        boolean senhaConfere = passwordEncoder.matches(req.senha(),
                usuario != null ? usuario.getSenhaHash() : hashFalso());
        if (usuario == null || !senhaConfere) {
            tentativas.falhou(email);
            throw RegraNegocioException.naoAutorizado("E-mail ou senha incorretos.");
        }

        tentativas.sucesso(email);
        return autenticado(usuario, req.lembrarAtivo());
    }

    @Transactional
    public void solicitarRedefinicao(EsqueciSenhaRequest req) {
        usuarios.findByEmailIgnoreCase(normalizarEmail(req.email())).ifPresent(usuario -> {
            byte[] bytes = new byte[32];
            RANDOM.nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

            TokenRedefinicaoSenha registro = new TokenRedefinicaoSenha();
            registro.setUsuario(usuario);
            registro.setTokenHash(sha256(token));
            registro.setExpiraEm(Instant.now().plus(VALIDADE_TOKEN_REDEFINICAO));
            tokensRedefinicao.save(registro);

            // Envio de e-mail simulado: o link aparece no log do servidor.
            log.info("Link de redefinição de senha para {}: {}/redefinir-senha?token={}",
                    usuario.getEmail(), frontendUrl, token);
        });
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaRequest req) {
        TokenRedefinicaoSenha registro = tokensRedefinicao.findByTokenHash(sha256(req.token()))
                .filter(TokenRedefinicaoSenha::valido)
                .orElseThrow(() -> RegraNegocioException.invalido("Link de redefinição inválido ou expirado."));

        registro.getUsuario().setSenhaHash(passwordEncoder.encode(req.novaSenha()));
        registro.setUsadoEm(Instant.now());
    }

    private AuthResponse autenticado(Usuario usuario, boolean lembrar) {
        TokenService.TokenGerado gerado = tokenService.gerar(usuario, lembrar);
        return new AuthResponse(gerado.token(), gerado.expiraEm(), UsuarioResponse.de(usuario));
    }

    private static String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String sha256(String valor) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(valor.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
