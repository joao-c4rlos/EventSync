package br.com.eventsync.evento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    Optional<Evento> findByIdAndOrganizadorId(Long id, Long organizadorId);

    Optional<Evento> findBySlug(String slug);

    boolean existsBySlug(String slug);

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
