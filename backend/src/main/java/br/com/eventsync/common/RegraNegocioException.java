package br.com.eventsync.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class RegraNegocioException extends RuntimeException {

    private final HttpStatus status;

    public RegraNegocioException(HttpStatus status, String mensagem) {
        super(mensagem);
        this.status = status;
    }

    public static RegraNegocioException naoEncontrado(String mensagem) {
        return new RegraNegocioException(HttpStatus.NOT_FOUND, mensagem);
    }

    public static RegraNegocioException conflito(String mensagem) {
        return new RegraNegocioException(HttpStatus.CONFLICT, mensagem);
    }

    public static RegraNegocioException invalido(String mensagem) {
        return new RegraNegocioException(HttpStatus.BAD_REQUEST, mensagem);
    }

    public static RegraNegocioException naoAutorizado(String mensagem) {
        return new RegraNegocioException(HttpStatus.UNAUTHORIZED, mensagem);
    }
}
