package br.com.eventsync.evento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    Optional<Evento> findByIdAndOrganizadorId(Long id, Long organizadorId);

    Optional<Evento> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByOrganizadorId(Long organizadorId);

    List<Evento> findByOrganizadorId(Long organizadorId);

    @Query("""
            select e from Evento e
            where e.organizador.id = :organizadorId
              and e.status in :status
              and e.dataInicio between :inicio and :fim
            order by e.dataInicio, e.horaInicio
            """)
    List<Evento> proximos(@Param("organizadorId") Long organizadorId,
                          @Param("status") Collection<StatusEvento> status,
                          @Param("inicio") LocalDate inicio,
                          @Param("fim") LocalDate fim);

    @Query("""
            select e from Evento e
            where e.organizador.id = :organizadorId
              and (:status is null or e.status = :status)
              and (:busca is null
                   or lower(e.titulo) like lower(concat('%', :busca, '%'))
                   or lower(e.local) like lower(concat('%', :busca, '%')))
            order by e.dataInicio desc, e.horaInicio desc
            """)
    List<Evento> buscar(@Param("organizadorId") Long organizadorId,
                        @Param("busca") String busca,
                        @Param("status") StatusEvento status);
}
