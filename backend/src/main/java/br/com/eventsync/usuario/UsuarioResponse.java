package br.com.eventsync.usuario;

import java.time.LocalDate;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        String celular,
        LocalDate dataNascimento,
        Sexo sexo,
        String cidade,
        String fotoUrl,
        String idioma,
        String fusoHorario,
        Tema tema,
        Plano plano) {

    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(
                u.getId(), u.getNome(), u.getEmail(), u.getTelefone(), u.getCelular(),
                u.getDataNascimento(), u.getSexo(), u.getCidade(), u.getFotoUrl(),
                u.getIdioma(), u.getFusoHorario(), u.getTema(), u.getPlano());
    }
}
