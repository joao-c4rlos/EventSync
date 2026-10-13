package br.com.eventsync.evento;

import br.com.eventsync.IntegracaoTest;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EventoIntegracaoTest extends IntegracaoTest {

    private final LocalDate daquiDezDias = LocalDate.now().plusDays(10);

    @Test
    void criaEventoComoRascunhoECalculaLucro() throws Exception {
        String token = cadastrar("Ana", "ana@teste.com", "senhaForte1");
        long id = criarEvento(token, "Tech Day", 100, daquiDezDias);

        enviar(get("/api/eventos/" + id), token, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RASCUNHO"))
                .andExpect(jsonPath("$.lucroPrevisto").value(2500.0))
                .andExpect(jsonPath("$.inscritos").value(0));
    }

    @Test
    void validaCamposObrigatorios() throws Exception {
        String token = cadastrar("Ana", "ana@teste.com", "senhaForte1");

        enviar(post("/api/eventos"), token, "{\"titulo\": \"\", \"capacidade\": 0}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.titulo").value("Informe o título do evento."))
                .andExpect(jsonPath("$.campos.capacidade").value("A quantidade de pessoas deve ser no mínimo 1."))
                .andExpect(jsonPath("$.campos.local").exists());
    }

    @Test
    void isolaEventosEntreOrganizadores() throws Exception {
        String ana = cadastrar("Ana", "ana@teste.com", "senhaForte1");
        String bruno = cadastrar("Bruno", "bruno@teste.com", "senhaForte1");
        long id = criarEvento(ana, "Evento da Ana", 50, daquiDezDias);

        enviar(get("/api/eventos/" + id), bruno, null).andExpect(status().isNotFound());
        enviar(delete("/api/eventos/" + id), bruno, null).andExpect(status().isNotFound());
        enviar(get("/api/eventos"), bruno, null).andExpect(jsonPath("$", hasSize(0)));
        enviar(get("/api/eventos"), ana, null).andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void paginaPublicaSoExisteDepoisDePublicar() throws Exception {
        String token = cadastrar("Ana", "ana@teste.com", "senhaForte1");
        long id = criarEvento(token, "Show de Rock", 100, daquiDezDias);
        String slugRascunho = enviar(get("/api/eventos/" + id), token, null)
                .andReturn().getResponse().getContentAsString()
                .replaceAll(".*\"slug\":\"([^\"]+)\".*", "$1");

        enviar(get("/api/publico/eventos/" + slugRascunho), null, null).andExpect(status().isNotFound());

        String slug = publicar(token, id);
        enviar(get("/api/publico/eventos/" + slug), null, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Show de Rock"))
                .andExpect(jsonPath("$.organizador").value("Ana"))
                .andExpect(jsonPath("$.vagasRestantes").value(100))
                .andExpect(jsonPath("$.inscricoesAbertas").value(true));
    }

    @Test
    void controlaInscricoesDuplicadasEVagas() throws Exception {
        String token = cadastrar("Ana", "ana@teste.com", "senhaForte1");
        long id = criarEvento(token, "Workshop", 1, daquiDezDias);
        String slug = publicar(token, id);
        String url = "/api/publico/eventos/" + slug + "/inscricoes";

        enviar(post(url), null, "{\"nome\": \"Carla\", \"email\": \"carla@teste.com\"}")
                .andExpect(status().isCreated());
        enviar(post(url), null, "{\"nome\": \"Carla\", \"email\": \"CARLA@teste.com\"}")
                .andExpect(status().isConflict());
        enviar(post(url), null, "{\"nome\": \"Davi\", \"email\": \"davi@teste.com\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("As vagas para este evento estão esgotadas."));

        enviar(get("/api/eventos/" + id + "/inscricoes"), token, null)
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome").value("Carla"));
    }

    @Test
    void dashboardContaEventosEInscricoes() throws Exception {
        String token = cadastrar("Ana", "ana@teste.com", "senhaForte1");
        long id = criarEvento(token, "Conferência", 10, LocalDate.now().plusDays(3));
        String slug = publicar(token, id);
        enviar(post("/api/publico/eventos/" + slug + "/inscricoes"), null,
                "{\"nome\": \"Carla\", \"email\": \"carla@teste.com\"}");

        enviar(get("/api/dashboard/indicadores"), token, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEventos").value(1))
                .andExpect(jsonPath("$.eventosProximos").value(1))
                .andExpect(jsonPath("$.inscricoesNoMes").value(1));

        enviar(get("/api/notificacoes"), token, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categoria").value("EVENTO_PROXIMO"));
    }
}
