package br.com.eventsync.financeiro;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

    Optional<Lancamento> findByIdAndOrganizadorId(Long id, Long organizadorId);

    @Query("""
            select l from Lancamento l left join fetch l.evento
            where l.organizador.id = :organizadorId
              and l.data between :inicio and :fim
              and (:eventoId is null or l.evento.id = :eventoId)
            order by l.data desc, l.id desc
            """)
    List<Lancamento> buscar(@Param("organizadorId") Long organizadorId,
                            @Param("inicio") LocalDate inicio,
                            @Param("fim") LocalDate fim,
                            @Param("eventoId") Long eventoId);
}
