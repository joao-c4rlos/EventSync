package br.com.eventsync.auth;

import br.com.eventsync.usuario.UsuarioResponse;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record CadastroRequest(
            @NotBlank(message = "Informe seu nome.")
            @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
            String nome,

            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "E-mail inválido.")
            @Size(max = 160, message = "O e-mail deve ter no máximo 160 caracteres.")
            String email,

            @NotBlank(message = "Informe uma senha.")
            @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
            String senha) {
    }

    public record LoginRequest(
            @NotBlank(message = "Informe seu e-mail.") String email,
            @NotBlank(message = "Informe sua senha.") String senha,
            Boolean lembrar) {

        public boolean lembrarAtivo() {
            return Boolean.TRUE.equals(lembrar);
        }
    }

    public record AuthResponse(String token, Instant expiraEm, UsuarioResponse usuario) {
    }

    public record EsqueciSenhaRequest(
            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "E-mail inválido.")
            String email) {
    }

    public record RedefinirSenhaRequest(
            @NotBlank(message = "Token ausente.") String token,

            @NotBlank(message = "Informe a nova senha.")
            @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
            String novaSenha) {
    }
}
