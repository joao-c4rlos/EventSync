package br.com.eventsync.auth;

import br.com.eventsync.IntegracaoTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthIntegracaoTest extends IntegracaoTest {

    @Test
    void cadastraEFazLogin() throws Exception {
        cadastrar("Ana Souza", "ana@teste.com", "senhaForte1");

        enviar(post("/api/auth/login"), null, """
                {"email": "ANA@teste.com", "senha": "senhaForte1"}
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.nome").value("Ana Souza"))
                .andExpect(jsonPath("$.usuario.plano").value("GRATUITO"));
    }

    @Test
    void recusaEmailDuplicado() throws Exception {
        cadastrar("Ana", "ana@teste.com", "senhaForte1");

        enviar(post("/api/auth/cadastro"), null, """
                {"nome": "Outra Ana", "email": "ana@teste.com", "senha": "outraSenha1"}
                """)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Já existe uma conta com este e-mail."));
    }

    @Test
    void retornaErrosPorCampo() throws Exception {
        enviar(post("/api/auth/cadastro"), null, """
                {"nome": "", "email": "invalido", "senha": "123"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nome").value("Informe seu nome."))
                .andExpect(jsonPath("$.campos.email").value("E-mail inválido."))
                .andExpect(jsonPath("$.campos.senha").value("A senha deve ter entre 8 e 72 caracteres."));
    }

    @Test
    void recusaSenhaIncorreta() throws Exception {
        cadastrar("Ana", "ana@teste.com", "senhaForte1");

        enviar(post("/api/auth/login"), null, """
                {"email": "ana@teste.com", "senha": "errada123"}
                """)
                .andExpect(status().isUnauthorized());
    }

    @Test
    void exigeTokenNasRotasPrivadas() throws Exception {
        enviar(get("/api/eventos"), null, null).andExpect(status().isUnauthorized());
        enviar(get("/api/eventos"), "token-falso", null).andExpect(status().isUnauthorized());
    }
}
