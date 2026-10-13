package br.com.eventsync.usuario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 100)
    private String senhaHash;

    private String telefone;

    private String celular;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    private Sexo sexo;

    private String cidade;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(nullable = false)
    private String idioma = "pt-BR";

    @Column(name = "fuso_horario", nullable = false)
    private String fusoHorario = "America/Sao_Paulo";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tema tema = Tema.CLARO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Plano plano = Plano.GRATUITO;

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
}
