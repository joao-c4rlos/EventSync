package br.com.eventsync.usuario;

import br.com.eventsync.IntegracaoTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UsuarioIntegracaoTest extends IntegracaoTest {

    @Test
    void alteraSenhaSomenteComSenhaAtualCorreta() throws Exception {
        String token = cadastrar("Ana", "ana@teste.com", "senhaForte1");

        enviar(put("/api/usuarios/me/senha"), token, "{\"senhaAtual\": \"errada123\", \"novaSenha\": \"novaSenha99\"}")
                .andExpect(status().isBadRequest());
        enviar(put("/api/usuarios/me/senha"), token, "{\"senhaAtual\": \"senhaForte1\", \"novaSenha\": \"novaSenha99\"}")
                .andExpect(status().isNoContent());

        enviar(post("/api/auth/login"), null, "{\"email\": \"ana@teste.com\", \"senha\": \"novaSenha99\"}")
                .andExpect(status().isOk());
    }

    @Test
    void salvaPreferenciasEValidaFusoHorario() throws Exception {
        String token = cadastrar("Ana", "ana@teste.com", "senhaForte1");

        enviar(put("/api/usuarios/me/preferencias"), token,
                "{\"idioma\": \"pt-BR\", \"fusoHorario\": \"America/Manaus\", \"tema\": \"ESCURO\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tema").value("ESCURO"))
                .andExpect(jsonPath("$.fusoHorario").value("America/Manaus"));

        enviar(put("/api/usuarios/me/preferencias"), token,
                "{\"idioma\": \"pt-BR\", \"fusoHorario\": \"Marte/Olympus\", \"tema\": \"CLARO\"}")
                .andExpect(status().isBadRequest());
    }

    @Test
    void trocaDePlanoSimulada() throws Exception {
        String token = cadastrar("Ana", "ana@teste.com", "senhaForte1");

        enviar(put("/api/usuarios/me/plano"), token, "{\"plano\": \"PROFISSIONAL\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plano").value("PROFISSIONAL"));
    }

    @Test
    void excluiContaComConfirmacaoDeSenha() throws Exception {
        String token = cadastrar("Ana", "ana@teste.com", "senhaForte1");
        criarEvento(token, "Evento", 10, java.time.LocalDate.now().plusDays(5));

        enviar(post("/api/usuarios/me/excluir"), token, "{\"senha\": \"errada123\"}")
                .andExpect(status().isBadRequest());
        enviar(post("/api/usuarios/me/excluir"), token, "{\"senha\": \"senhaForte1\"}")
                .andExpect(status().isNoContent());

        enviar(post("/api/auth/login"), null, "{\"email\": \"ana@teste.com\", \"senha\": \"senhaForte1\"}")
                .andExpect(status().isUnauthorized());
    }
}
