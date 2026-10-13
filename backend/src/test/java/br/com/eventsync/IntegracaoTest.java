package br.com.eventsync;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegracaoTest {

    @Autowired
    protected MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void limparBanco() {
        jdbc.update("DELETE FROM usuarios");
    }

    protected String cadastrar(String nome, String email, String senha) throws Exception {
        String corpo = """
                {"nome": "%s", "email": "%s", "senha": "%s"}
                """.formatted(nome, email, senha);
        String resposta = mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.token");
    }

    protected ResultActions enviar(MockHttpServletRequestBuilder requisicao, String token, String corpo) throws Exception {
        if (token != null) {
            requisicao.header("Authorization", "Bearer " + token);
        }
        if (corpo != null) {
            requisicao.contentType(MediaType.APPLICATION_JSON).content(corpo);
        }
        return mvc.perform(requisicao);
    }

    protected String eventoJson(String titulo, int capacidade, LocalDate data) {
        return """
                {"titulo": "%s", "tipo": "CONFERENCIA", "dataInicio": "%s", "horaInicio": "19:00",
                 "horaFim": "22:00", "local": "Centro de Convenções", "capacidade": %d,
                 "gastoPrevisto": 1500.00, "receitaPrevista": 4000.00}
                """.formatted(titulo, data, capacidade);
    }

    protected long criarEvento(String token, String titulo, int capacidade, LocalDate data) throws Exception {
        String resposta = enviar(post("/api/eventos"), token, eventoJson(titulo, capacidade, data))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(resposta, "$.id")).longValue();
    }

    protected String publicar(String token, long eventoId) throws Exception {
        String resposta = enviar(patch("/api/eventos/" + eventoId + "/status"), token, "{\"status\": \"PUBLICADO\"}")
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.slug");
    }
}
