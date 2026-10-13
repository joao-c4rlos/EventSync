package br.com.eventsync.auth;

import br.com.eventsync.usuario.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class TokenService {

    private static final Duration VALIDADE_LEMBRAR = Duration.ofDays(30);

    private final JwtEncoder encoder;
    private final Duration validadePadrao;

    public TokenService(JwtEncoder encoder, @Value("${app.jwt.expiration-minutes}") long expiracaoMinutos) {
        this.encoder = encoder;
        this.validadePadrao = Duration.ofMinutes(expiracaoMinutos);
    }

    public TokenGerado gerar(Usuario usuario, boolean lembrar) {
        Instant agora = Instant.now();
        Instant expiraEm = agora.plus(lembrar ? VALIDADE_LEMBRAR : validadePadrao);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("eventsync")
                .subject(usuario.getId().toString())
                .issuedAt(agora)
                .expiresAt(expiraEm)
                .claim("email", usuario.getEmail())
                .claim("nome", usuario.getNome())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new TokenGerado(token, expiraEm);
    }

    public record TokenGerado(String token, Instant expiraEm) {
    }
}
