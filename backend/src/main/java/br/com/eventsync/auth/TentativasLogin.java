package br.com.eventsync.auth;

import br.com.eventsync.common.RegraNegocioException;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limita tentativas de login malsucedidas por e-mail (proteção contra força bruta).
 * Estado em memória: suficiente para uma instância; com várias, mover para Redis/banco.
 */
@Component
public class TentativasLogin {

    static final int MAXIMO_FALHAS = 5;
    static final Duration BLOQUEIO = Duration.ofMinutes(15);

    private record Registro(int falhas, Instant bloqueadoAte) {
    }

    private final ConcurrentHashMap<String, Registro> registros = new ConcurrentHashMap<>();

    /** Lança 429 se o e-mail estiver bloqueado. */
    public void verificar(String email) {
        Registro r = registros.get(email);
        if (r == null || r.bloqueadoAte() == null) {
            return;
        }
        Instant agora = Instant.now();
        if (r.bloqueadoAte().isAfter(agora)) {
            long minutos = Math.max(1, Duration.between(agora, r.bloqueadoAte()).toMinutes() + 1);
            throw RegraNegocioException.muitasTentativas(
                    "Muitas tentativas de login. Tente novamente em " + minutos + " min.");
        }
        registros.remove(email, r);
    }

    public void falhou(String email) {
        registros.merge(email, new Registro(1, null), (antigo, novo) -> {
            int falhas = antigo.falhas() + 1;
            return falhas >= MAXIMO_FALHAS
                    ? new Registro(0, Instant.now().plus(BLOQUEIO))
                    : new Registro(falhas, null);
        });
    }

    public void sucesso(String email) {
        registros.remove(email);
    }
}
