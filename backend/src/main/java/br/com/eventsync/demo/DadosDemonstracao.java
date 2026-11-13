package br.com.eventsync.demo;

import br.com.eventsync.evento.Evento;
import br.com.eventsync.evento.EventoRepository;
import br.com.eventsync.evento.StatusEvento;
import br.com.eventsync.evento.TipoEvento;
import br.com.eventsync.financeiro.Lancamento;
import br.com.eventsync.financeiro.LancamentoRepository;
import br.com.eventsync.financeiro.StatusLancamento;
import br.com.eventsync.financeiro.TipoLancamento;
import br.com.eventsync.inscricao.Inscricao;
import br.com.eventsync.inscricao.InscricaoRepository;
import br.com.eventsync.inscricao.OrigemInscricao;
import br.com.eventsync.usuario.Plano;
import br.com.eventsync.usuario.Usuario;
import br.com.eventsync.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Cria, na primeira execução, uma conta de demonstração com eventos, inscrições e lançamentos simulados,
 * para que o dashboard já abra com informações. As datas são relativas a hoje, então o painel nunca fica vazio.
 * Desligue com {@code app.demo.enabled=false} (variável {@code DEMO_DATA=false}).
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true", matchIfMissing = true)
public class DadosDemonstracao implements ApplicationRunner {

    public static final String EMAIL = "demo@eventsync.com.br";
    public static final String SENHA = "demo12345";

    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");
    private static final String[] NOMES = {
            "Ana", "Bruno", "Carla", "Diego", "Elisa", "Felipe", "Gabriela", "Hugo", "Isabela", "João",
            "Karen", "Lucas", "Mariana", "Nicolas", "Olívia", "Paulo", "Rafaela", "Samuel", "Tatiane", "Vitor"};
    private static final String[] SOBRENOMES = {
            "Silva", "Souza", "Oliveira", "Santos", "Lima", "Pereira", "Costa", "Rodrigues", "Almeida", "Nunes",
            "Carvalho", "Ribeiro", "Martins", "Araújo", "Barbosa"};

    private final UsuarioRepository usuarios;
    private final EventoRepository eventos;
    private final InscricaoRepository inscricoes;
    private final LancamentoRepository lancamentos;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random(42);

    private record Modelo(String titulo, TipoEvento tipo, StatusEvento status, int diasDeHoje, int capacidade,
                          int inscritos, String local, String descricao, int gasto, int receita) {
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarios.existsByEmailIgnoreCase(EMAIL)) {
            return;
        }

        Usuario demo = new Usuario();
        demo.setNome("Conta Demonstração");
        demo.setEmail(EMAIL);
        demo.setSenhaHash(passwordEncoder.encode(SENHA));
        demo.setCidade("São Paulo");
        demo.setPlano(Plano.PROFISSIONAL);
        usuarios.save(demo);

        LocalDate hoje = LocalDate.now(FUSO);
        List<Evento> criados = new ArrayList<>();
        for (Modelo m : modelos()) {
            Evento e = criarEvento(demo, m, hoje);
            criados.add(e);
            criarInscricoes(e, m.inscritos(), hoje);
            criarLancamentosDoEvento(demo, e, hoje);
        }
        criarLancamentosAvulsos(demo, hoje);

