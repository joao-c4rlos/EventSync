package br.com.eventsync.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public final class UsuarioDtos {

    private UsuarioDtos() {
    }

    public record PerfilRequest(
            @NotBlank(message = "Informe seu nome.")
            @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
            String nome,

            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "E-mail inválido.")
            @Size(max = 160, message = "O e-mail deve ter no máximo 160 caracteres.")
            String email,

            @Pattern(regexp = "^$|^[0-9()+\\- ]{8,20}$", message = "Telefone inválido.")
            String telefone,

            @Pattern(regexp = "^$|^[0-9()+\\- ]{8,20}$", message = "Celular inválido.")
            String celular,

            @Past(message = "A data de aniversário deve estar no passado.")
            LocalDate dataNascimento,

            Sexo sexo,

            @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres.")
            String cidade) {
    }

    public record AlterarSenhaRequest(
            @NotBlank(message = "Informe a senha atual.") String senhaAtual,

            @NotBlank(message = "Informe a nova senha.")
            @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
            String novaSenha) {
    }

    public record PreferenciasRequest(
            @NotBlank(message = "Selecione o idioma.") String idioma,
            @NotBlank(message = "Selecione o fuso horário.") String fusoHorario,
            Tema tema) {
    }

    public record PlanoRequest(@NotNull(message = "Selecione um plano.") Plano plano) {
    }

    public record ExcluirContaRequest(@NotBlank(message = "Informe sua senha para confirmar.") String senha) {
    }
}
