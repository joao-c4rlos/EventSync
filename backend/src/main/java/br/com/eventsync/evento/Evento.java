package br.com.eventsync.evento;

import br.com.eventsync.usuario.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "eventos")
@Getter
@Setter
@NoArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organizador_id")
    private Usuario organizador;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEvento tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusEvento status = StatusEvento.RASCUNHO;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fim")
    private LocalTime horaFim;

    @Column(name = "local_evento", nullable = false, length = 200)
    private String local;

    @Column(nullable = false)
    private Integer capacidade;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "gasto_previsto", nullable = false, precision = 12, scale = 2)
    private BigDecimal gastoPrevisto = BigDecimal.ZERO;

    @Column(name = "receita_prevista", nullable = false, precision = 12, scale = 2)
    private BigDecimal receitaPrevista = BigDecimal.ZERO;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @PrePersist
    void aoCriar() {
        criadoEm = Instant.now();
        atualizadoEm = criadoEm;
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadoEm = Instant.now();
    }

    public boolean aceitaInscricoes() {
        return status == StatusEvento.PUBLICADO && !dataTermino().isBefore(LocalDate.now());
    }

    public LocalDate dataTermino() {
        return dataFim != null ? dataFim : dataInicio;
    }
}