        log.info("Dados de demonstração criados: {} eventos. Login: {} / {}", criados.size(), EMAIL, SENHA);
    }

    private List<Modelo> modelos() {
        return List.of(
                new Modelo("Tech Summit Brasil", TipoEvento.CONFERENCIA, StatusEvento.ENCERRADO, -150, 200, 168,
                        "Centro de Convenções Anhembi, São Paulo", "Dois dias de palestras sobre tecnologia e inovação.", 28000, 42000),
                new Modelo("Casamento Marina & Pedro", TipoEvento.CASAMENTO, StatusEvento.ENCERRADO, -95, 120, 112,
                        "Espaço Villa Verde, Campinas", "Cerimônia e recepção ao ar livre.", 36000, 36000),
                new Modelo("Treinamento Liderança Ágil", TipoEvento.TREINAMENTO, StatusEvento.ENCERRADO, -60, 40, 38,
                        "Hotel Maksoud Plaza, São Paulo", "Treinamento in-company de 16 horas.", 9500, 15200),
                new Modelo("Show Banda Horizonte", TipoEvento.SHOW, StatusEvento.ENCERRADO, -20, 500, 430,
                        "Audio Club, São Paulo", "Turnê de lançamento do novo álbum.", 52000, 64500),
                new Modelo("Show Acústico no Parque", TipoEvento.SHOW, StatusEvento.CANCELADO, -40, 150, 23,
                        "Parque Villa-Lobos, São Paulo", "Cancelado por previsão de chuva.", 6000, 7500),
                new Modelo("Workshop de UX Research", TipoEvento.TREINAMENTO, StatusEvento.PUBLICADO, 6, 60, 41,
                        "WeWork Paulista, São Paulo", "Workshop prático de pesquisa com usuários.", 4200, 12300),
                new Modelo("Festival Sabores do Brasil", TipoEvento.OUTRO, StatusEvento.PUBLICADO, 18, 300, 187,
                        "Parque Ibirapuera, São Paulo", "Gastronomia regional, música e oficinas.", 31000, 45000),
                new Modelo("Conferência de Dados & IA", TipoEvento.CONFERENCIA, StatusEvento.PUBLICADO, 45, 250, 96,
                        "Expo Center Norte, São Paulo", "Casos reais de dados e inteligência artificial.", 38000, 55000),
                new Modelo("Treinamento de Vendas Consultivas", TipoEvento.TREINAMENTO, StatusEvento.RASCUNHO, 70, 50, 0,
                        "A definir", "Rascunho: ainda falta fechar o local e o instrutor.", 5000, 9000));
    }

    private Evento criarEvento(Usuario organizador, Modelo m, LocalDate hoje) {
        Evento e = new Evento();
        e.setOrganizador(organizador);
        e.setTitulo(m.titulo());
        e.setTipo(m.tipo());
        e.setStatus(m.status());
        e.setSlug("demo-" + m.titulo().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", ""));
        e.setDataInicio(hoje.plusDays(m.diasDeHoje()));
        e.setHoraInicio(LocalTime.of(m.tipo() == TipoEvento.SHOW ? 21 : 9, 0));
        e.setHoraFim(LocalTime.of(m.tipo() == TipoEvento.SHOW ? 23 : 18, 0));
        e.setLocal(m.local());
        e.setCapacidade(m.capacidade());
        e.setDescricao(m.descricao());
        e.setGastoPrevisto(BigDecimal.valueOf(m.gasto()));
        e.setReceitaPrevista(BigDecimal.valueOf(m.receita()));
        return eventos.save(e);
    }

    /** Inscrições espalhadas nos ~90 dias anteriores ao evento (ou até hoje, se ele ainda não aconteceu). */
    private void criarInscricoes(Evento evento, int quantidade, LocalDate hoje) {
        if (quantidade == 0) {
            return;
        }
        Instant agora = Instant.now();
        Instant fim = evento.getDataInicio().isBefore(hoje)
                ? evento.getDataInicio().atStartOfDay(FUSO).toInstant() : agora;
        long janela = Duration.ofDays(90).toSeconds();

        List<Inscricao> lote = new ArrayList<>(quantidade);
        for (int i = 0; i < quantidade; i++) {
            Inscricao inscricao = new Inscricao();
            inscricao.setEvento(evento);
            inscricao.setCriadoEm(fim.minusSeconds((long) (Math.pow(random.nextDouble(), 1.6) * janela)));

            boolean manual = i % 9 == 0;
            if (manual) {
                // Inscrição manual como dado de controle: nome, e-mail e nascimento são opcionais.
                inscricao.setOrigem(OrigemInscricao.MANUAL);
                if (i % 18 != 0) {
                    inscricao.setNome(nomeAleatorio());
                }
                if (i % 27 == 0) {
                    inscricao.setDataNascimento(nascimentoAleatorio(hoje));
                }
            } else {
                String nome = nomeAleatorio();
                inscricao.setNome(nome);
                inscricao.setEmail(emailDe(nome, evento.getId(), i));
                inscricao.setTelefone("(11) 9" + (1000 + random.nextInt(9000)) + "-" + (1000 + random.nextInt(9000)));
                inscricao.setDataNascimento(nascimentoAleatorio(hoje));
            }
            lote.add(inscricao);
        }
        inscricoes.saveAll(lote);
    }

    private void criarLancamentosDoEvento(Usuario organizador, Evento e, LocalDate hoje) {
        LocalDate dia = e.getDataInicio();
        BigDecimal gasto = e.getGastoPrevisto();
        BigDecimal receita = e.getReceitaPrevista();
        String nome = e.getTitulo();

        switch (e.getStatus()) {
            case ENCERRADO -> {
                lancar(organizador, e, "Sinal do local · " + nome, TipoLancamento.GASTO, StatusLancamento.CONCLUIDO, percentual(gasto, 40), dia.minusDays(25));
                lancar(organizador, e, "Equipe e fornecedores · " + nome, TipoLancamento.GASTO, StatusLancamento.CONCLUIDO, percentual(gasto, 60), dia);
                lancar(organizador, e, "Ingressos (lote 1) · " + nome, TipoLancamento.RECEBIMENTO, StatusLancamento.CONCLUIDO, percentual(receita, 55), dia.minusDays(30));
                lancar(organizador, e, "Ingressos (lote 2) · " + nome, TipoLancamento.RECEBIMENTO, StatusLancamento.CONCLUIDO, percentual(receita, 45), dia.minusDays(5));
            }
            case PUBLICADO -> {
                lancar(organizador, e, "Sinal do local · " + nome, TipoLancamento.GASTO, StatusLancamento.CONCLUIDO, percentual(gasto, 30), hoje.minusDays(3));
                lancar(organizador, e, "Fornecedores · " + nome, TipoLancamento.GASTO, StatusLancamento.PENDENTE, percentual(gasto, 70), dia.minusDays(2));
                lancar(organizador, e, "Ingressos vendidos · " + nome, TipoLancamento.RECEBIMENTO, StatusLancamento.CONCLUIDO, percentual(receita, 35), hoje.minusDays(1));
                lancar(organizador, e, "Ingressos a receber · " + nome, TipoLancamento.RECEBIMENTO, StatusLancamento.PENDENTE, percentual(receita, 65), dia);
            }
            case CANCELADO -> lancar(organizador, e, "Multa de cancelamento · " + nome, TipoLancamento.GASTO, StatusLancamento.CONCLUIDO, percentual(gasto, 15), dia.minusDays(2));
            default -> {
            }
        }
    }

    /** Lançamentos sem evento (custos fixos) e alguns vencimentos próximos, que aparecem nas notificações. */
    private void criarLancamentosAvulsos(Usuario organizador, LocalDate hoje) {
        for (int mes = 3; mes >= 0; mes--) {
            LocalDate dia = hoje.minusMonths(mes).withDayOfMonth(5);
            StatusLancamento status = dia.isAfter(hoje) ? StatusLancamento.PENDENTE : StatusLancamento.CONCLUIDO;
            lancar(organizador, null, "Aluguel do escritório", TipoLancamento.GASTO, status, BigDecimal.valueOf(3200), dia);
            lancar(organizador, null, "Ferramentas e assinaturas", TipoLancamento.GASTO, status, BigDecimal.valueOf(890), dia.plusDays(2).isAfter(hoje) ? hoje : dia.plusDays(2));
        }
        lancar(organizador, null, "Fornecedor de som e luz (atrasado)", TipoLancamento.GASTO, StatusLancamento.PENDENTE, BigDecimal.valueOf(2400), hoje.minusDays(4));
        lancar(organizador, null, "Patrocínio Banco Aurora", TipoLancamento.RECEBIMENTO, StatusLancamento.PENDENTE, BigDecimal.valueOf(8000), hoje.plusDays(2));
        lancar(organizador, null, "Consultoria de cerimonial", TipoLancamento.RECEBIMENTO, StatusLancamento.CONCLUIDO, BigDecimal.valueOf(4500), hoje.minusDays(6));
    }

    private void lancar(Usuario organizador, Evento evento, String descricao, TipoLancamento tipo,
                        StatusLancamento status, BigDecimal valor, LocalDate data) {
        Lancamento l = new Lancamento();
        l.setOrganizador(organizador);
        l.setEvento(evento);
        l.setDescricao(descricao.length() > 150 ? descricao.substring(0, 150) : descricao);
        l.setTipo(tipo);
        l.setStatus(status);
        l.setValor(valor);
        l.setData(data);
        lancamentos.save(l);
    }

    private static BigDecimal percentual(BigDecimal total, int pct) {
        return total.multiply(BigDecimal.valueOf(pct)).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
    }

    private String nomeAleatorio() {
        return NOMES[random.nextInt(NOMES.length)] + " " + SOBRENOMES[random.nextInt(SOBRENOMES.length)];
    }

    private static String emailDe(String nome, Long eventoId, int indice) {
        String base = java.text.Normalizer.normalize(nome, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase().replaceAll("[^a-z]+", ".");
        return base + "." + eventoId + "." + indice + "@exemplo.com.br";
    }

    private LocalDate nascimentoAleatorio(LocalDate hoje) {
        return hoje.minusYears(18 + random.nextInt(45)).minusDays(random.nextInt(365));
    }
}
