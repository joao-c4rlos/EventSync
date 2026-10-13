package br.com.eventsync.inscricao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface InscricaoRepository extends JpaRepository<Inscricao, Long> {

    List<Inscricao> findByEventoIdOrderByCriadoEmDesc(Long eventoId);

    Optional<Inscricao> findByIdAndEventoId(Long id, Long eventoId);

    long countByEventoId(Long eventoId);

    boolean existsByEventoIdAndEmailIgnoreCase(Long eventoId, String email);

    @Query("select i.evento.id, count(i) from Inscricao i where i.evento.id in :ids group by i.evento.id")
    List<Object[]> contarPorEvento(@Param("ids") Collection<Long> ids);

    @Query("""
            select count(i) from Inscricao i
            where i.evento.organizador.id = :organizadorId and i.criadoEm >= :desde
            """)
    long contarDoOrganizadorDesde(@Param("organizadorId") Long organizadorId, @Param("desde") Instant desde);

    @Query("""
            select i.evento.id, i.criadoEm from Inscricao i
            where i.evento.organizador.id = :organizadorId and i.criadoEm >= :desde
            """)
    List<Object[]> datasDoOrganizadorDesde(@Param("organizadorId") Long organizadorId, @Param("desde") Instant desde);
}
